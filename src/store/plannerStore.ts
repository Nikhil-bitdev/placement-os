import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PlannerCategory =
  | 'DSA' | 'Full Stack' | 'Core Subjects' | 'Projects'
  | 'Revision' | 'Contest' | 'Interview' | 'Resume'

export type TaskDifficulty = 'easy' | 'medium' | 'hard'
export type TaskStatus = 'pending' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface PlannerTask {
  id: string
  title: string
  date: string
  category: PlannerCategory
  startTime: string
  endTime: string
  status: TaskStatus
  priority: TaskPriority
  difficulty: TaskDifficulty
  notes: string
  order: number
  completedAt: string | null
  createdAt: string
}

const CATEGORIES: PlannerCategory[] = [
  'DSA', 'Full Stack', 'Core Subjects', 'Projects',
  'Revision', 'Contest', 'Interview', 'Resume',
]

export const CATEGORY_COLORS: Record<PlannerCategory, string> = {
  DSA: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  'Full Stack': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'Core Subjects': 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  Projects: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  Revision: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  Contest: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  Interview: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  Resume: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
}

export const CATEGORY_BADGES: Record<PlannerCategory, string> = {
  DSA: 'bg-[#DBEAFE] text-[#2563EB] dark:bg-blue-500/20 dark:text-blue-400',
  'Full Stack': 'bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-500/20 dark:text-emerald-400',
  'Core Subjects': 'bg-[#FEF3C7] text-[#D97706] dark:bg-amber-500/20 dark:text-amber-400',
  Projects: 'bg-[#F3E8FF] text-[#9333EA] dark:bg-violet-500/20 dark:text-violet-400',
  Revision: 'bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-500/20 dark:text-sky-400',
  Contest: 'bg-[#FCE7F3] text-[#DB2777] dark:bg-rose-500/20 dark:text-rose-400',
  Interview: 'bg-[#CFFAFE] text-[#0891B2] dark:bg-cyan-500/20 dark:text-cyan-400',
  Resume: 'bg-[#FFEDD5] text-[#EA580C] dark:bg-orange-500/20 dark:text-orange-400',
}

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'text-[#64748B] bg-[#F1F5F9] dark:text-zinc-400 dark:bg-zinc-800',
  medium: 'text-[#D97706] bg-[#FEF3C7] dark:text-amber-400 dark:bg-amber-500/10',
  high: 'text-[#DC2626] bg-[#FEE2E2] dark:text-red-400 dark:bg-red-500/10',
}

export const DIFFICULTY_COLORS: Record<TaskDifficulty, string> = {
  easy: 'text-[#16A34A] bg-[#DCFCE7] dark:text-emerald-400 dark:bg-emerald-500/10',
  medium: 'text-[#D97706] bg-[#FEF3C7] dark:text-amber-400 dark:bg-amber-500/10',
  hard: 'text-[#DC2626] bg-[#FEE2E2] dark:text-red-400 dark:bg-red-500/10',
}

export { CATEGORIES }

interface PlannerState {
  tasks: PlannerTask[]
  addTask: (task: Omit<PlannerTask, 'id' | 'completedAt' | 'createdAt'>) => void
  updateTask: (id: string, updates: Partial<PlannerTask>) => void
  deleteTask: (id: string) => void
  duplicateTask: (id: string) => void
  toggleStatus: (id: string) => void
  reorderTasks: (date: string, fromIndex: number, toIndex: number) => void
  moveTaskToDate: (id: string, newDate: string, newOrder?: number) => void
}

const generateId = () =>
  crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (task) =>
        set((state) => {
          const tasksForDate = state.tasks.filter(t => t.date === task.date)
          const maxOrder = tasksForDate.reduce((max, t) => Math.max(max, t.order), -1)
          return {
            tasks: [
              ...state.tasks,
              {
                ...task,
                id: generateId(),
                order: task.order ?? maxOrder + 1,
                completedAt: null,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        }),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      duplicateTask: (id) =>
        set((state) => {
          const original = state.tasks.find((t) => t.id === id)
          if (!original) return state
          const tasksForDate = state.tasks.filter(t => t.date === original.date)
          const maxOrder = tasksForDate.reduce((max, t) => Math.max(max, t.order), -1)
          return {
            tasks: [
              ...state.tasks,
              {
                ...original,
                id: generateId(),
                title: `${original.title} (copy)`,
                status: 'pending',
                order: maxOrder + 1,
                completedAt: null,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        }),

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

      reorderTasks: (date, fromIndex, toIndex) =>
        set((state) => {
          const dateTasks = state.tasks
            .filter((t) => t.date === date)
            .sort((a, b) => a.order - b.order)

          if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= dateTasks.length || toIndex >= dateTasks.length) {
            return state
          }

          const [moved] = dateTasks.splice(fromIndex, 1)
          dateTasks.splice(toIndex, 0, moved)

          const reordered = new Map(dateTasks.map((t, i) => [t.id, i]))
          return {
            tasks: state.tasks.map((t) =>
              t.date === date && reordered.has(t.id)
                ? { ...t, order: reordered.get(t.id)! }
                : t,
            ),
          }
        }),

      moveTaskToDate: (id, newDate) =>
        set((state) => {
          const tasksForNewDate = state.tasks.filter(t => t.date === newDate)
          const maxOrder = tasksForNewDate.reduce((max, t) => Math.max(max, t.order), -1)
          return {
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, date: newDate, order: maxOrder + 1 } : t,
            ),
          }
        }),
    }),
    {
      name: 'placement-os-planner',
      version: 1,
      migrate: (persisted: any) => {
        if (persisted?.tasks) {
          persisted.tasks = persisted.tasks.map((t: any) => ({
            ...t,
            title: t.title ?? (t.notes?.replace(/^Auto-generated: /, '') || `${t.category} task`),
            difficulty: t.difficulty ?? 'medium',
            order: t.order ?? 0,
            createdAt: t.createdAt ?? t.completedAt ?? new Date().toISOString(),
          }))
        }
        return persisted
      },
    },
  ),
)
