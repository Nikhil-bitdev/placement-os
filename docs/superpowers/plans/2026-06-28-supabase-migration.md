# Supabase Data Persistence — Implementation Plan

> **For agentic workers:** Sub-agent driven development recommended. Tasks use checkbox (`- [ ]`) syntax.

**Goal:** Migrate all user data from localStorage-only to Supabase (PostgreSQL), enabling cross-device persistence for a college-wide deployment.

**Architecture:** Keep localStorage as a fast render cache. On mount, load from Supabase and merge into each Zustand store (overwriting localStorage). On every mutation, write to both localStorage (instant) and Supabase (fire-and-forget debounced). This gives instant page loads + eventual cross-device consistency with zero breaking changes to existing store consumers.

**Tech Stack:** Zustand, Supabase (already wired), `@supabase/supabase-js`

**Data flow:**
```
User action → Zustand store mutation → localStorage (sync, instant)
                                   → Supabase upsert (async, debounced)

Page load   → localStorage hydrate (instant render)
             → Supabase fetch (async) → merge into store (overwrites local)
```

## Global Constraints

- Must not break any existing UI — all components consume stores via `useXStore()` hooks, those signatures stay identical
- Keep localStorage working as fallback for offline use
- RLS policies already exist on all tables — ensure all DB operations use `auth.uid()`
- The existing `supabase/schema.sql` is the source of truth for table definitions
- All new DB columns must be added to schema.sql

---

## Phase 0: Schema Updates

Add missing columns to existing tables + create new tables needed by the stores.

### Task 0.1: Update `supabase/schema.sql` — add missing columns

**File:** Modify `supabase/schema.sql`

```sql
-- =============================================
-- COLUMN ADDITIONS (run as ALTER or add to schema)
-- =============================================

-- profiles: add quick_notes and identity_skipped
alter table profiles add column if not exists quick_notes text default '';
alter table profiles add column if not exists identity_skipped boolean default false;

-- dsa_progress: add missing store fields
alter table dsa_progress add column if not exists attempts integer default 0;
alter table dsa_progress add column if not exists favorite boolean default false;
alter table dsa_progress add column if not exists revision_status text default 'new';
alter table dsa_progress add column if not exists time_taken integer default 0;

-- roadmap_progress: add missing store fields
alter table roadmap_progress add column if not exists hours_spent real default 0;
alter table roadmap_progress add column if not exists mini_projects jsonb default '[]';
alter table roadmap_progress add column if not exists main_project text default '';
alter table roadmap_progress add column if not exists revision_count integer default 0;
alter table roadmap_progress add column if not exists confidence integer default 1;
alter table roadmap_progress add column if not exists estimated_remaining_hours integer default 0;

-- core_subjects_progress: store the deeply nested data as jsonb (topics + interview questions)
alter table core_subjects_progress add column if not exists status text default 'not-started';
alter table core_subjects_progress add column if not exists chapters_completed integer default 0;
alter table core_subjects_progress add column if not exists total_chapters integer default 0;
alter table core_subjects_progress add column if not exists last_studied timestamptz;
alter table core_subjects_progress add column if not exists interview_readiness integer default 0;
alter table core_subjects_progress add column if not exists topics jsonb default '[]';

-- gamification: add achievements array
alter table gamification add column if not exists achievements jsonb default '[]';

-- =============================================
-- NEW TABLE: dsa_pattern_progress
-- =============================================
create table if not exists dsa_pattern_progress (
  pattern_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  solved boolean default false,
  completed_at timestamptz,
  primary key (pattern_id, user_id)
);

alter table dsa_pattern_progress enable row level security;

create policy "Users can view own pattern progress"
  on dsa_pattern_progress for select using (auth.uid() = user_id);

create policy "Users can upsert own pattern progress"
  on dsa_pattern_progress for insert with check (auth.uid() = user_id);

create policy "Users can update own pattern progress"
  on dsa_pattern_progress for update using (auth.uid() = user_id);

create policy "Users can delete own pattern progress"
  on dsa_pattern_progress for delete using (auth.uid() = user_id);
```

