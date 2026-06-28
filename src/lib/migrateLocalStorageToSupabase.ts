import { supabase } from './supabase'
import { upsertTasks, upsertDsaProgress, upsertRoadmapProgress, upsertGamification, upsertLeetCodeCache, upsertCoreSubjectsProgress, upsertPatternProgress } from './supabaseSync'

export async function migrateLocalStorageToSupabase(userId: string) {
  const flagKey = `placement-os-migrated-${userId}`
  if (localStorage.getItem(flagKey)) return

  const stores = [
    {
      key: 'placement-os-planner',
      fn: async (data: any) => {
        if (data?.state?.tasks?.length) await upsertTasks(userId, data.state.tasks)
      },
    },
    {
      key: 'placement-os-gamification',
      fn: async (data: any) => {
        if (data?.state) {
          await upsertGamification(userId, {
            xp: data.state.xp,
            level: data.state.level,
            achievements: JSON.stringify(data.state.achievements ?? []),
            streak: parseInt(localStorage.getItem('placement-os-streak') || '0', 10),
          })
          await supabase.from('profiles').upsert(
            { id: userId, name: data.state.displayName ?? 'User' },
            { onConflict: 'id' },
          )
        }
      },
    },
    {
      key: 'placement-os-leetcode',
      fn: async (data: any) => {
        if (data?.state) {
          const { isSyncing, syncError, goals, dailyGoalCompleted, ...rest } = data.state
          await upsertLeetCodeCache(userId, { ...rest })
        }
      },
    },
    {
      key: 'placement-os-dsa',
      fn: async (data: any) => {
        if (data?.state?.progress) {
          const rows = Object.entries(data.state.progress).map(([problem_id, p]: [string, any]) => ({
            problem_id,
            user_id: userId,
            status: p.solved ? 'solved' : 'unsolved',
            attempts: p.attempts ?? 0,
            favorite: p.favorite ?? false,
            revision_status: p.revisionStatus ?? 'new',
            notes: p.notes ?? '',
            time_taken: p.timeTaken ?? 0,
            completed_at: p.completedAt ?? null,
          }))
          if (rows.length > 0) await upsertDsaProgress(rows)
        }
      },
    },
    {
      key: 'placement-os-roadmap',
      fn: async (data: any) => {
        if (data?.state?.techProgress) {
          const rows = Object.entries(data.state.techProgress).map(([tech_id, p]: [string, any]) => ({
            tech_id,
            user_id: userId,
            status: p.status ?? 'not-started',
            hours_spent: p.hoursSpent ?? 0,
            notes: p.notes ?? '',
            mini_projects: p.miniProjects ?? [],
            main_project: p.mainProject ?? '',
            revision_count: p.revisionCount ?? 0,
            confidence: p.confidence ?? 1,
            completion_date: p.completionDate ?? null,
            estimated_remaining_hours: p.estimatedRemainingHours ?? 0,
          }))
          if (rows.length > 0) await upsertRoadmapProgress(rows)
        }
      },
    },
    {
      key: 'placement-os-core-subjects',
      fn: async (data: any) => {
        if (data?.state?.subjects?.length) await upsertCoreSubjectsProgress(userId, data.state.subjects)
      },
    },
  ]

  for (const { key, fn } of stores) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) await fn(JSON.parse(raw))
    } catch (e) {
      console.warn(`Migration: failed to migrate ${key}`, e)
    }
  }

  // Migrate pattern_solved_ids
  try {
    const raw = localStorage.getItem('pattern_solved_ids')
    if (raw) {
      const ids = JSON.parse(raw)
      if (Array.isArray(ids) && ids.length > 0) {
        await upsertPatternProgress(userId, ids)
      }
    }
  } catch (e) { /* skip */ }

  // Migrate quick_notes and identity_skipped to profiles
  try {
    const quickNotes = localStorage.getItem('placement-os-quick-notes') || ''
    const identitySkipped = localStorage.getItem('placement-os-identity-skipped') === 'true'
    await supabase.from('profiles').upsert({
      id: userId,
      quick_notes: quickNotes,
      identity_skipped: identitySkipped,
    }, { onConflict: 'id' })
  } catch (e) { /* skip */ }

  localStorage.setItem(flagKey, 'true')
}
