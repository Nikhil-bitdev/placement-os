import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, Circle } from 'lucide-react'
import { usePlannerStore } from '../store/plannerStore'
import { getWeekDates, toPlannerKey, getToday, isSameDay, toDisplay } from '../lib/dateUtils'

interface WeeklySummaryProps {
  currentDate: Date
}

export default function WeeklySummary({ currentDate }: WeeklySummaryProps) {
  const tasks = usePlannerStore(s => s.tasks)
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

  const weekData = useMemo(() =>
    weekDates.map(d => {
      const key = toPlannerKey(d)
      const dayTasks = tasks.filter(t => t.date === key)
      const done = dayTasks.filter(t => t.status === 'done').length
      const total = dayTasks.length
      const totalMinutes = dayTasks.reduce((mins, t) => {
        if (t.startTime && t.endTime) {
          const [sh, sm] = t.startTime.split(':').map(Number)
          const [eh, em] = t.endTime.split(':').map(Number)
          if (!isNaN(sh) && !isNaN(eh)) return mins + (eh * 60 + em) - (sh * 60 + sm)
        }
        return mins
      }, 0)
      return { date: d, done, total, minutes: totalMinutes, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
    }),
    [weekDates, tasks],
  )

  const weeklyTotal = weekData.reduce((s, d) => s + d.total, 0)
  const weeklyDone = weekData.reduce((s, d) => s + d.done, 0)
  const weeklyPct = weeklyTotal > 0 ? Math.round((weeklyDone / weeklyTotal) * 100) : 0

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-[#64748B]" />
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Weekly Summary</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
          <span className="font-semibold text-[#0F172A] dark:text-white">{weeklyDone}/{weeklyTotal}</span>
          <span>done · {weeklyPct}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {weekData.map((day, i) => {
          const isTodayDay = isSameDay(day.date, getToday())
          const isPast = day.date < getToday()

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                isTodayDay
                  ? 'bg-[#DBEAFE]/30 dark:bg-blue-500/10 ring-1 ring-[#93C5FD]/30'
                  : 'bg-[#F8FAFC] dark:bg-zinc-800/20'
              }`}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm border border-[#E2E8F0] dark:border-zinc-700/30 flex-shrink-0">
                {day.done === day.total && day.total > 0 ? (
                  <CheckCircle2 size={16} className="text-[#22C55E]" />
                ) : day.done > 0 ? (
                  <span className="text-xs font-bold text-[#2563EB]">{day.pct}%</span>
                ) : (
                  <Circle size={14} className="text-[#CBD5E1] dark:text-zinc-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-medium ${isTodayDay ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#334155] dark:text-zinc-300'}`}>
                    {toDisplay(day.date)}
                  </p>
                  {isTodayDay && (
                    <span className="text-[9px] font-medium text-[#2563EB] dark:text-blue-400">Today</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#94A3B8]">
                  <span>{day.done}/{day.total} tasks</span>
                  {day.minutes > 0 && <span>· {Math.floor(day.minutes / 60)}h {day.minutes % 60}m</span>}
                </div>
              </div>

              <div className="w-20 h-1.5 rounded-full bg-[#E2E8F0] dark:bg-zinc-700/50 overflow-hidden flex-shrink-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${day.pct}%` }}
                  transition={{ delay: i * 0.04 + 0.2, duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    day.pct === 100 ? 'bg-[#22C55E]' : day.pct > 0 ? 'bg-[#2563EB]' : 'bg-transparent'
                  }`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