- [ ] Add column additions to `supabase/schema.sql`
- [ ] Add `dsa_pattern_progress` table to `supabase/schema.sql`
- [ ] Run the SQL in Supabase dashboard

---

## Phase 1: Sync Infrastructure

Create a generic hook that handles loading from Supabase and saving back with debounce.

### Task 1.1: Create `src/hooks/useSupabaseSync.ts`

**Files:**
- Create: `src/hooks/useSupabaseSync.ts`
- This file depends on none

This hook encapsulates the pattern:
1. Accept a store, a table name, a `load` function (fetch DB → store data), and a `save` function (store data → DB upsert)
2. On mount (when user is authenticated), call `load` and merge into store
3. Subscribe to store changes with a debounce, call `save`

```typescript
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

type StoreApi<T> = {
  getState: () => T
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void
  subscribe: (listener: (state: T, prevState: T) => void) => () => void
}

export function useSupabaseSync<T extends Record<string, any>>(
  store: StoreApi<T>,
  config: {
    userId: string | null
    enabled: boolean
    load: (userId: string) => Promise<Partial<T> | null>
    save: (userId: string, state: T) => Promise<void>
    debounceMs?: number
  },
) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const prevStateRef = useRef<string>()

  // Load from DB on mount / user change
  useEffect(() => {
    if (!config.userId || !config.enabled) return
    config.load(config.userId).then((dbData) => {
      if (dbData) {
        store.setState(dbData)
      }
    })
  }, [config.userId, config.enabled])

  // Debounced save on every state change
  useEffect(() => {
    if (!config.userId || !config.enabled) return
    const unsub = store.subscribe((state) => {
      const serialized = JSON.stringify(state)
      if (serialized === prevStateRef.current) return
      prevStateRef.current = serialized

      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        config.save(config.userId!, state)
      }, config.debounceMs ?? 1000)
    })
    return () => {
      unsub()
      clearTimeout(timerRef.current)
    }
  }, [config.userId, config.enabled])
}
```

Also add the `StoreApi` type to zustand's exports context — it's just the shape returned by `create()`. For simplicity we export it from the hook file.

- [ ] Create `src/hooks/useSupabaseSync.ts` with the code above
- [ ] Verify the hook type-checks with `npx tsc --noEmit`

### Task 1.2: Update `src/lib/supabaseSync.ts` — add missing helpers

**Files:**
- Modify: `src/lib/supabaseSync.ts`

Add helper functions for each store type. These are thin wrappers that take a userId + store data and upsert to the correct table.

