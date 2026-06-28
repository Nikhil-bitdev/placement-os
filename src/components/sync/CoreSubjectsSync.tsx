import { useAuth } from '../../contexts/AuthContext'
import { useCoreSubjectsStore } from '../../store/coreSubjectsStore'
import { useSupabaseSync } from '../../hooks/useSupabaseSync'
import { fetchCoreSubjectsProgress, upsertCoreSubjectsProgress } from '../../lib/supabaseSync'

export function CoreSubjectsSync() {
  const { user } = useAuth()
  const store = useCoreSubjectsStore

  useSupabaseSync(store as any, {
    userId: user?.id ?? null,
    enabled: !!user,
    load: async (userId) => {
      const rows = await fetchCoreSubjectsProgress(userId)
      if (rows.length > 0) {
        const subjects = rows.map((row: any) => ({
          id: row.id,
          name: row.subject,
          icon: '',
          color: '',
          chaptersCompleted: row.chapters_completed ?? 0,
          totalChapters: row.total_chapters ?? 0,
          hoursStudied: row.hours_studied ?? 0,
          status: row.status ?? 'not-started',
          lastStudied: row.last_studied,
          topics: row.topics ?? [],
          interviewReadiness: row.interview_readiness ?? 0,
          videoUrl: '',
        }))
        return { subjects, _hydrated: true }
      }
      return { _hydrated: true }
    },
    save: async (userId, state) => {
      await upsertCoreSubjectsProgress(userId, state.subjects)
    },
  })

  return null
}
