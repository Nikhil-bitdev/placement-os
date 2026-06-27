import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, Clock, Target, TrendingUp, Sparkles, Plus } from 'lucide-react'
import { usePlannerStore, CATEGORY_BADGES } from '../store/plannerStore'
import { toDisplayFull, toPlannerKey, getToday, isSameDay } from '../lib/dateUtils'

interface DayDetailCardProps {
  date: Date
  onAddTask: () => void
}

export default function DayDetailCard({ date, onAddTask }: DayDetailCardProps) {
  const dateKey = toPlannerKey(date)
  const tasks = usePlannerStore(s => s.tasks.filter(t => t.date === dateKey))
  const today = getToday()
  const isTodayDate = isSameDay(date, today)
  const isPast = date < today

  const doneTasks = tasks.filter(t => t.status === 'done')
  const pendingTasks = tasks.filter(t => t.status !== 'done')
  const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0

  const totalMinutes = useMemo(() => {
    let mins = 0
    for (const t of tasks) {
      if (t.startTime && t.endTime) {
        const [sh, sm] = t.startTime.split(':').map(Number)
        const [eh, em] = t.endTime.split(':').map(Number)
        if (!isNaN(sh) && !isNaN(eh)) mins += (eh * 60 + em) - (sh * 60 + sm)
      }
    }
    return mins
  }, [tasks])

  const hoursLabel = totalMinutes > 0
    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isTodayDate && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#2563EB] dark:bg-blue-500/20 dark:text-blue-400">
                Today
              </span>
            )}
            {isPast && completionRate === 100 && tasks.length > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-500/20 dark:text-emerald-400">
                Completed
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">
            {toDisplayFull(date)}
          </h3>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddTask}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-medium hover:bg-[#1D4ED8] transition-colors"
        >
          <Plus size={12} />
          Add Task
        </motion.button>
      </div>

      {tasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-10 text-center"
        >
          <div className="w-10 h-10 rounded-full bg-[#F1F5F9] dark:bg-zinc-800/50 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={16} className="text-[#94A3B8]" />
          </div>
          <p className="text-sm font-medium text-[#334155] dark:text-zinc-300 mb-1">
            {isTodayDate ? 'Plan your day' : 'No tasks for this day'}
          </p>
          <p className="text-xs text-[#94A3B8] mb-4">
            {isTodayDate
              ? 'Start by adding a study task to make progress.'
              : 'Add tasks to stay on top of your schedule.'}
          </p>
          <button
            onClick={onAddTask}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-medium hover:bg-[#1D4ED8] transition-colors"
          >
            <Plus size={12} />
            Create Task
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F8FAFC] dark:bg-zinc-800/30 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] mb-1">
                <Target size={10} />
                Tasks
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold text-[#0F172A] dark:text-white">{doneTasks.length}</span>
                <span className="text-xs text-[#94A3B8]">/ {tasks.length}</span>
              </div>
            </div>
            <div className="bg-[#F8FAFC] dark:bg-zinc-800/30 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] mb-1">
                <TrendingUp size={10} />
                Progress
              </div>
              <span className="text-lg font-semibold text-[#0F172A] dark:text-white">{completionRate}%</span>
            </div>
            {hoursLabel && (
              <div className="bg-[#F8FAFC] dark:bg-zinc-800/30 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] mb-1">
                  <Clock size={10} />
                  Hours
                </div>
                <span className="text-lg font-semibold text-[#0F172A] dark:text-white">{hoursLabel}</span>
              </div>
            )}
          </div>

          {tasks.length > 0 && (
            <div className="space-y-1">
              {tasks.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8FAFC] dark:bg-zinc-800/20 border border-[#E2E8F0] dark:border-zinc-700/30"
                >
                  <CheckCircle2
                    size={14}
                    className={`flex-shrink-0 ${t.status === 'done' ? 'text-[#22C55E]' : 'text-[#CBD5E1] dark:text-zinc-600'}`}
                  />
                  <span className={`text-xs flex-1 min-w-0 truncate ${t.status === 'done' ? 'line-through text-[#94A3B8]' : 'text-[#334155] dark:text-zinc-300'}`}>
                    {t.title}
                  </span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${CATEGORY_BADGES[t.category] || 'bg-zinc-100 text-zinc-600'}`}>
                    {t.category}
                  </span>
                  {t.startTime && (
                    <span className="text-[9px] text-[#94A3B8] font-mono flex-shrink-0">{t.startTime}</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