```typescript
// Add these exports to the existing file:

// --- Tasks (planner) ---
export async function fetchTasks(userId: string): Promise<any[]> {
  const { data } = await supabase.from('tasks').select('*').eq('user_id', userId)
  return data ?? []
}

export async function upsertTasks(userId: string, tasks: any[]): Promise<void> {
  const rows = tasks.map(t => ({
    id: t.id,
    user_id: userId,
    title: t.title,
    category: t.category,
    date: t.date,
    start_time: t.startTime,
    end_time: t.endTime,
    status: t.status,
    priority: t.priority,
    difficulty: t.difficulty,
    notes: t.notes,
    order: t.order,
    completed_at: t.completedAt,
    created_at: t.createdAt,
  }))
  if (rows.length === 0) return
  const { error } = await supabase.from('tasks').upsert(rows, { onConflict: 'id' })
  if (error) console.error('supabase: upsert tasks failed', error)
}

// --- Gamification ---
export async function fetchGamification(userId: string): Promise<any | null> {
  const { data } = await supabase.from('gamification').select('*').eq('user_id', userId).single()
  return data ?? null
}

// --- DSA Progress ---
export async function fetchDsaProgress(userId: string): Promise<any[]> {
  const { data } = await supabase.from('dsa_progress').select('*').eq('user_id', userId)
  return data ?? []
}

// --- Roadmap Progress ---
export async function fetchRoadmapProgress(userId: string): Promise<any[]> {
  const { data } = await supabase.from('roadmap_progress').select('*').eq('user_id', userId)
  return data ?? []
}

// --- Core Subjects Progress ---
export async function fetchCoreSubjectsProgress(userId: string): Promise<any[]> {
  const { data } = await supabase.from('core_subjects_progress').select('*').eq('user_id', userId)
  return data ?? []
}

export async function upsertCoreSubjectsProgress(userId: string, subjects: any[]): Promise<void> {
  const rows = subjects.map(s => ({
    id: s.id,
    user_id: userId,
    subject: s.name,
    status: s.status,
    completed: s.status === 'completed',
    chapters_completed: s.chaptersCompleted,
    total_chapters: s.totalChapters,
    hours_studied: s.hoursStudied,
    last_studied: s.lastStudied,
    interview_readiness: s.interviewReadiness,
    topics: JSON.stringify(s.topics ?? []),
    notes: '',
  }))
  if (rows.length === 0) return
  const { error } = await supabase.from('core_subjects_progress').upsert(rows, { onConflict: 'id,user_id' })
  if (error) console.error('supabase: upsert core subjects failed', error)
}

// --- DSA Pattern Progress ---
export async function fetchPatternProgress(userId: string): Promise<any[]> {
  const { data } = await supabase.from('dsa_pattern_progress').select('*').eq('user_id', userId)
  return data ?? []
}

export async function upsertPatternProgress(userId: string, ids: string[]): Promise<void> {
  const rows = ids.map(pattern_id => ({
    pattern_id,
    user_id: userId,
    solved: true,
    completed_at: new Date().toISOString(),
  }))
  if (rows.length === 0) return
  const { error } = await supabase.from('dsa_pattern_progress').upsert(rows, { onConflict: 'pattern_id,user_id' })
  if (error) console.error('supabase: upsert pattern progress failed', error)
}
```

- [ ] Add all helper functions to `src/lib/supabaseSync.ts`
- [ ] Verify compilation

---

## Phase 2: Migrate Stores One by One

Each store migration follows the same pattern:
1. Import `useSupabaseSync` and the relevant helper from `supabaseSync`
2. Add a `_hydrated` flag to the store to prevent save-on-load from re-triggering
3. In the component that renders the store's page, add the sync hook call
4. For the initial migration: create a one-time function to dump localStorage data to Supabase

### Task 2.1: Planner Store → `tasks` table

**Files:**
- Modify: `src/store/plannerStore.ts`
- Create: `src/components/sync/PlannerSync.tsx`

This is the simplest store — schema already matches 1:1.

Add a `_hydrated` field to the state and a `_setTasks` action to allow the sync layer to replace all tasks:

```typescript
// Add to PlannerState interface:
interface PlannerState {
  tasks: PlannerTask[]
  _hydrated: boolean
  _setTasks: (tasks: PlannerTask[]) => void
  // ... existing actions unchanged
}

// Add to store implementation:
_hydrated: false,
_setTasks: (tasks) => set({ tasks, _hydrated: true }),
```

Create a sync component:

```typescript
// src/components/sync/PlannerSync.tsx
import { useAuth } from '../../contexts/AuthContext'
import { usePlannerStore } from '../../store/plannerStore'
import { useSupabaseSync } from '../../hooks/useSupabaseSync'
import { fetchTasks, upsertTasks } from '../../lib/supabaseSync'

export function PlannerSync() {
  const { user } = useAuth()
  const store = usePlannerStore

  useSupabaseSync(store as any, {
    userId: user?.id ?? null,
    enabled: !!user,
    load: async (userId) => {
      const tasks = await fetchTasks(userId)
      if (tasks.length > 0) {
        return {
          tasks: tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            date: t.date,
            category: t.category,
            startTime: t.start_time,
            endTime: t.end_time,
            status: t.status,
            priority: t.priority,
            difficulty: t.difficulty,
            notes: t.notes,
            order: t.order,
            completedAt: t.completed_at,
            createdAt: t.created_at,
          })),
          _hydrated: true,
        }
      }
      // If DB is empty but localStorage has data (first-time migration),
      // save local data to DB
      const currentState = store.getState()
      if (currentState.tasks.length > 0) {
        await upsertTasks(userId, currentState.tasks)
        return { _hydrated: true }
      }
      return { _hydrated: true }
    },
    save: async (userId, state) => {
      await upsertTasks(userId, state.tasks)
    },
  })

  return null
}
```

