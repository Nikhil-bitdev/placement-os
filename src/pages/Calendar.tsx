import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Search, CalendarDays, List, Columns,
  Filter, Plus, Sparkles, Clock, Target, CheckCircle2,
} from 'lucide-react'
import { usePlannerStore, CATEGORY_BADGES, type PlannerCategory } from '../store/plannerStore'
import {
  toDisplayFull, toPlannerKey,
  getMonthDays, getMonthName, getToday, isSameDay,
} from '../lib/dateUtils'
import DnDWeekView from '../components/DnDWeekView'
import TaskModal, { type TaskFormData } from '../components/TaskModal'
import DailyTimeline from '../components/DailyTimeline'
import StudyHeatmap from '../components/StudyHeatmap'
import MonthlyAnalytics from '../components/MonthlyAnalytics'
import WeeklySummary from '../components/WeeklySummary'
import SmartInsights from '../components/SmartInsights'
import { toast } from '../components/Toast'

const FILTERS = ['DSA', 'Full Stack', 'LeetCode', 'Core Subjects', 'Projects'] as const
type Filter = typeof FILTERS[number]

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const categoryIndicators: Record<string, string> = {
  DSA: 'bg-[#2563EB]',
  'Full Stack': 'bg-[#16A34A]',
  'Core Subjects': 'bg-[#D97706]',
  Projects: 'bg-[#9333EA]',
  Revision: 'bg-[#0284C7]',
  Contest: 'bg-[#DB2777]',
  Interview: 'bg-[#0891B2]',
  Resume: 'bg-[#EA580C]',
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
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={goPrev} className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50 transition-colors"><ChevronLeft size={15} /></button>
            <h1 className="text-sm font-bold text-[#0F172A] dark:text-white min-w-[140px] text-center select-none">
              {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
            </h1>
            <button onClick={goNext} className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:text-zinc-400 dark:hover:text-zinc-300 dark:hover:bg-zinc-800/50 transition-colors"><ChevronRight size={15} /></button>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={goToday}
            className="px-3 py-1 rounded-[8px] bg-[#DBEAFE] text-[#2563EB] text-xs font-medium hover:bg-[#BFDBFE] dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 transition-colors"
          >
            Today
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-[180px]">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks, topics..."
              className="w-full bg-[#F8FAFC] dark:bg-zinc-800/50 border border-[#E2E8F0] dark:border-zinc-700/50 rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-[#0F172A] dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#93C5FD] placeholder:text-[#94A3B8] transition-colors"
            />
          </div>
          <div className="flex bg-[#F1F5F9] dark:bg-zinc-800/50 rounded-lg p-0.5 gap-0.5">
            {['month', 'week', 'agenda'].map(v => (
              <motion.button
                key={v} onClick={() => setView(v)}
                whileTap={{ scale: 0.95 }}
                className={`p-1.5 rounded-md transition-all ${view === v ? 'bg-white dark:bg-zinc-700 text-[#0F172A] dark:text-white shadow-sm' : 'text-[#64748B] dark:text-zinc-500 hover:text-[#0F172A] dark:hover:text-zinc-300'}`}
                title={v === 'month' ? 'Month' : v === 'week' ? 'Week' : 'Agenda'}
              >
                {v === 'month' ? <CalendarDays size={13} /> : v === 'week' ? <Columns size={13} /> : <List size={13} />}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Filter size={11} className="text-[#94A3B8] flex-shrink-0" />
        <div className="flex items-center gap-1 flex-wrap">
          {FILTERS.map(f => (
            <motion.button
              key={f} onClick={() => toggleFilter(f)}
              whileTap={{ scale: 0.95 }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all inline-flex items-center gap-1.5 ${
                filters.includes(f)
                  ? 'bg-[#DBEAFE] text-[#2563EB] dark:bg-blue-500/20 dark:text-blue-400'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:bg-zinc-800/50 dark:text-zinc-500 dark:hover:text-zinc-300'
              }`}
            >
              <span className={`w-[5px] h-[5px] rounded-full ${categoryIndicators[f] || 'bg-[#94A3B8]'}`} />
              {f}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

function DayCell({ date, selected, onClick }: { date: Date; selected: boolean; onClick: () => void }) {
  const isToday = isSameDay(date, getToday())
  const isPadding = date.getTime() === new Date(0).getTime()
  const dayKey = isPadding ? '' : toPlannerKey(date)
  const dayTasks = usePlannerStore(s => s.tasks.filter(t => t.date === dayKey))
  const count = dayTasks.length
  const pending = dayTasks.filter(t => t.status !== 'done').length
  const allDone = count > 0 && pending === 0
  const categories = [...new Set(dayTasks.map(t => t.category))].slice(0, 3)

  if (isPadding) return <div />

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`h-10 rounded-lg flex flex-col items-center justify-center text-xs font-mono transition-all relative ${
        selected
          ? 'ring-2 ring-[#93C5FD] bg-[#DBEAFE] dark:ring-blue-500 dark:bg-blue-500/20'
          : ''
      } ${isToday ? 'ring-1 ring-[#93C5FD]/50 bg-[#DBEAFE]/30 dark:ring-blue-500/30 dark:bg-blue-500/10' : ''} hover:bg-[#F1F5F9] dark:hover:bg-zinc-700/30`}
    >
      <span className={`leading-none ${isToday ? 'text-[#2563EB] dark:text-blue-400 font-bold' : count > 0 ? 'text-[#0F172A] dark:text-zinc-300' : 'text-[#94A3B8] dark:text-zinc-600'}`}>
        {date.getDate()}
      </span>
      {count > 0 && (
        <div className="flex items-center gap-[2px] mt-[2px]">
          {categories.slice(0, 2).map(cat => (
            <span key={cat} className={`w-[4px] h-[4px] rounded-full ${categoryIndicators[cat] || 'bg-[#94A3B8]'}`} />
          ))}
          {allDone ? (
            <CheckCircle2 size={8} className="text-[#22C55E]" />
          ) : (
            <span className="text-[7px] text-[#94A3B8] font-mono">{pending}</span>
          )}
        </div>
      )}
    </motion.button>
  )
}

function MonthView({ currentDate, selectedDate, setSelectedDate }: { currentDate: Date; selectedDate: Date; setSelectedDate: (d: Date) => void }) {
  const weeks = useMemo(() => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()), [currentDate])
  return (
    <div className="card p-4">
      <div className="grid grid-cols-7 gap-1">
        {dayHeaders.map(d => (
          <div key={d} className="text-center text-[9px] font-semibold text-[#64748B] uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
        {weeks.flat().map((d, i) => (
          <DayCell key={i} date={d} selected={isSameDay(d, selectedDate)} onClick={() => setSelectedDate(d)} />
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
      <div className="flex items-center gap-2 mb-4">
        <List size={13} className="text-[#64748B]" />
        <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{toDisplayFull(currentDate)}</p>
      </div>
      {Object.keys(grouped).length === 0 ? (
        <div className="py-10 text-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF] dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center mx-auto mb-3">
            <Plus size={16} className="text-[#2563EB] dark:text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-[#0F172A] dark:text-white mb-1">Nothing planned yet</p>
          <p className="text-xs text-[#64748B]">Add a task to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, catTasks]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGES[cat as PlannerCategory] || 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'}`}>
                  {cat}
                </span>
                <span className="text-[10px] text-[#94A3B8]">{catTasks.length} tasks</span>
              </div>
              <div className="space-y-1">
                {catTasks.map(t => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-zinc-800/20 border border-[#E2E8F0] dark:border-zinc-700/30 text-xs"
                  >
                    <span className={`flex-1 min-w-0 truncate ${t.status === 'done' ? 'line-through text-[#94A3B8]' : 'text-[#334155] dark:text-zinc-300'}`}>
                      {t.title || `${t.category} task`}
                    </span>
                    {t.startTime && (
                      <span className="text-[9px] text-[#94A3B8] font-mono flex-shrink-0">{t.startTime}</span>
                    )}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                      t.status === 'done' ? 'text-[#16A34A] bg-[#DCFCE7] dark:bg-emerald-500/10' : 'text-[#64748B] bg-[#E2E8F0] dark:text-zinc-500 dark:bg-zinc-800/50'
                    }`}>
                      {t.status === 'done' ? 'Done' : 'Pending'}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(getToday())
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [view, setView] = useState('week')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filter[]>([...FILTERS])
  const addTask = usePlannerStore(s => s.addTask)
  const tasks = usePlannerStore(s => s.tasks)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalDate, setModalDate] = useState<Date>(getToday())
  const [fabOpen, setFabOpen] = useState(false)
  const fabRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setFabOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleFilter = (f: Filter) => {
    setFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const handleFABClick = () => {
    setFabOpen(!fabOpen)
  }

  const handleAddTask = (date?: Date) => {
    setModalDate(date || selectedDate)
    setModalOpen(true)
    setFabOpen(false)
  }

  const handleSave = (data: TaskFormData) => {
    addTask({ ...data, order: 0, status: 'pending' })
    toast('✅', 'Task created')
  }

  const fabActions = [
    { label: 'Add Task', icon: Plus, action: () => handleAddTask() },
    { label: 'Add Interview', icon: Target, action: () => handleAddTask() },
    { label: 'Add Revision', icon: Clock, action: () => handleAddTask() },
  ]

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
          {view === 'week' && <DnDWeekView currentDate={currentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate} filters={filters} />}
          {view === 'agenda' && <AgendaView currentDate={currentDate} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-widest">
          {view === 'month' ? 'Daily' : 'Today\'s'} Schedule
        </span>
        <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-zinc-700/50" />
      </div>

      <DailyTimeline date={selectedDate} />

      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-widest">Activity</span>
        <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-zinc-700/50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StudyHeatmap />
        <MonthlyAnalytics currentDate={currentDate} />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-widest">Review</span>
        <div className="flex-1 h-px bg-[#E2E8F0] dark:bg-zinc-700/50" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <WeeklySummary currentDate={currentDate} />
        <SmartInsights />
      </div>

      <div ref={fabRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <AnimatePresence>
          {fabOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="flex flex-col items-end gap-1"
            >
              {fabActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={action.action}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 shadow-lg border border-[#E2E8F0] dark:border-zinc-700/50 text-xs font-medium text-[#334155] dark:text-zinc-300 hover:bg-[#F8FAFC] dark:hover:bg-zinc-700 transition-all"
                >
                  <action.icon size={12} className="text-[#2563EB]" />
                  {action.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFABClick}
          className="w-12 h-12 rounded-full bg-[#2563EB] text-white shadow-lg hover:bg-[#1D4ED8] flex items-center justify-center transition-colors"
        >
          <motion.div
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus size={20} />
          </motion.div>
        </motion.button>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        selectedDate={modalDate}
        existingTasks={tasks.filter(t => t.date === toPlannerKey(modalDate))}
      />
    </div>
  )
}
