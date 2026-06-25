import { useEffect, useRef } from 'react'
import { useGamificationStore } from '../store/gamificationStore'
import { useDSAStore } from '../store/dsaStore'
import { useRoadmapStore } from '../store/roadmapStore'
import allSections from '../data/dsa'
import roadmapTechs from '../data/roadmap'
import { toast } from '../components/Toast'
import { useConfetti } from './useConfetti'

function countSolvedProblems() {
  const { progress } = useDSAStore.getState()
  return Object.values(progress).filter(p => p.solved).length
}

function isSectionComplete(title: string) {
  const { getSectionStats } = useDSAStore.getState()
  const section = allSections.find(s => s.title === title)
  if (!section) return false
  const stats = getSectionStats(section.id)
  return stats.solved === stats.total && stats.total > 0
}

function countCompletedTechs() {
  const { techProgress } = useRoadmapStore.getState()
  return Object.values(techProgress).filter(tp => tp.status === 'completed').length
}

function getStreak() {
  return parseInt(localStorage.getItem('placement-os-streak') || '0', 10)
}

const ACHIEVEMENTS = [
  { id: 'first-problem', label: 'First Problem Solved', icon: '🎯', condition: () => countSolvedProblems() >= 1 },
  { id: 'ten-problems', label: 'Ten Problems Solved', icon: '💪', condition: () => countSolvedProblems() >= 10 },
  { id: 'fifty-problems', label: 'Fifty Problems Solved', icon: '🏆', condition: () => countSolvedProblems() >= 50 },
  { id: 'complete-arrays', label: 'Completed Arrays', icon: '📚', condition: () => isSectionComplete('Arrays') },
  { id: 'first-tech', label: 'First Technology Mastered', icon: '⚡', condition: () => countCompletedTechs() >= 1 },
  { id: 'streak-7', label: '7-Day Streak', icon: '🔥', condition: () => getStreak() >= 7 },
  { id: 'streak-30', label: '30-Day Streak', icon: '💎', condition: () => getStreak() >= 30 },
  { id: 'all-rounder', label: 'All Rounder', icon: '🌟', condition: () => countSolvedProblems() >= 10 && countCompletedTechs() >= 1 },
]

export function useAchievementChecker() {
  const checked = useRef(false)

  useEffect(() => {
    if (checked.current) return
    checked.current = true

    const { hasAchievement, unlockAchievement } = useGamificationStore.getState()
    const { fire } = useConfetti()

    for (const ach of ACHIEVEMENTS) {
      if (!hasAchievement(ach.id) && ach.condition()) {
        unlockAchievement(ach.id)
        toast(ach.icon, ach.label)
        setTimeout(() => fire(), 500)
      }
    }
  }, [])
}

export { ACHIEVEMENTS }