- [ ] Add `_hydrated` and `_setTasks` to `plannerStore.ts`
- [ ] Create `src/components/sync/PlannerSync.tsx`
- [ ] Mount `PlannerSync` in `Layout.tsx` (or per-page)
- [ ] Verify tasks load from DB and persist across page reload

### Task 2.2: Gamification Store → `gamification` table + `profiles` table

**Files:**
- Modify: `src/store/gamificationStore.ts`
- Create: `src/components/sync/GamificationSync.tsx`

The gamification store has `displayName` (goes to `profiles.name`) and `xp/level/achievements` (goes to `gamification` table).

Add `_hydrated` and `_setGamification` to the store.

Sync component loads from both tables and merges:

```typescript
load: async (userId) => {
  const [profileResult, gamificationResult] = await Promise.all([
    supabase.from('profiles').select('name, quick_notes, identity_skipped').eq('id', userId).single(),
    supabase.from('gamification').select('*').eq('user_id', userId).single(),
  ])

  const update: any = { _hydrated: true }
  if (profileResult.data) {
    update.displayName = profileResult.data.name || 'User'
  }
  if (gamificationResult.data) {
    const g = gamificationResult.data
    update.xp = g.xp ?? 0
    update.level = g.level ?? 1
    update.achievements = g.achievements ?? []
  }
  return update
},
save: async (userId, state) => {
  await Promise.all([
    supabase.from('profiles').upsert({ id: userId, name: state.displayName }, { onConflict: 'id' }),
    upsertGamification(userId, { xp: state.xp, level: state.level, achievements: JSON.stringify(state.achievements) }),
  ])
},
```

- [ ] Add `_hydrated` and `_setGamification` to `gamificationStore.ts`
- [ ] Create `src/components/sync/GamificationSync.tsx`
- [ ] Mount in Layout
- [ ] Verify XP and name persist

### Task 2.3: LeetCode Store → `leetcode_cache` table

**Files:**
- Modify: `src/store/leetcodeStore.ts`
- Create: `src/components/sync/LeetCodeSync.tsx`

The `leetcode_cache` table uses jsonb for `stats` and `activity`. The rest of the store data (topicProgress, problemHistory, etc.) is derived from these two fields + computed values. Store the full state as a jsonb column.

Add a `stats` jsonb field and a `full_state` jsonb field to the table:

```sql
alter table leetcode_cache add column if not exists full_state jsonb default '{}';
```

Sync component:

```typescript
load: async (userId) => {
  const { data } = await supabase.from('leetcode_cache').select('*').eq('user_id', userId).single()
  if (data?.full_state) {
    return { ...data.full_state as any, _hydrated: true }
  }
  // Fall back to partial fields
  if (data) {
    return {
      username: data.username ?? '',
      stats: data.stats ?? {},
      activity: data.activity ?? [],
      lastSynced: data.last_synced,
      _hydrated: true,
    }
  }
  return { _hydrated: true }
},
save: async (userId, state) => {
  const { _hydrated: _, _setLeetCode: __, ...rest } = state
  await supabase.from('leetcode_cache').upsert({
    user_id: userId,
    username: rest.username,
    stats: rest.stats,
    activity: rest.activity,
    full_state: rest,
    last_synced: rest.lastSynced,
  }, { onConflict: 'user_id' })
},
```

