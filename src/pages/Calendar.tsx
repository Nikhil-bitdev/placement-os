import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Search, CalendarDays, List, Columns,
  Filter, Plus, Target, BookOpen, Clock, Brain, Code2, BarChart3,
  TrendingUp, Award, Flame, CheckCircle, Zap, AlertCircle, FileText,
  Sparkles,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { usePlannerStore } from '../store/plannerStore'
import { useLeetCodeStore } from '../store/leetcodeStore'
import { useDSAStore } from '../store/dsaStore'
import { useRoadmapStore } from '../store/roadmapStore'
import { useGamificationStore } from '../store/gamificationStore'
import { useCoreSubjectsStore } from '../store/coreSubjectsStore'
import {
  toDisplay, toDisplayFull, toPlannerKey, toISOKey,
  parsePlannerKey, getMonthDays, getMonthName, getToday,
  getWeekDates, isSameDay,
} from '../lib/dateUtils'
import allSections from '../data/dsa'
import roadmapTechs from '../data/roadmap'

const FILTERS = ['DSA', 'Full Stack', 'LeetCode', 'Core Subjects', 'Projects'] as const
type Filter = typeof FILTERS[number]

const chartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-700/50 rounded-xl px-3 py-2 text-xs shadow-card">
        <p className="text-[#64748B] mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-mono">{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const hours = Array.from({ length: 13 }, (_, i) => `${i + 7}:00`)

function getProductivity(date: Date): { score: number; label: string; color: string } {
  const plannerKey = toPlannerKey(date)
  const isoKey = toISOKey(date)
  const tasks = usePlannerStore.getState().tasks.filter(t => t.date === plannerKey)
  const activity = useLeetCodeStore.getState().activity.find(a => a.date === isoKey)
  const done = tasks.filter(t => t.status === 'done').length
  const total = tasks.length
  const solved = activity?.problemsSolved ?? 0
  const hr = activity?.hoursStudied ?? 0

  const now = getToday()
  if (isSameDay(date, now)) return { score: 100, label: 'Today', color: 'bg-[#DBEAFE] text-[#2563EB] dark:bg-blue-500/20 dark:text-blue-400' }
  if (done === 0 && solved === 0 && hr === 0 && date < now) return { score: 0, label: 'Missed', color: 'bg-[#FEE2E2] text-[#DC2626] dark:bg-red-500/20 dark:text-red-400' }
  if (total > 0 && done === total && solved > 0) return { score: 100, label: 'Completed', color: 'bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-500/20 dark:text-emerald-400' }
  if (done > 0 || solved > 0) {
    const pct = total > 0 ? Math.round((done / total) * 100) : solved > 0 ? 100 : 0
    if (pct >= 50) return { score: pct, label: 'Partial', color: 'bg-[#FEF3C7] text-[#D97706] dark:bg-amber-500/20 dark:text-amber-400' }
    return { score: pct, label: 'Below Goal', color: 'bg-[#FFEDD5] text-[#EA580C] dark:bg-orange-500/20 dark:text-orange-400' }
  }
  return { score: 0, label: 'No Activity', color: 'text-[#94A3B8] dark:text-zinc-600' }
}

function CalendarHeader({
  currentDate, setCurrentDate, selectedDate, setSelectedDate, view, setView, search, setSearch, filters, toggleFilter,
}: {
  currentDate: Date; setCurrentDate: (d: Date) => void; selectedDate: Date; setSelectedDate: (d: Date) => void
  view: string; setView: (v: string) => void; search: string; setSearch: (s: string) => void
  filters: Filter[]; toggleFilter: (f: Filter) => void
}) {
  const goPrev = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const goNext = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const goToday = () => { const t = getToday(); setCurrentDate(t); setSelectedDate(t) }

  return (
    <div className="card p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          <button onClick={goPrev} className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50"><ChevronLeft size={16} /></button>
          <h1 className="text-sm font-bold text-[#0F172A] dark:text-white min-w-[140px] text-center">
            {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
          </h1>
          <button onClick={goNext} className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50"><ChevronRight size={16} /></button>
        </div>
        <button onClick={goToday} className="px-2 py-0.5 rounded-[8px] bg-[#DBEAFE] text-[#2563EB] text-xs hover:bg-[#BFDBFE] dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition-colors">Today</button>
        <div className="flex-1 max-w-[160px] relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] dark:bg-zinc-800/50 dark:border-zinc-700/50 rounded-lg pl-6 pr-2 py-1 text-xs text-[#0F172A] dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#93C5FD] placeholder:text-[#94A3B8]"
          />
        </div>
        <div className="flex bg-[#F1F5F9] dark:bg-zinc-800/50 rounded-lg p-0.5">
          {['month', 'week', 'agenda'].map(v => (
            <button
              key={v} onClick={() => setView(v)}
              className={`p-1 rounded-md transition-all ${view === v ? 'bg-white dark:bg-zinc-700 text-[#0F172A] dark:text-white shadow-sm' : 'text-[#64748B] dark:text-zinc-500 hover:text-[#0F172A] dark:hover:text-zinc-300'}`}
            >
              {v === 'month' ? <CalendarDays size={13} /> : v === 'week' ? <Columns size={13} /> : <List size={13} />}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Filter size={12} className="text-[#64748B]" />
        {FILTERS.map(f => (
          <button
            key={f} onClick={() => toggleFilter(f)}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all ${
              filters.includes(f) ? 'bg-[#DBEAFE] text-[#2563EB] dark:bg-blue-500/20 dark:text-blue-400' : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] dark:bg-zinc-800/50 dark:text-zinc-500 dark:hover:text-zinc-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  )
}

function DayCell({ date, selected, onClick }: { date: Date; selected: boolean; onClick: () => void }) {
  const { label, color } = getProductivity(date)
  const isToday = isSameDay(date, getToday())
  const isPadding = date.getTime() === new Date(0).getTime()

  if (isPadding) return <div />

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`h-7 rounded-md flex items-center justify-center text-xs font-mono transition-all ${
        selected ? 'ring-1 ring-[#93C5FD] bg-[#DBEAFE] dark:ring-blue-500 dark:bg-blue-500/20' : color || ''
      } ${isToday ? 'ring-1 ring-[#93C5FD]/50 bg-[#DBEAFE]/50 dark:ring-blue-500/50 dark:bg-blue-500/10' : ''} hover:bg-[#F1F5F9] dark:hover:bg-zinc-700/30`}
    >
      <span className={`${isToday ? 'text-[#2563EB] dark:text-blue-400 font-bold' : label === 'No Activity' ? 'text-[#94A3B8] dark:text-zinc-600' : 'text-[#0F172A] dark:text-zinc-300'}`}>
        {date.getDate()}
      </span>
    </motion.button>
  )
}

function MonthView({ currentDate, selectedDate, setSelectedDate }: { currentDate: Date; selectedDate: Date; setSelectedDate: (d: Date) => void }) {
  const weeks = useMemo(() => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()), [currentDate])
  return (
    <div className="card p-3">
      <div className="grid grid-cols-7 gap-0.5">
        {dayHeaders.map(d => <div key={d} className="text-center text-[9px] font-semibold text-[#64748B] uppercase py-0.5">{d}</div>)}
        {weeks.flat().map((d, i) => (
          <DayCell key={i} date={d} selected={isSameDay(d, selectedDate)} onClick={() => setSelectedDate(d)} />
        ))}
      </div>
    </div>
  )
}

function WeekView({ currentDate, selectedDate, setSelectedDate }: { currentDate: Date; selectedDate: Date; setSelectedDate: (d: Date) => void }) {
  const weekDates = getWeekDates(currentDate)
  const tasks = usePlannerStore(s => s.tasks)

  const taskMap = useMemo(() => {
    const map = new Map<string, typeof tasks>()
    for (const d of weekDates) {
      const key = toPlannerKey(d)
      map.set(key, tasks.filter(t => t.date === key))
    }
    return map
  }, [weekDates, tasks])

  return (
    <div className="card p-4 overflow-x-auto">
      <div className="grid grid-cols-7 gap-1 min-w-[600px]">
        {weekDates.map((d, i) => (
          <div key={i} className="space-y-1">
            <button
              onClick={() => setSelectedDate(d)}
              className={`w-full text-center py-1.5 rounded-lg text-xs font-mono transition-all ${
                isSameDay(d, selectedDate) ? 'bg-[#DBEAFE] text-[#2563EB] ring-1 ring-[#93C5FD] dark:bg-blue-500/20 dark:text-blue-400 dark:ring-blue-500/50' :
                isSameDay(d, getToday()) ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#64748B]'
              }`}
            >
              <div>{d.getDate()}</div>
              <div className="text-[10px] text-[#64748B]">{dayHeaders[d.getDay()]}</div>
            </button>
            <div className="space-y-0.5 min-h-[200px]">
              {(taskMap.get(toPlannerKey(d)) || []).filter(t => t.status !== 'done').slice(0, 4).map(t => (
                <div key={t.id} className="text-[9px] px-1 py-0.5 rounded bg-[#F1F5F9] dark:bg-zinc-800/50 truncate text-[#64748B]">{t.startTime} {t.category}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AgendaView({ currentDate, selectedDate, setSelectedDate }: { currentDate: Date; selectedDate: Date; setSelectedDate: (d: Date) => void }) {
  const tasks = usePlannerStore(s => s.tasks)
  const monthTasks = useMemo(() => {
    const key = toPlannerKey(currentDate)
    return tasks.filter(t => t.date === key).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [currentDate, tasks])

  const grouped = useMemo(() => {
    const g: Record<string, typeof tasks> = {}
    for (const t of monthTasks) {
      if (!g[t.category]) g[t.category] = []
      g[t.category].push(t)
    }
    return g
  }, [monthTasks])

  return (
    <div className="card p-4">
      <p className="text-sm text-[#64748B] mb-4">{toDisplayFull(currentDate)}</p>
      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-[#64748B] py-8 text-center">No tasks</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, catTasks]) => (
            <div key={cat}>
              <p className="text-xs font-semibold text-[#334155] dark:text-zinc-300 mb-1">{cat} ({catTasks.length})</p>
              <div className="space-y-1">
                {catTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-zinc-800/20 text-xs">
                    <span className="text-[#64748B] font-mono w-12">{t.startTime}–{t.endTime}</span>
                    <span className={`flex-1 ${t.status === 'done' ? 'line-through text-[#94A3B8]' : 'text-[#334155] dark:text-zinc-300'}`}>
                      {t.category} — {t.startTime}–{t.endTime}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      t.status === 'done' ? 'text-emerald-400 bg-emerald-500/10' : 'text-[#64748B] bg-[#E2E8F0] dark:text-zinc-500 dark:bg-zinc-800/50'
                    }`}>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SelectedDayDetails({ date, onClose }: { date: Date | null; onClose: () => void }) {
  if (!date) return null
  const plannerKey = toPlannerKey(date)
  const isoKey = toISOKey(date)
  const tasks = usePlannerStore(s => s.tasks).filter(t => t.date === plannerKey)
  const done = tasks.filter(t => t.status === 'done').length
  const activity = useLeetCodeStore(s => s.activity).find(a => a.date === isoKey)
  const { xp } = useGamificationStore()
  const { subjects } = useCoreSubjectsStore()
  const { getSectionStats } = useDSAStore()
  const { getProgress } = useRoadmapStore()
  const progress = useDSAStore(s => s.progress)
  const techProgress = useRoadmapStore(s => s.techProgress)

  const dsaSolved = useMemo(() => allSections.reduce((s, sec) => s + getSectionStats(sec.id).solved, 0), [getSectionStats, progress])
  const roadmapDone = useMemo(() => roadmapTechs.filter(t => !t.isCheckpoint && getProgress(t.id).status === 'completed').length, [getProgress, techProgress])

  const { score } = getProductivity(date)
  const isToday = isSameDay(date, getToday())
  const isFuture = date > getToday()
  const hasData = tasks.length > 0 || !!activity

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="card p-5 space-y-5"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">{toDisplayFull(date)}</h2>
          {isToday && <span className="text-xs text-[#2563EB] dark:text-blue-400">Today</span>}
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold ${
            score >= 80 ? 'bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-500/20 dark:text-emerald-400' :
            score >= 50 ? 'bg-[#FEF3C7] text-[#D97706] dark:bg-amber-500/20 dark:text-amber-400' :
            score >= 20 ? 'bg-[#FFEDD5] text-[#EA580C] dark:bg-orange-500/20 dark:text-orange-400' :
            date < getToday() ? 'bg-[#FEE2E2] text-[#DC2626] dark:bg-red-500/20 dark:text-red-400' : 'bg-[#F1F5F9] text-[#64748B] dark:bg-zinc-800/50 dark:text-zinc-500'
          }`}>
            Productivity: {isFuture ? '—' : `${score}%`}
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A] dark:hover:text-zinc-300"><ChevronRight size={16} /></button>
        </div>
      </div>

      {!hasData && date < getToday() && (
        <div className="text-center py-6 text-[#64748B]">
          <p className="text-sm">No activity recorded for this day</p>
        </div>
      )}

      {!hasData && (isToday || isFuture) && (
        <div className="text-center py-6">
          <Sparkles size={32} className="mx-auto text-[#64748B] mb-2" />
          <p className="text-sm text-[#64748B] mb-3">No study plan yet</p>
          <button className="btn-primary text-xs">Generate Study Plan</button>
        </div>
      )}

      {hasData && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#F1F5F9] dark:bg-zinc-800/30 rounded-xl p-3 text-center">
              <Clock size={14} className="text-[#2563EB] dark:text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold font-mono text-[#0F172A] dark:text-white">{activity?.hoursStudied ?? 0}h</p>
              <p className="text-[10px] text-[#64748B]">Study Hours</p>
            </div>
            <div className="bg-[#F1F5F9] dark:bg-zinc-800/30 rounded-xl p-3 text-center">
              <CheckCircle size={14} className="text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold font-mono text-[#0F172A] dark:text-white">{done}/{tasks.length}</p>
              <p className="text-[10px] text-[#64748B]">Tasks Done</p>
            </div>
            <div className="bg-[#F1F5F9] dark:bg-zinc-800/30 rounded-xl p-3 text-center">
              <Code2 size={14} className="text-[#2563EB] dark:text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold font-mono text-[#0F172A] dark:text-white">{activity?.problemsSolved ?? 0}</p>
              <p className="text-[10px] text-[#64748B]">LeetCode Solved</p>
            </div>
            <div className="bg-[#F1F5F9] dark:bg-zinc-800/30 rounded-xl p-3 text-center">
              <Award size={14} className="text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold font-mono text-[#0F172A] dark:text-white">{xp}</p>
              <p className="text-[10px] text-[#64748B]">Total XP</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#334155] dark:text-zinc-300">Study Timeline</p>
            {tasks.length === 0 ? (
              <p className="text-xs text-[#64748B]">No tasks scheduled</p>
            ) : (
              tasks.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(t => (
                <div key={t.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#F1F5F9] dark:bg-zinc-800/20">
                  <span className="text-[10px] font-mono text-[#64748B] w-14">{t.startTime}–{t.endTime}</span>
                  <span className={`text-xs flex-1 ${t.status === 'done' ? 'line-through text-[#94A3B8]' : 'text-[#334155] dark:text-zinc-300'}`}>
                    {t.category}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    t.status === 'done' ? 'text-emerald-400 bg-emerald-500/10' :
                    t.status === 'in-progress' ? 'text-[#2563EB] bg-[#DBEAFE] dark:text-blue-400 dark:bg-blue-500/10' : 'text-[#64748B] bg-[#E2E8F0] dark:text-zinc-500 dark:bg-zinc-800/50'
                  }`}>{t.status}</span>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="bg-[#F1F5F9] dark:bg-zinc-800/30 rounded-lg px-3 py-2 text-xs">
              <span className="text-[#64748B]">DSA: </span><span className="text-[#2563EB] dark:text-blue-400">{dsaSolved} solved</span>
            </div>
            <div className="bg-[#F1F5F9] dark:bg-zinc-800/30 rounded-lg px-3 py-2 text-xs">
              <span className="text-[#64748B]">FS Roadmap: </span><span className="text-emerald-400">{roadmapDone} completed</span>
            </div>
            {subjects.filter(s => s.status !== 'not-started').map(s => (
              <div key={s.id} className="bg-[#F1F5F9] dark:bg-zinc-800/30 rounded-lg px-3 py-2 text-xs">
                <span className="text-[#64748B]">{s.name}: </span><span className="text-amber-400">{s.chaptersCompleted}/{s.totalChapters} ch</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button className="px-3 py-1.5 rounded-lg text-[#64748B] text-xs hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-700/50 transition-colors">Quick Edit</button>
            <button className="px-3 py-1.5 rounded-lg text-[#64748B] text-xs hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-700/50 transition-colors">Duplicate Day</button>
            <button className="px-3 py-1.5 rounded-lg bg-[#DBEAFE] text-[#2563EB] text-xs hover:bg-[#BFDBFE] dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition-colors">Generate Tomorrow's Plan</button>
          </div>
        </>
      )}
    </motion.div>
  )
}

function StudyHeatmap() {
  const { activity } = useLeetCodeStore()
  const { tasks } = usePlannerStore()
  const today = getToday()

  const cells = useMemo(() => {
    const days: { date: Date; level: number; count: number }[] = []
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const isoKey = toISOKey(d)
      const plannerKey = toPlannerKey(d)
      const act = activity.find(a => a.date === isoKey)
      const taskCount = tasks.filter(t => t.date === plannerKey && t.status === 'done').length
      const level = act?.level ?? (taskCount > 0 ? Math.min(taskCount, 4) : 0)
      days.push({ date: d, level, count: (act?.problemsSolved ?? 0) + taskCount })
    }
    return days
  }, [activity, tasks, today])

  const weeks: typeof cells[] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const getColor = (level: number) => {
    if (level === 0) return 'bg-[#E2E8F0] dark:bg-zinc-800'
    if (level === 1) return 'bg-[#BFDBFE] dark:bg-blue-900/60'
    if (level === 2) return 'bg-[#60A5FA] dark:bg-blue-700/60'
    if (level === 3) return 'bg-[#3B82F6] dark:bg-blue-500/60'
    return 'bg-[#2563EB] dark:bg-blue-400/60'
  }

  const monthLabels = useMemo(() => {
    const labels: { index: number; label: string }[] = []
    for (let i = 0; i < weeks.length; i++) {
      const firstDay = weeks[i][0]?.date
      if (firstDay && firstDay.getDate() <= 7) {
        labels.push({ index: i, label: firstDay.toLocaleDateString('en-US', { month: 'short' }) })
      }
    }
    return labels
  }, [weeks])

  const hasData = cells.some(c => c.level > 0)

  return (
    <div className="card p-5">
      <h2 className="section-title mb-4">Study Heatmap</h2>
      {!hasData ? (
        <p className="text-sm text-[#64748B] py-8 text-center">Start solving problems to see your activity heatmap</p>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-0.5" style={{ minWidth: weeks.length * 12 }}>
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className={`w-2.5 h-2.5 rounded-sm ${getColor(cell.level)}`}
                    title={`${toDisplay(cell.date)}: ${cell.count} activities`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-[#64748B]">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map(l => <div key={l} className={`w-2.5 h-2.5 rounded-sm ${getColor(l)}`} />)}
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  )
}

function MonthlyAnalytics() {
  const { activity } = useLeetCodeStore()
  const { tasks } = usePlannerStore()
  const { xp } = useGamificationStore()
  const { subjects } = useCoreSubjectsStore()

  const dayData = useMemo(() => {
    const data: { day: string; hours: number; problems: number; tasks: number }[] = []
    const today = getToday()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const isoKey = toISOKey(d)
      const plannerKey = toPlannerKey(d)
      const act = activity.find(a => a.date === isoKey)
      const taskCount = tasks.filter(t => t.date === plannerKey && t.status === 'done').length
      data.push({
        day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: act?.hoursStudied ?? 0,
        problems: act?.problemsSolved ?? 0,
        tasks: taskCount,
      })
    }
    return data
  }, [activity, tasks])

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tasks) {
      if (t.status === 'done') {
        counts[t.category] = (counts[t.category] || 0) + 1
      }
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [tasks])

  const totalHours = dayData.reduce((s, d) => s + d.hours, 0)
  const totalProblems = dayData.reduce((s, d) => s + d.problems, 0)
  const totalTasks = dayData.reduce((s, d) => s + d.tasks, 0)
  const avgProductivity = tasks.length > 0 ? Math.round((totalTasks / Math.max(1, dayData.filter(d => d.tasks > 0).length)) * 10) : 0

  const categoryColors: Record<string, string> = {
    DSA: '#2563EB', Development: '#22C55E', 'Core Subjects': '#F59E0B',
    Projects: '#A855F7', Revision: '#06B6D4', 'Mock Interview': '#F43F5E',
    Aptitude: '#06B6D4', Behavioral: '#F97316',
  }

  return (
    <div className="card p-5">
      <h2 className="section-title mb-4">Monthly Analytics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-[#F1F5F9] dark:bg-zinc-800/30 rounded-xl p-3 text-center">
          <p className="text-lg font-bold font-mono text-[#0F172A] dark:text-white">{totalHours}h</p>
          <p className="text-[10px] text-[#64748B]">Study Hours</p>
        </div>
        <div className="bg-[#F1F5F9] dark:bg-zinc-800/30 rounded-xl p-3 text-center">
          <p className="text-lg font-bold font-mono text-[#0F172A] dark:text-white">{totalProblems}</p>
          <p className="text-[10px] text-[#64748B]">Problems</p>
        </div>
        <div className="bg-[#F1F5F9] dark:bg-zinc-800/30 rounded-xl p-3 text-center">
          <p className="text-lg font-bold font-mono text-[#0F172A] dark:text-white">{xp}</p>
          <p className="text-[10px] text-[#64748B]">XP Earned</p>
        </div>
        <div className="bg-[#F1F5F9] dark:bg-zinc-800/30 rounded-xl p-3 text-center">
          <p className="text-lg font-bold font-mono text-[#0F172A] dark:text-white">{avgProductivity}%</p>
          <p className="text-[10px] text-[#64748B]">Avg Productivity</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-48">
          <p className="text-xs text-[#64748B] mb-2">Daily Study Hours</p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-zinc-700" />
              <XAxis dataKey="day" stroke="#94A3B8" className="dark:stroke-zinc-500" fontSize={9} tick={{ angle: -45 }} />
              <YAxis stroke="#94A3B8" className="dark:stroke-zinc-500" fontSize={9} />
              <Tooltip content={chartTooltip} />
              <Area type="monotone" dataKey="hours" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} name="Hours" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-48">
          <p className="text-xs text-[#64748B] mb-2">Problems by Category</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" className="dark:stroke-zinc-700" />
              <XAxis dataKey="name" stroke="#94A3B8" className="dark:stroke-zinc-500" fontSize={8} />
              <YAxis stroke="#94A3B8" className="dark:stroke-zinc-500" fontSize={9} />
              <Tooltip content={chartTooltip} />
              <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={categoryColors[entry.name] || '#2563EB'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-48">
          <p className="text-xs text-zinc-500 mb-2">Time Distribution</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={40} stroke="none">
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={categoryColors[entry.name] || '#2563EB'} />
                ))}
              </Pie>
              <Tooltip content={chartTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function WeeklySummary() {
  const { tasks } = usePlannerStore()
  const today = getToday()

  const weekData = useMemo(() => {
    const data: { day: string; date: Date; tasks: number; done: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = toPlannerKey(d)
      const dayTasks = tasks.filter(t => t.date === key)
      data.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d,
        tasks: dayTasks.length,
        done: dayTasks.filter(t => t.status === 'done').length,
      })
    }
    return data
  }, [tasks, today])

  const best = useMemo(() => {
    let max = -1; let idx = -1
    weekData.forEach((d, i) => { if (d.done > max) { max = d.done; idx = i } })
    return idx >= 0 ? weekData[idx] : null
  }, [weekData])

  const worst = useMemo(() => {
    let min = Infinity; let idx = -1
    weekData.forEach((d, i) => { if (d.done < min && d.date < today) { min = d.done; idx = i } })
    return idx >= 0 ? weekData[idx] : null
  }, [weekData, today])

  return (
    <div className="card p-5">
      <h2 className="section-title mb-4">Weekly Summary</h2>
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekData.map((d, i) => (
          <div key={i} className="text-center">
            <p className="text-[10px] text-[#64748B]">{d.day}</p>
            <p className="text-lg font-bold font-mono text-[#0F172A] dark:text-white mt-1">{d.done}</p>
            <div className="mt-1 h-12 bg-[#E2E8F0] dark:bg-zinc-800/50 rounded-full overflow-hidden flex items-end justify-center">
              <div
                className="w-full bg-[#2563EB] rounded-full transition-all duration-500"
                style={{ height: `${Math.max(5, (d.done / Math.max(1, best?.done || 1)) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#64748B] mt-1">{d.tasks} tasks</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {best && <span className="text-emerald-400">Best: {best.day} ({best.done} done)</span>}
        {worst && <span className="text-red-400">Worst: {worst.day} ({worst.done} done)</span>}
        <span className="text-[#64748B]">Total: {weekData.reduce((s, d) => s + d.done, 0)} tasks</span>
        <button className="ml-auto px-3 py-1 rounded-lg bg-[#DBEAFE] text-[#2563EB] hover:bg-[#BFDBFE] dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition-colors">
          Generate Weekly Report
        </button>
      </div>
    </div>
  )
}

function SmartInsights() {
  const { activity, stats: lcStats } = useLeetCodeStore()
  const { tasks } = usePlannerStore()
  const { subjects } = useCoreSubjectsStore()
  const { getSectionStats } = useDSAStore()
  const progress = useDSAStore(s => s.progress)

  const insights = useMemo(() => {
    const result: { text: string; type: 'info' | 'warning' | 'success' }[] = []

    const dsaSolved = allSections.reduce((s, sec) => s + getSectionStats(sec.id).solved, 0)
    if (dsaSolved > 0) {
      result.push({ text: `You've solved ${dsaSolved} DSA problems so far. Keep going!`, type: 'success' })
    }

    const weakTopics = allSections
      .map(s => ({ name: s.title, stats: getSectionStats(s.id) }))
      .filter(s => s.stats.total > 0 && s.stats.solved < s.stats.total * 0.3)
    if (weakTopics.length > 0) {
      result.push({ text: `${weakTopics[0].name} needs attention — only ${Math.round((weakTopics[0].stats.solved / weakTopics[0].stats.total) * 100)}% solved`, type: 'warning' })
    }

    const today = getToday()
    const todayKey = toPlannerKey(today)
    const todayTasks = tasks.filter(t => t.date === todayKey)
    const doneToday = todayTasks.filter(t => t.status === 'done').length
    if (todayTasks.length > 0) {
      if (doneToday === todayTasks.length) {
        result.push({ text: `All ${todayTasks.length} today's tasks completed!`, type: 'success' })
      } else if (doneToday > 0) {
        result.push({ text: `${doneToday}/${todayTasks.length} tasks done today. ${todayTasks.length - doneToday} remaining.`, type: 'info' })
      } else {
        result.push({ text: `${todayTasks.length} tasks scheduled today — none started yet.`, type: 'warning' })
      }
    }

    if (lcStats.currentStreak > 0) {
      result.push({ text: `${lcStats.currentStreak}-day LeetCode streak active!`, type: 'success' })
    }
    if (lcStats.longestStreak > lcStats.currentStreak) {
      result.push({ text: `All-time best LeetCode streak: ${lcStats.longestStreak} days.`, type: 'info' })
    }

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentSolveDays = activity.filter(a => {
      const d = new Date(a.date)
      return d >= weekAgo && a.problemsSolved > 0
    }).length
    if (recentSolveDays >= 5) {
      result.push({ text: `Solved problems on ${recentSolveDays} of the last 7 days. Great consistency!`, type: 'success' })
    } else if (recentSolveDays > 0) {
      result.push({ text: `Solved problems on ${recentSolveDays} of the last 7 days. Try to make it daily.`, type: 'info' })
    } else if (lcStats.totalSolved > 0) {
      result.push({ text: 'No problems solved in the last 7 days. Time to get back on track!', type: 'warning' })
    }

    if (lcStats.contestRating > 0) {
      result.push({ text: `Contest rating: ${lcStats.contestRating} (attended ${lcStats.contestPeakRating > lcStats.contestRating ? 'peak ' + lcStats.contestPeakRating : lcStats.contestRating}).`, type: 'info' })
    }

    const subjectsLearning = subjects.filter(s => s.status === 'learning')
    if (subjectsLearning.length > 0) {
      result.push({ text: `Studying ${subjectsLearning.length} core subjects.`, type: 'info' })
    }

    if (result.length === 0) {
      result.push({ text: 'Welcome to Placement OS! Start tracking your study to see personalized insights.', type: 'info' })
    }

    return result.slice(0, 6)
  }, [activity, tasks, subjects, getSectionStats, lcStats, progress])

  return (
    <div className="card p-5">
      <h2 className="section-title mb-4">Smart Insights</h2>
      <div className="space-y-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${
               insight.type === 'success' ? 'bg-[#DCFCE7] text-[#16A34A] dark:bg-emerald-500/10 dark:text-emerald-300' :
              insight.type === 'warning' ? 'bg-[#FFEDD5] text-[#EA580C] dark:bg-orange-500/10 dark:text-orange-300' :
              'bg-[#DBEAFE] text-[#2563EB] dark:bg-blue-500/10 dark:text-blue-300'
            }`}
          >
            {insight.type === 'success' ? <CheckCircle size={12} className="mt-0.5 flex-shrink-0" /> :
             insight.type === 'warning' ? <AlertCircle size={12} className="mt-0.5 flex-shrink-0" /> :
             <Zap size={12} className="mt-0.5 flex-shrink-0" />}
            <span>{insight.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CalendarFAB() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const items = [
    { icon: FileText, label: 'Add Task', onClick: () => navigate('/planner') },
    { icon: Clock, label: 'Start Pomodoro', onClick: () => navigate('/planner') },
    { icon: Sparkles, label: 'Generate Plan', onClick: () => {} },
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && items.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => { item.onClick(); setOpen(false) }}
            className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] dark:text-zinc-300 hover:bg-[#F8FAFC] dark:hover:bg-zinc-800 shadow-card"
          >
            <item.icon size={14} />
            <span>{item.label}</span>
          </motion.button>
        ))}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-[#2563EB] text-white shadow-lg shadow-blue-500/25 flex items-center justify-center text-xl hover:scale-105 transition-transform"
      >
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="block">+</motion.span>
      </button>
    </div>
  )
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(getToday())
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [view, setView] = useState('month')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filter[]>([...FILTERS])

  const toggleFilter = (f: Filter) => {
    setFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  return (
    <div className="space-y-6">
      <CalendarHeader
        currentDate={currentDate} setCurrentDate={setCurrentDate}
        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
        view={view} setView={setView}
        search={search} setSearch={setSearch}
        filters={filters} toggleFilter={toggleFilter}
      />

      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {view === 'month' && <MonthView currentDate={currentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
          {view === 'week' && <WeekView currentDate={currentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
          {view === 'agenda' && <AgendaView currentDate={currentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
        </motion.div>
      </AnimatePresence>

      <SelectedDayDetails date={selectedDate} onClose={() => setSelectedDate(getToday())} />

      <StudyHeatmap />
      <MonthlyAnalytics />
      <WeeklySummary />
      <SmartInsights />
      <CalendarFAB />
    </div>
  )
}
