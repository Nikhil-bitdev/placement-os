import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TechProgress } from '../types'
import { useGamificationStore } from './gamificationStore'

interface RoadmapState {
  techProgress: Record<string, TechProgress>
  getProgress: (techId: string) => TechProgress
  updateStatus: (techId: string, status: TechProgress['status']) => void
  updateHours: (techId: string, hours: number) => void
  updateNotes: (techId: string, notes: string) => void
  addMiniProject: (techId: string, project: string) => void
  removeMiniProject: (techId: string, index: number) => void
  updateMainProject: (techId: string, project: string) => void
  incrementRevision: (techId: string) => void
  updateConfidence: (techId: string, confidence: TechProgress['confidence']) => void
  updateEstimatedHours: (techId: string, hours: number) => void
  markComplete: (techId: string) => void
  resetAll: () => void
}

const defaultTechProgress = (): TechProgress => ({
  status: 'not-started' as const,
  hoursSpent: 0,
  notes: '',
  miniProjects: [],
  mainProject: '',
  revisionCount: 0,
  confidence: 1,
  completionDate: null,
  estimatedRemainingHours: 0,
})

export const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set, get) => ({
      techProgress: {},

      getProgress: (techId) => {
        return get().techProgress[techId] || defaultTechProgress()
      },

      updateStatus: (techId, status) => {
        const prev = get().techProgress[techId]?.status
        return set((state) => {
          if (status === 'completed' && prev !== 'completed') {
            useGamificationStore.getState().addXP(100)
          }
          return {
            techProgress: {
              ...state.techProgress,
              [techId]: {
                ...(state.techProgress[techId] || defaultTechProgress()),
                status,
                completionDate: status === 'completed' ? new Date().toISOString() : (state.techProgress[techId]?.completionDate || null),
              },
            },
          }
        })
      },

      updateHours: (techId, hours) =>
        set((state) => ({
          techProgress: {
            ...state.techProgress,
            [techId]: {
              ...(state.techProgress[techId] || defaultTechProgress()),
              hoursSpent: hours,
            },
          },
        })),

      updateNotes: (techId, notes) =>
        set((state) => ({
          techProgress: {
            ...state.techProgress,
            [techId]: {
              ...(state.techProgress[techId] || defaultTechProgress()),
              notes,
            },
          },
        })),

      addMiniProject: (techId, project) =>
        set((state) => ({
          techProgress: {
            ...state.techProgress,
            [techId]: {
              ...(state.techProgress[techId] || defaultTechProgress()),
              miniProjects: [...(state.techProgress[techId]?.miniProjects || []), project],
            },
          },
        })),

      removeMiniProject: (techId, index) =>
        set((state) => ({
          techProgress: {
            ...state.techProgress,
            [techId]: {
              ...(state.techProgress[techId] || defaultTechProgress()),
              miniProjects: (state.techProgress[techId]?.miniProjects || []).filter((_, i) => i !== index),
            },
          },
        })),

      updateMainProject: (techId, project) =>
        set((state) => ({
          techProgress: {
            ...state.techProgress,
            [techId]: {
              ...(state.techProgress[techId] || defaultTechProgress()),
              mainProject: project,
            },
          },
        })),

      incrementRevision: (techId) =>
        set((state) => ({
          techProgress: {
            ...state.techProgress,
            [techId]: {
              ...(state.techProgress[techId] || defaultTechProgress()),
              revisionCount: (state.techProgress[techId]?.revisionCount || 0) + 1,
            },
          },
        })),

      updateConfidence: (techId, confidence) =>
        set((state) => ({
          techProgress: {
            ...state.techProgress,
            [techId]: {
              ...(state.techProgress[techId] || defaultTechProgress()),
              confidence,
            },
          },
        })),

      updateEstimatedHours: (techId, hours) =>
        set((state) => ({
          techProgress: {
            ...state.techProgress,
            [techId]: {
              ...(state.techProgress[techId] || defaultTechProgress()),
              estimatedRemainingHours: hours,
            },
          },
        })),

      markComplete: (techId) => {
        const prev = get().techProgress[techId]?.status
        return set((state) => {
          if (prev !== 'completed') {
            useGamificationStore.getState().addXP(100)
          }
          return {
            techProgress: {
              ...state.techProgress,
              [techId]: {
                ...(state.techProgress[techId] || defaultTechProgress()),
                status: 'completed',
                completionDate: new Date().toISOString(),
              },
            },
          }
        })
      },

      resetAll: () => set({ techProgress: {} }),
    }),
    { name: 'placement-os-roadmap' },
  ),
)