- [ ] Add `_hydrated` to `leetcodeStore.ts`
- [ ] Add `full_state` column to schema.sql
- [ ] Create `src/components/sync/LeetCodeSync.tsx`
- [ ] Mount in Layout
- [ ] Verify LeetCode data syncs

### Task 2.4: DSA Store → `dsa_progress` table

**Files:**
- Modify: `src/store/dsaStore.ts`
- Create: `src/components/sync/DSASync.tsx`

The store has `progress: Record<string, DSAProblemProgress>` and `expandedSections: Record<string, boolean>`.

`dsa_progress` table uses composite PK `(problem_id, user_id)`. Sync converts the flat record to rows and back.

```typescript
load: async (userId) => {
  const rows = await fetchDsaProgress(userId)
  const progress: Record<string, any> = {}
  for (const row of rows) {
    progress[row.problem_id] = {
      solved: row.status === 'solved',
      attempts: row.attempts ?? 0,
      favorite: row.favorite ?? false,
      revisionStatus: row.revision_status ?? 'new',
      notes: row.notes ?? '',
      timeTaken: row.time_taken ?? 0,
      completedAt: row.completed_at,
    }
  }
  return { progress, _hydrated: true }
},
save: async (userId, state) => {
  const rows = Object.entries(state.progress).map(([problem_id, p]: [string, any]) => ({
    problem_id,
    user_id: userId,
    status: p.solved ? 'solved' : 'unsolved',
    attempts: p.attempts,
    favorite: p.favorite,
    revision_status: p.revisionStatus,
    notes: p.notes,
    time_taken: p.timeTaken,
    completed_at: p.completedAt,
  }))
  await upsertDsaProgress(rows)
},
```

- [ ] Add `_hydrated` to `dsaStore.ts`
- [ ] Create `src/components/sync/DSASync.tsx`
- [ ] Mount in Layout
- [ ] Verify DSA progress syncs

### Task 2.5: Roadmap Store → `roadmap_progress` table

**Files:**
- Modify: `src/store/roadmapStore.ts`
- Create: `src/components/sync/RoadmapSync.tsx`

Same pattern as DSA — flat record converted to rows and back.

```typescript
load: async (userId) => {
  const rows = await fetchRoadmapProgress(userId)
  const techProgress: Record<string, any> = {}
  for (const row of rows) {
    techProgress[row.tech_id] = {
      status: row.status === 'locked' ? 'not-started' : row.status,
      hoursSpent: row.hours_spent ?? 0,
      notes: row.notes ?? '',
      miniProjects: row.mini_projects ?? [],
      mainProject: row.main_project ?? '',
      revisionCount: row.revision_count ?? 0,
      confidence: row.confidence ?? 1,
      completionDate: row.completion_date,
      estimatedRemainingHours: row.estimated_remaining_hours ?? 0,
    }
  }
  return { techProgress, _hydrated: true }
},
save: async (userId, state) => {
  const rows = Object.entries(state.techProgress).map(([tech_id, p]: [string, any]) => ({
    tech_id,
    user_id: userId,
    status: p.status,
    hours_spent: p.hoursSpent,
    notes: p.notes,
    mini_projects: p.miniProjects,
    main_project: p.mainProject,
    revision_count: p.revisionCount,
    confidence: p.confidence,
    completion_date: p.completionDate,
    estimated_remaining_hours: p.estimatedRemainingHours,
  }))
  await upsertRoadmapProgress(rows)
},
```

- [ ] Add `_hydrated` to `roadmapStore.ts`
- [ ] Create `src/components/sync/RoadmapSync.tsx`
- [ ] Mount in Layout
- [ ] Verify roadmap progress syncs

### Task 2.6: Core Subjects Store → `core_subjects_progress` table

**Files:**
- Modify: `src/store/coreSubjectsStore.ts`
- Create: `src/components/sync/CoreSubjectsSync.tsx`

This store has deeply nested data (subjects → topics → interview questions). Store as jsonb in the `topics` column.

