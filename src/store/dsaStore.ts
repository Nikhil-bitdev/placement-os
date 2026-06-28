import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DSAProblemProgress, SectionStats } from '../types'
import allSections from '../data/dsa'
import { useGamificationStore } from './gamificationStore'

interface DSAState {
  progress: Record<string, DSAProblemProgress>
  expandedSections: Record<string, boolean>
  _hydrated: boolean
  getSectionStats: (sectionId: string) => SectionStats
  markSolved: (problemId: string) => void
  markUnsolved: (problemId: string) => void
  toggleProblem: (sectionId: string, problemId: string) => void
  setSectionExpanded: (sectionId: string, expanded: boolean) => void
  incrementAttempts: (problemId: string) => void
  toggleFavorite: (problemId: string) => void
  updateNotes: (problemId: string, notes: string) => void
  updateTimeTaken: (problemId: string, minutes: number) => void
  setRevisionStatus: (problemId: string, status: DSAProblemProgress['revisionStatus']) => void
  resetProgress: () => void
  _setDSAData: (data: { progress: Record<string, any> }) => void
}

const defaultProgress = (): DSAProblemProgress => ({
  solved: false,
  attempts: 0,
  favorite: false,
  revisionStatus: 'new',
  notes: '',
  timeTaken: 0,
  completedAt: null,
})

export const useDSAStore = create<DSAState>()(
  persist(
    (set, get) => ({
      progress: {},
      expandedSections: {},
      _hydrated: false,

      getSectionStats: (sectionId: string): SectionStats => {
        const section = allSections.find((s) => s.id === sectionId)
        if (!section) return { total: 0, solved: 0, easy: 0, medium: 0, hard: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 }

        const { progress } = get()
        const total = section.problems.length
        const easy = section.problems.filter((p) => p.difficulty === 'easy').length
        const medium = section.problems.filter((p) => p.difficulty === 'medium').length
        const hard = section.problems.filter((p) => p.difficulty === 'hard').length

        let solved = 0, easySolved = 0, mediumSolved = 0, hardSolved = 0
        for (const problem of section.problems) {
          const p = progress[problem.id]
          if (p?.solved) {
            solved++
            if (problem.difficulty === 'easy') easySolved++
            else if (problem.difficulty === 'medium') mediumSolved++
            else hardSolved++
          }
        }

        return { total, solved, easy, medium, hard, easySolved, mediumSolved, hardSolved }
      },

      markSolved: (problemId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [problemId]: {
              ...(state.progress[problemId] || defaultProgress()),
              solved: true,
              completedAt: new Date().toISOString(),
            },
          },
        })),

      markUnsolved: (problemId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [problemId]: {
              ...(state.progress[problemId] || defaultProgress()),
              solved: false,
              completedAt: null,
            },
          },
        })),

      toggleProblem: (sectionId, problemId) => {
        const { progress } = get()
        const isSolved = !!progress[problemId]?.solved
        if (isSolved) {
          get().markUnsolved(problemId)
        } else {
          get().markSolved(problemId)
          useGamificationStore.getState().addXP(10)

          const streakKey = 'placement-os-streak'
          const lastActivity = localStorage.getItem('placement-os-streak-last')
          const today = new Date().toISOString().slice(0, 10)
          if (lastActivity !== today) {
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().slice(0, 10)
            const currentStreak = parseInt(localStorage.getItem(streakKey) || '0', 10)
            const newStreak = lastActivity === yesterdayStr ? currentStreak + 1 : 1
            localStorage.setItem(streakKey, String(newStreak))
            localStorage.setItem('placement-os-streak-last', today)
          }
        }
      },

      setSectionExpanded: (sectionId, expanded) =>
        set((state) => ({
          expandedSections: { ...state.expandedSections, [sectionId]: expanded },
        })),

      incrementAttempts: (problemId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [problemId]: {
              ...(state.progress[problemId] || defaultProgress()),
              attempts: (state.progress[problemId]?.attempts || 0) + 1,
            },
          },
        })),

      toggleFavorite: (problemId) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [problemId]: {
              ...(state.progress[problemId] || defaultProgress()),
              favorite: !(state.progress[problemId]?.favorite || false),
            },
          },
        })),

      updateNotes: (problemId, notes) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [problemId]: {
              ...(state.progress[problemId] || defaultProgress()),
              notes,
            },
          },
        })),

      updateTimeTaken: (problemId, minutes) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [problemId]: {
              ...(state.progress[problemId] || defaultProgress()),
              timeTaken: minutes,
            },
          },
        })),

      setRevisionStatus: (problemId, status) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [problemId]: {
              ...(state.progress[problemId] || defaultProgress()),
              revisionStatus: status,
            },
          },
        })),

      _setDSAData: (data) =>
        set({ progress: data.progress as Record<string, DSAProblemProgress>, _hydrated: true }),
      resetProgress: () => set({ progress: {} }),
    }),
    { name: 'placement-os-dsa' },
  ),
)
