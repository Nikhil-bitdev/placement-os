import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb, TrendingUp, AlertTriangle, Award,Target,
  Sparkles, X, ChevronRight, Brain, Code2, BookOpen,
} from 'lucide-react'
import { useLeetCodeStore } from '../store/leetcodeStore'
import { useDSAStore } from '../store/dsaStore'
import { usePlannerStore } from '../store/plannerStore'

interface Insight {
  id: string
  icon: typeof Lightbulb
  title: string
  description: string
  action?: string
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan'
  type: 'success' | 'warning' | 'reminder' | 'interview' | 'revision' | 'motivation'
}

const colorMap: Record<string, { bg: string; text: string; dot: string }> = {
  blue: { bg: 'bg-[#DBEAFE] dark:bg-blue-500/10', text: 'text-[#2563EB] dark:text-blue-400', dot: 'bg-[#2563EB]' },
  emerald: { bg: 'bg-[#DCFCE7] dark:bg-emerald-500/10', text: 'text-[#16A34A] dark:text-emerald-400', dot: 'bg-[#22C55E]' },
  amber: { bg: 'bg-[#FEF3C7] dark:bg-amber-500/10', text: 'text-[#D97706] dark:text-amber-400', dot: 'bg-[#F59E0B]' },
  rose: { bg: 'bg-[#FCE7F3] dark:bg-rose-500/10', text: 'text-[#DB2777] dark:text-rose-400', dot: 'bg-[#EC4899]' },
  violet: { bg: 'bg-[#F3E8FF] dark:bg-violet-500/10', text: 'text-[#9333EA] dark:text-violet-400', dot: 'bg-[#8B5CF6]' },
  cyan: { bg: 'bg-[#CFFAFE] dark:bg-cyan-500/10', text: 'text-[#0891B2] dark:text-cyan-400', dot: 'bg-[#06B6D4]' },
}

export default function SmartInsights() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const insights = useLeetCodeStore(s => s.studyInsights)
  const stats = useLeetCodeStore(s => s.stats)
  const tasks = usePlannerStore(s => s.tasks)
  const dsaProgress = useDSAStore(s => s.progress)

  const generatedInsights: Insight[] = [
    ...(stats.currentStreak >= 3
      ? [{
          id: 'streak',
          icon: TrendingUp,
          title: `${stats.currentStreak}-day streak!`,
          description: 'You\'re on fire! Keep the momentum going.',
          color: 'emerald' as const,
          type: 'success' as const,
        }]
      : [{
          id: 'start-streak',
          icon: Target,
          title: 'Build a streak',
          description: 'Study today to start a new streak.',
          action: 'Start now',
          color: 'amber' as const,
          type: 'reminder' as const,
        }]),
    ...(dsaProgress && Object.values(dsaProgress).filter(p => p.solved).length >= 10
      ? [{
          id: 'dsa-milestone',
          icon: Brain,
          title: 'DSA Progress',
          description: `${Object.values(dsaProgress).filter(p => p.solved).length} problems solved. Great work!`,
          color: 'violet' as const,
          type: 'success' as const,
        }]
      : []),
    ...(tasks.filter(t => t.status === 'pending').length >= 5
      ? [{
          id: 'pending-tasks',
          icon: AlertTriangle,
          title: `${tasks.filter(t => t.status === 'pending').length} pending tasks`,
          description: 'You have uncompleted tasks. Plan your day to stay on track.',
          action: 'View tasks',
          color: 'rose' as const,
          type: 'warning' as const,
        }]
      : []),
    ...(stats.weeklyProgress < stats.weeklyGoal
      ? [{
          id: 'weekly-goal',
          icon: Target,
          title: `Weekly goal: ${stats.weeklyProgress}/${stats.weeklyGoal}`,
          description: 'You\'re making progress toward your weekly target.',
          color: 'blue' as const,
          type: 'reminder' as const,
        }]
      : [{
          id: 'weekly-complete',
          icon: Award,
          title: 'Weekly goal achieved!',
          description: 'You\'ve hit your weekly study target. Amazing!',
          color: 'emerald' as const,
          type: 'success' as const,
        }]),
    {
      id: 'tip',
      icon: Sparkles,
      title: 'Study smarter',
      description: 'Take 5-minute breaks every 25 minutes for optimal focus.',
      color: 'cyan' as const,
      type: 'motivation' as const,
    },
  ].filter(i => !dismissed.has(i.id))

  if (generatedInsights.length === 0) return null

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={14} className="text-[#64748B]" />
        <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Insights</h3>
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {generatedInsights.slice(0, 3).map((insight) => {
            const c = colorMap[insight.color]
            return (
              <motion.div
                key={insight.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative overflow-hidden"
              >
                <div className={`flex items-start gap-3 p-3 rounded-xl ${c.bg}`}>
                  <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${c.dot}`} />
                  <div className="flex-shrink-0 mt-0.5">
                    <insight.icon size={14} className={c.text} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0F172A] dark:text-zinc-200">{insight.title}</p>
                    <p className="text-[10px] text-[#64748B] mt-0.5">{insight.description}</p>
                    {insight.action && (
                      <button className="flex items-center gap-0.5 text-[10px] font-medium text-[#2563EB] mt-1 hover:text-[#1D4ED8] transition-colors">
                        {insight.action} <ChevronRight size={10} />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => setDismissed(prev => new Set([...prev, insight.id]))}
                    className="p-0.5 rounded text-[#94A3B8] hover:text-[#64748B] hover:bg-white/50 dark:hover:bg-black/20 transition-colors flex-shrink-0"
                  >
                    <X size={12} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
