import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Tables = 'profiles' | 'tasks' | 'dsa_progress' | 'roadmap_progress' | 'core_subjects_progress' | 'pomodoro_sessions' | 'gamification' | 'leetcode_cache' | 'activity_log'
