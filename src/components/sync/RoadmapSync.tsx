import { useAuth } from '../../contexts/AuthContext'
import { useRoadmapStore } from '../../store/roadmapStore'
import { useSupabaseSync } from '../../hooks/useSupabaseSync'
import { fetchRoadmapProgress, upsertRoadmapProgress } from '../../lib/supabaseSync'

export function RoadmapSync() {
  const { user } = useAuth()
  const store = useRoadmapStore

  useSupabaseSync(store as any, {
    userId: user?.id ?? null,
    enabled: !!user,
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
  })

  return null
}
