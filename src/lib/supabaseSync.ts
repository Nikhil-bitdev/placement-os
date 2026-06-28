import { supabase } from './supabase'

function getUserId(): string | null {
  return supabase.auth.getSession().then(s => s.data.session?.user?.id ?? null) as unknown as string | null
}

export async function fetchRows<T>(table: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*')
  if (error) {
    console.error(`supabase: fetch ${table} failed`, error)
    return []
  }
  return data as T[]
}

export async function upsertRows(table: string, rows: Record<string, unknown>[]): Promise<void> {
  if (rows.length === 0) return
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' })
  if (error) console.error(`supabase: upsert ${table} failed`, error)
}

export async function deleteRows(table: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const { error } = await supabase.from(table).delete().in('id', ids)
  if (error) console.error(`supabase: delete ${table} failed`, error)
}

export async function upsertRecord(table: string, record: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from(table).upsert(record, { onConflict: 'id' })
  if (error) console.error(`supabase: upsert ${table} failed`, error)
}

export async function deleteRecord(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) console.error(`supabase: delete ${table} failed`, error)
}

export async function upsertDsaProgress(rows: { problem_id: string; user_id: string; status: string; completed_at: string | null; notes: string }[]): Promise<void> {
  if (rows.length === 0) return
  const { error } = await supabase.from('dsa_progress').upsert(rows, { onConflict: 'problem_id,user_id' })
  if (error) console.error('supabase: upsert dsa_progress failed', error)
}

export async function upsertRoadmapProgress(rows: { tech_id: string; user_id: string; status: string; completion_date: string | null; notes: string }[]): Promise<void> {
  if (rows.length === 0) return
  const { error } = await supabase.from('roadmap_progress').upsert(rows, { onConflict: 'tech_id,user_id' })
  if (error) console.error('supabase: upsert roadmap_progress failed', error)
}

export async function upsertGamification(userId: string, data: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('gamification').upsert({ user_id: userId, ...data }, { onConflict: 'user_id' })
  if (error) console.error('supabase: upsert gamification failed', error)
}

export async function upsertLeetCodeCache(userId: string, data: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('leetcode_cache').upsert({ user_id: userId, ...data }, { onConflict: 'user_id' })
  if (error) console.error('supabase: upsert leetcode_cache failed', error)
}

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
