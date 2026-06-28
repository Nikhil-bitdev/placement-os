import { useAuth } from '../../contexts/AuthContext'
import { useLeetCodeStore } from '../../store/leetcodeStore'
import { useSupabaseSync } from '../../hooks/useSupabaseSync'
import { supabase } from '../../lib/supabase'

export function LeetCodeSync() {
  const { user } = useAuth()
  const store = useLeetCodeStore

  useSupabaseSync(store as any, {
    userId: user?.id ?? null,
    enabled: !!user,
    load: async (userId) => {
      const { data } = await supabase.from('leetcode_cache').select('*').eq('user_id', userId).single()
      if (data?.full_state && Object.keys(data.full_state).length > 0) {
        return { ...data.full_state as any, _hydrated: true }
      }
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
        last_synced: rest.lastSynced ?? null,
      }, { onConflict: 'user_id' })
    },
  })

  return null
}
