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
