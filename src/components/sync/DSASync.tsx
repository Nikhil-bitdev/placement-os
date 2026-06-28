import { useAuth } from '../../contexts/AuthContext'
import { useDSAStore } from '../../store/dsaStore'
import { useSupabaseSync } from '../../hooks/useSupabaseSync'
import { fetchDsaProgress, upsertDsaProgress } from '../../lib/supabaseSync'

export function DSASync() {
  const { user } = useAuth()
  const store = useDSAStore

  useSupabaseSync(store as any, {
    userId: user?.id ?? null,
    enabled: !!user,
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
  })

  return null
}
