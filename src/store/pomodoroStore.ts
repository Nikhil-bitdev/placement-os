import { create } from 'zustand'

const TOTAL_SECONDS = 25 * 60

interface PomodoroState {
  secondsLeft: number
  isActive: boolean
  sessions: number
  toggle: () => void
  reset: () => void
  tick: () => void
}

let intervalId: ReturnType<typeof setInterval> | null = null

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  secondsLeft: TOTAL_SECONDS,
  isActive: false,
  sessions: 0,

  toggle: () => {
    const { isActive } = get()
    if (isActive) {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      set({ isActive: false })
    } else {
      const { secondsLeft } = get()
      if (secondsLeft === 0) {
        set({ secondsLeft: TOTAL_SECONDS })
      }
      set({ isActive: true })
      intervalId = setInterval(() => {
        const state = get()
        if (state.secondsLeft <= 1) {
          if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
          }
          set({ isActive: false, secondsLeft: TOTAL_SECONDS, sessions: state.sessions + 1 })
        } else {
          set({ secondsLeft: state.secondsLeft - 1 })
        }
      }, 1000)
    }
  },

  reset: () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    set({ isActive: false, secondsLeft: TOTAL_SECONDS })
  },

  tick: () => {
    const { secondsLeft } = get()
    if (secondsLeft > 0) {
      set({ secondsLeft: secondsLeft - 1 })
    }
  },
}))
