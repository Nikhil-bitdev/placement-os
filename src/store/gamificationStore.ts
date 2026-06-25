import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const XP_PER_LEVEL = 500

export interface GamificationState {
  xp: number
  level: number
  achievements: string[]
  addXP: (amount: number) => void
  unlockAchievement: (id: string) => void
  hasAchievement: (id: string) => boolean
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      achievements: [],
      addXP: (amount) => set(state => {
        const newXP = state.xp + amount
        const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1
        return { xp: newXP, level: newLevel }
      }),
      unlockAchievement: (id) => set(state => ({
        achievements: state.achievements.includes(id) ? state.achievements : [...state.achievements, id],
      })),
      hasAchievement: (id) => get().achievements.includes(id),
    }),
    { name: 'placement-os-gamification' }
  )
)

export { XP_PER_LEVEL }
