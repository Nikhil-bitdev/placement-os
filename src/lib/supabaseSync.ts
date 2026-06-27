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