```typescript
load: async (userId) => {
  const rows = await fetchCoreSubjectsProgress(userId)
  if (rows.length > 0) {
    const subjects = rows.map((row: any) => ({
      id: row.id,
      name: row.subject,
      icon: '', // Static data, populated from seed
      color: '', // Static data, populated from seed
      chaptersCompleted: row.chapters_completed ?? 0,
      totalChapters: row.total_chapters ?? 0,
      hoursStudied: row.hours_studied ?? 0,
      status: row.status ?? 'not-started',
      lastStudied: row.last_studied,
      topics: row.topics ?? [],
      interviewReadiness: row.interview_readiness ?? 0,
      videoUrl: '', // Static data from seed
    }))
    return { subjects, _hydrated: true }
  }
  return { _hydrated: true }
},
save: async (userId, state) => {
  await upsertCoreSubjectsProgress(userId, state.subjects)
},
```

- [ ] Add `_hydrated` to `coreSubjectsStore.ts`
- [ ] Create `src/components/sync/CoreSubjectsSync.tsx`
- [ ] Mount in Layout
- [ ] Verify core subjects sync

### Task 2.7: Extra localStorage keys

**Files:**
- Modify: `src/components/sync/GamificationSync.tsx` (already handles profiles)
- Modify: `src/pages/DSAPatterns.tsx` (pattern_solved_ids → dsa_pattern_progress table)

The extra keys to migrate:
- `placement-os-streak` / `placement-os-streak-last` → `gamification.streak` (already exists!)
- `placement-os-identity-skipped` → `profiles.identity_skipped`
- `placement-os-achievements` → `gamification.achievements` (migrated in Task 2.2)
- `placement-os-quick-notes` → `profiles.quick_notes`
- `pattern_solved_ids` → `dsa_pattern_progress` table

Handle in existing sync components:
- GamificationSync already saves to profiles + gamification
- Create DsaPatternSync for pattern_solved_ids

```typescript
// src/components/sync/DsaPatternSync.tsx
export function DsaPatternSync() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    // Load from DB on mount
    fetchPatternProgress(user.id).then(rows => {
      const ids = rows.filter(r => r.solved).map(r => r.pattern_id)
      if (ids.length > 0) {
        localStorage.setItem('pattern_solved_ids', JSON.stringify(ids))
      }
    })
  }, [user?.id])

  // On every change to pattern_solved_ids, save to DB
  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      const raw = localStorage.getItem('pattern_solved_ids')
      const ids = raw ? JSON.parse(raw) : []
      // Debounced already via interval + compare
    }, 5000)
    return () => clearInterval(interval)
  }, [user?.id])
}
```

- [ ] Update GamificationSync to handle streak, identity_skipped, quick_notes
- [ ] Create `src/components/sync/DsaPatternSync.tsx`
- [ ] Verify all extra keys sync

---

## Phase 3: One-Time Migration Script

Before the sync hooks take over, existing users have all their data in localStorage. Create a one-time migration that dumps localStorage to Supabase on first login after deploy.

**File:** `src/lib/migrateLocalStorageToSupabase.ts`

```typescript
import { supabase } from './supabase'
import { upsertTasks, upsertDsaProgress, upsertRoadmapProgress, upsertGamification, upsertLeetCodeCache } from './supabaseSync'

export async function migrateLocalStorageToSupabase(userId: string) {
  const flagKey = `placement-os-migrated-${userId}`
  if (localStorage.getItem(flagKey)) return // Already migrated

  // Read all persist stores
  const stores = [
    { key: 'placement-os-planner', fn: async (data: any) => {
      if (data?.state?.tasks?.length) await upsertTasks(userId, data.state.tasks)
    }},
    { key: 'placement-os-gamification', fn: async (data: any) => {
      if (data?.state) await upsertGamification(userId, {
        xp: data.state.xp,
        level: data.state.level,
        achievements: JSON.stringify(data.state.achievements ?? []),
      })
    }},
    { key: 'placement-os-leetcode', fn: async (data: any) => {
      if (data?.state) {
        const { isSyncing, syncError, goals, dailyGoalCompleted, ...rest } = data.state
        await upsertLeetCodeCache(userId, { ...rest })
      }
    }},
    // ... etc for other stores
  ]

  for (const { key, fn } of stores) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) await fn(JSON.parse(raw))
    } catch (e) { /* skip */ }
  }

  localStorage.setItem(flagKey, 'true')
}
```

