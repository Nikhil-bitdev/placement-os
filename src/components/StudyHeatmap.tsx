import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Info } from 'lucide-react'
import { useLeetCodeStore } from '../store/leetcodeStore'

const HEATMAP_COLORS: Record<number, string> = {
  0: 'bg-[#F1F5F9] dark:bg-zinc-800/40',
  1: 'bg-[#DBEAFE] dark:bg-blue-500/20',
  2: 'bg-[#93C5FD] dark:bg-blue-500/40',
  3: 'bg-[#60A5FA] dark:bg-blue-500/60',
  4: 'bg-[#2563EB] dark:bg-blue-500/80',
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export default function StudyHeatmap() {
  const activity = useLeetCodeStore(s => s.activity)
  const stats = useLeetCodeStore(s => s.stats)
  const [hoveredDay, setHoveredDay] = useState<{ date: string; level: number; solved: number; hours: number } | null>(null)

  const weeks = useMemo(() => {
    const sorted = [...activity].sort((a, b) => a.date.localeCompare(b.date))
    const result: typeof sorted[] = []
    let week: typeof sorted = []
    for (const day of sorted) {
      week.push(day)
      if (week.length === 7) {
        result.push(week)
        week = []
      }
    }
    if (week.length > 0) result.push(week)
    return result
  }, [activity])

  const totalActive = activity.filter(a => a.level > 0).length
  const currentStreak = stats.currentStreak

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-[#F97316]" />
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">Study Activity</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#64748B]">
          <span>{totalActive} active days</span>
          {currentStreak > 0 && (
            <span className="flex items-center gap-1">
              <Flame size={10} className="text-[#F97316]" />
              {currentStreak} day streak
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-[640px]">
          <div className="flex flex-col gap-[3px] pt-5 pr-1">
            {DAY_LABELS.map((label, i) => (
              <span key={i} className="text-[8px] text-[#94A3B8] h-[10px] leading-[10px]">{label}</span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => {
                  const dateObj = new Date(day.date + 'T00:00:00')
                  const isHovered = hoveredDay?.date === day.date
                  return (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (wi * 7 + di) * 0.002 }}
                      onMouseEnter={() => setHoveredDay({ date: day.date, level: day.level, solved: day.problemsSolved, hours: day.hoursStudied })}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-[10px] h-[10px] rounded-[3px] ${HEATMAP_COLORS[day.level]} transition-colors cursor-pointer ${isHovered ? 'ring-1 ring-[#2563EB]' : ''}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <span key={level} className={`w-2.5 h-2.5 rounded-[3px] ${HEATMAP_COLORS[level]}`} />
          ))}
          <span>More</span>
        </div>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-[#64748B]"
          >
            {hoveredDay.date} · {hoveredDay.solved} solved · {hoveredDay.hours}h studied
          </motion.div>
        )}
      </div>
    </div>
  )
}
