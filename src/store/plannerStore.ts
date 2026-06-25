import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PlannerCategory =
  | 'DSA' | 'Development' | 'Core Subjects' | 'Revision'
  | 'Projects' | 'Mock Interview' | 'Aptitude' | 'Behavioral'

export interface PlannerTask {
  id: string
  date: string
  category: PlannerCategory
  startTime: string
  endTime: string
  status: 'pending' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  notes: string
  completedAt: string | null
}

interface PlannerState {
  tasks: PlannerTask[]
  addTask: (task: Omit<PlannerTask, 'id' | 'completedAt'>) => void
  updateTask: (id: string, updates: Partial<PlannerTask>) => void
  deleteTask: (id: string) => void
  getTasksForDate: (date: string) => PlannerTask[]
  toggleStatus: (id: string) => void
}

const generateId = () =>
  crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: generateId(),
              completedAt: null,
            },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      getTasksForDate: (date) => get().tasks.filter((t) => t.date === date),

      toggleStatus: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === 'done' ? 'pending' : 'done',
                  completedAt: t.status === 'done' ? null : new Date().toISOString(),
                }
              : t,
          ),
        })),
    }),
    { name: 'placement-os-planner' },
  ),
)
