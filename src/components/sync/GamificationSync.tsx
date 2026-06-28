import { useAuth } from '../../contexts/AuthContext'
import { useGamificationStore } from '../../store/gamificationStore'
import { useSupabaseSync } from '../../hooks/useSupabaseSync'
import { supabase } from '../../lib/supabase'
import { upsertGamification } from '../../lib/supabaseSync'

export function GamificationSync() {
  const { user } = useAuth()
  const store = useGamificationStore

  useSupabaseSync(store as any, {
    userId: user?.id ?? null,
    enabled: !!user,
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
  })

  return null
}