Call this from AuthContext after sign in, before the sync hooks would overwrite.

- [ ] Create `src/lib/migrateLocalStorageToSupabase.ts`
- [ ] Call from `AuthContext` on SIGNED_IN (first time only)
- [ ] Test migration with real data

---

## Phase 4: AuthContext Cleanup

Once all data lives in Supabase, the localStorage-based user isolation logic is no longer needed.

### Task 4.1: Simplify AuthContext

**Files:**
- Modify: `src/contexts/AuthContext.tsx`

Remove:
- `clearStorage()` — no longer needed (data is per-user in DB)
- `resetStores()` — no longer needed
- `clearForNewUser()` — no longer needed
- `LAST_USER_KEY` — no longer needed
- `STORAGE_KEYS` — no longer needed
- All store imports used only for reset

The auth flow becomes:
- Sign in → load from DB via sync hooks (no localStorage clearing)
- Sign out → just supabase.auth.signOut() (no cleanup)
- Sign in as different user → sync hooks load that user's DB data into stores

```typescript
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
      })
      .catch(() => console.warn('Supabase session check failed'))
      .finally(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
```

- [ ] Remove localStorage clear/reset from AuthContext
- [ ] Remove unused imports
- [ ] Verify sign-in/sign-out flow still works

### Task 4.2: Remove old persist keys from localStorage

Add a one-time cleanup in `App.tsx` to remove old persist keys that are now managed by the sync layer:

```typescript
const LEGACY_KEYS = [
  'placement-os-gamification',
  'placement-os-leetcode',
  'placement-os-dsa',
  'placement-os-planner',
  'placement-os-roadmap',
  'placement-os-core-subjects',
  'placement-os-streak',
  'placement-os-streak-last',
  'placement-os-last-user',
]
// In App.tsx or a useEffect somewhere:
// Remove after confirming migration is complete
```

- [ ] Add cleanup in App.tsx for old keys
- [ ] Verify no regressions

---

## Phase 5: Integration & Testing

### Task 5.1: Mount all sync components in Layout

**File:** Modify `src/components/Layout.tsx`

```typescript
import { PlannerSync } from './sync/PlannerSync'
import { GamificationSync } from './sync/GamificationSync'
// ... other sync components

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <PlannerSync />
      <GamificationSync />
      <LeetCodeSync />
      <DSASync />
      <RoadmapSync />
      <CoreSubjectsSync />
      <DsaPatternSync />
      {/* ... rest of layout */}
    </>
  )
}
```

All sync components render `null` — they exist only to call the hook.

- [ ] Mount all sync components in `Layout.tsx`
- [ ] Verify no console errors

### Task 5.2: End-to-end test

Test scenarios:
1. Fresh signup → data saved to DB → page reload → data restored
2. Device A: create data → sign out → Device B: sign in as same user → data visible
3. User A creates data → User B signs in on same device → User B's data (not A's)
4. Offline → make changes → online → data syncs to DB

- [ ] Test all 4 scenarios
- [ ] Fix any issues found

---

## Execution Order

1. Task 0.1 (Schema updates) — run SQL in Supabase first
2. Task 1.1 (useSupabaseSync hook)
3. Task 1.2 (supabaseSync helpers)
4. Task 2.1–2.7 (store migrations, one at a time, test each)
5. Task 3.1 (migration script)
6. Task 4.1–4.2 (AuthContext cleanup)
7. Task 5.1–5.2 (integration + testing)

Each store migration (Tasks 2.x) is independently testable — mount the sync component and verify data round-trips before moving to the next.
