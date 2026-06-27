import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, CheckCircle2, Brain, Clock, Target,
} from 'lucide-react'
import { usePlannerStore } from '../store/plannerStore'
import { useLeetCodeStore } from '../store/leetcodeStore'
import { useDSAStore } from '../store/dsaStore'
import { useCoreSubjectsStore } from '../store/coreSubjectsStore'
import { getMonthDays, toPlannerKey } from '../lib/dateUtils'

interface MonthlyAnalyticsProps {
  currentDate: Date
}

export default function MonthlyAnalytics({ currentDate }: MonthlyAnalyticsProps) {
  const tasks = usePlannerStore(s => s.tasks)
  const dsaProgress = useDSAStore(s => s.progress)
  const subjects = useCoreSubjectsStore(s => s.subjects)
  const activity = useLeetCodeStore(s => s.activity)

  const monthDays = getMonthDays(currentDate.getFullYear(), currentDate.getMonth())

  const monthData = useMemo(() => {
    const dates = monthDays.flat().filter(d => d.getTime() !== new Date(0).getTime())
    let totalTasks = 0
    let doneTasks = 0
    let totalMinutes = 0
    let dsaSolved = 0
    let coreHours = 0

    for (const d of dates) {
      const key = toPlannerKey(d)
      const dateTasks = tasks.filter(t => t.date === key)
      totalTasks += dateTasks.length
      doneTasks += dateTasks.filter(t => t.status === 'done').length

      for (const t of dateTasks) {
        if (t.startTime && t.endTime) {
          const [sh, sm] = t.startTime.split(':').map(Number)
          const [eh, em] = t.endTime.split(':').map(Number)
          if (!isNaN(sh) && !isNaN(eh)) totalMinutes += (eh * 60 + em) - (sh * 60 + sm)
        }
      }
    }

    dsaSolved = Object.values(dsaProgress).filter(p => p.solved).length

    for (const sub of subjects) {
      coreHours += sub.hoursStudied
    }

    const isoMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    const solvedThisMonth = activity
      .filter(a => a.date.startsWith(isoMonth))
      .reduce((sum, a) => sum + a.problemsSolved, 0)

    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    return {
      totalTasks,
      doneTasks,
      completionRate,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      dsaSolved,
      solvedThisMonth,
      coreHours: Math.round(coreHours * 10) / 10,
    }
  }, [monthDays, tasks, dsaProgress, subjects, activity, currentDate])

  const stats = [
    {
      label: 'Tasks Completed',
      value: `${monthData.doneTasks}/${monthData.totalTasks}`,
      sub: `${monthData.completionRate}% rate`,
      icon: CheckCircle2,
      color: 'text-[#22C55E] bg-[#F0FDF4] dark:bg-emerald-500/10',
    },
    {
      label: 'Study Hours',
      value: `${monthData.totalHours}h`,
      sub: `${monthData.coreHours}h core subjects`,
      icon: Clock,
      color: 'text-[#2563EB] bg-[#DBEAFE] dark:bg-blue-500/10',
    },
    {
      label: 'DSA Problems',
      value: `${monthData.dsaSolved}`,
      sub: `${monthData.solvedThisMonth} solved this month`,
      icon: Brain,
      color: 'text-[#9333EA] bg-[#F3E8FF] dark:bg-violet-500/10',
    },
    {
      label: 'Completion Rate',
      value: `${monthData.completionRate}%`,
      sub: `${monthData.totalTasks} total tasks`,
      icon: Target,
      color: 'text-[#D97706] bg-[#FEF3C7] dark:bg-amber-500/10',
    },
  ]

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={14} className="text-[#64748B]" />
        <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Monthly Analytics</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-[#F8FAFC] dark:bg-zinc-800/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={13} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[#0F172A] dark:text-white mb-0.5">{stat.value}</p>
            <p className="text-[10px] text-[#94A3B8]">{stat.label}</p>
            <p className="text-[9px] text-[#64748B] mt-0.5">{stat.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
