import { useState, useEffect, useMemo, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Target, TrendingUp, Flame, Award, BookOpen, Clock, Brain, Code2, BarChart3 } from 'lucide-react'
import allSections from '../data/dsa'
import roadmapTechs from '../data/roadmap'
import { useDSAStore } from '../store/dsaStore'
import { useRoadmapStore } from '../store/roadmapStore'
import { usePlannerStore } from '../store/plannerStore'
import { useGamificationStore } from '../store/gamificationStore'

function getTodayStr(): string {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function HeroSection() {
  const greeting = getGreeting()
  const today = getTodayStr()
  const { tasks } = usePlannerStore()
  const { getProgress } = useRoadmapStore()

  const todayTasks = useMemo(() => tasks.filter(t => t.date === today), [tasks, today])
  const completedTasks = useMemo(() => todayTasks.filter(t => t.status === 'done'), [todayTasks])
  const todayProgress = todayTasks.length > 0 ? Math.round((completedTasks.length / todayTasks.length) * 100) : 0

  const streak = parseInt(localStorage.getItem('placement-os-streak') || '0', 10)

  const totalHours = useMemo(() =>
    roadmapTechs
      .filter(t => !t.isCheckpoint)
      .reduce((sum, t) => sum + getProgress(t.id).hoursSpent, 0),
    [getProgress],
  )

  const { xp, level, displayName } = useGamificationStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 lg:p-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              {greeting}, {displayName}
            </h1>
            <p className="text-sm text-[#64748B] dark:text-zinc-400 mt-1">
              Current Goal: Become a Full Stack Software Engineer
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#334155] dark:text-zinc-300">Today's Progress</span>
              <span className="font-mono text-[#2563EB] dark:text-blue-400 font-semibold">{todayProgress}%</span>
              <span className="text-[#94A3B8]">•</span>
              <span className="text-[#64748B]">{completedTasks.length} of {todayTasks.length} Tasks Completed</span>
            </div>
            <div className="w-full max-w-md h-2 bg-[#E2E8F0] dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${todayProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-[#2563EB]"
              />
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-1.5 text-[#334155] dark:text-zinc-300"><Flame size={14} className="text-orange-400" /> {streak} days</span>
            <span className="flex items-center gap-1.5 text-[#334155] dark:text-zinc-300"><Clock size={14} className="text-[#2563EB]" /> {totalHours}h total</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-[#64748B]">XP</p>
            <p className="text-lg font-bold text-[#0F172A] dark:text-white">{xp.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#64748B]">Level</p>
            <p className="text-lg font-bold text-[#2563EB] dark:text-blue-400">{level}</p>
          </div>
          <NavLink to="/dsa-tracker" className="btn-primary">Continue Learning</NavLink>
        </div>
      </div>
    </motion.div>
  )
}

function QuickStatsGrid() {
  const { getSectionStats } = useDSAStore()
  const { getProgress } = useRoadmapStore()

  const stats = useMemo(() => {
    let dsaSolved = 0
    let dsaTotal = 0
    for (const s of allSections) {
      const st = getSectionStats(s.id)
      dsaSolved += st.solved
      dsaTotal += st.total
    }
    const dsaPct = dsaTotal > 0 ? Math.round((dsaSolved / dsaTotal) * 100) : 0

    const nonCheckpoints = roadmapTechs.filter(t => !t.isCheckpoint)
    const roadmapCompleted = nonCheckpoints.filter(t => getProgress(t.id).status === 'completed').length
    const roadmapPct = nonCheckpoints.length > 0 ? Math.round((roadmapCompleted / nonCheckpoints.length) * 100) : 0

    const overallPct = Math.round((dsaPct + roadmapPct) / 2)
    const totalHours = nonCheckpoints.reduce((sum, t) => sum + getProgress(t.id).hoursSpent, 0)

    const cards: { label: string; value: string; progress?: number; icon: typeof CheckCircle }[] = []
    cards.push({ label: 'Overall Progress', value: `${overallPct}%`, progress: overallPct, icon: BarChart3 })
    if (dsaSolved > 0) cards.push({ label: 'DSA Progress', value: `${dsaSolved}/${dsaTotal}`, progress: dsaPct, icon: Code2 })
    if (roadmapCompleted > 0) cards.push({ label: 'Development', value: `${roadmapCompleted}/${nonCheckpoints.length}`, progress: roadmapPct, icon: TrendingUp })
    cards.push({ label: 'Study Hours', value: `${totalHours}h`, icon: Clock })
    if (dsaSolved > 0) cards.push({ label: 'Problems Solved', value: `${dsaSolved}`, icon: CheckCircle })
    return cards
  }, [getSectionStats, getProgress])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="card p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <stat.icon size={14} className="text-[#2563EB]" />
            <p className="text-xs text-[#64748B]">{stat.label}</p>
          </div>
          <p className="stat-value text-[#0F172A] dark:text-white">{stat.value}</p>
          {stat.progress !== undefined && (
            <div className="mt-2 h-1 bg-[#E2E8F0] dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${stat.progress}%` }} />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function TodayTimeline() {
  const today = getTodayStr()
  const { tasks } = usePlannerStore()

  const todayTasks = useMemo(
    () => tasks.filter(t => t.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [tasks, today],
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Today's Planner</h2>
        <span className="text-xs text-[#64748B]">{today}</span>
      </div>
      <div className="space-y-0">
        <AnimatePresence>
          {todayTasks.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-[#64748B] py-4"
            >
              No tasks scheduled for today
            </motion.p>
          ) : (
            todayTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-4 py-3 border-l-2 pl-4 -ml-[1px] ${
                  task.status === 'done'
                    ? 'border-[#16A34A]/50 opacity-60'
                    : 'border-[#2563EB]/50'
                }`}
              >
                <span className="text-xs font-mono text-[#64748B] w-12">{task.startTime}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#2563EB] dark:bg-blue-500/10 dark:text-blue-400">
                  {task.category}
                </span>
                <span
                  className={`text-sm flex-1 ${
                    task.status === 'done'
                      ? 'line-through text-[#94A3B8]'
                      : 'text-[#334155] dark:text-zinc-300'
                  }`}
                >
                  {task.category} — {task.startTime}–{task.endTime}
                </span>
                {task.status === 'done' && <span className="text-[#16A34A] text-xs">✓</span>}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function ContinueLearning() {
  const { getSectionStats } = useDSAStore()
  const { getProgress } = useRoadmapStore()

  const items = useMemo(() => {
    const dsaItems = allSections
      .filter(s => {
        const stats = getSectionStats(s.id)
        return stats.solved > 0 && stats.solved < stats.total
      })
      .slice(0, 2)
      .map(s => {
        const stats = getSectionStats(s.id)
        return {
          title: s.title,
          type: 'DSA' as const,
          progress: stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0,
          link: '/dsa-tracker',
        }
      })

    const techItems = roadmapTechs
      .filter(t => !t.isCheckpoint && getProgress(t.id).status === 'learning')
      .slice(0, 2)
      .map(t => ({
        title: t.name,
        type: 'Development' as const,
        progress: Math.min(100, Math.round((getProgress(t.id).hoursSpent / 40) * 100)),
        link: '/roadmap',
      }))

    return [...dsaItems, ...techItems]
  }, [getSectionStats, getProgress])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h2 className="section-title mb-4">Continue Learning</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map(item => (
          <NavLink
            key={item.title}
            to={item.link}
            className="p-4 rounded-xl bg-[#F1F5F9] dark:bg-zinc-800/50 hover:bg-[#E2E8F0] dark:hover:bg-zinc-800 transition-all duration-200"
          >
            <p className="text-xs text-[#64748B] uppercase tracking-wider">{item.type}</p>
            <p className="text-sm font-medium text-[#0F172A] dark:text-zinc-200 mt-1">{item.title}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-[#CBD5E1] dark:bg-zinc-700/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${item.progress}%` }} />
              </div>
              <span className="text-xs font-mono text-[#2563EB] dark:text-blue-400">{item.progress}%</span>
            </div>
          </NavLink>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-[#64748B] col-span-2 py-4">Start learning to see progress here</p>
        )}
      </div>
    </motion.div>
  )
}

function WeeklyHeatmap() {
  const { tasks } = usePlannerStore()

  const cells = useMemo(() => {
    const today = new Date()
    const days: { date: string; count: number }[] = []
    for (let i = 34; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
      const count = tasks.filter(t => t.date === dateStr && t.status === 'done').length
      days.push({ date: dateStr, count })
    }
    return days
  }, [tasks])

  const weeks: { date: string; count: number }[][] = []
  for (let w = 0; w < 5; w++) {
    weeks.push(cells.slice(w * 7, (w + 1) * 7))
  }

  const getColor = (count: number) => {
    if (count === 0) return 'bg-[#E2E8F0] dark:bg-zinc-800'
    if (count <= 1) return 'bg-[#BFDBFE] dark:bg-blue-900/60'
    if (count <= 3) return 'bg-[#60A5FA] dark:bg-blue-700/60'
    return 'bg-[#2563EB] dark:bg-blue-500/60'
  }

  const hasActivity = tasks.some(t => t.status === 'done')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h2 className="section-title mb-4">Activity</h2>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(cell => (
              <div
                key={cell.date}
                className={`w-3 h-3 rounded-sm ${getColor(cell.count)}`}
                title={`${cell.date}: ${cell.count} tasks`}
              />
            ))}
          </div>
        ))}
      </div>
      {!hasActivity && (
        <p className="text-xs text-[#64748B] mt-3">No activity yet</p>
      )}
    </motion.div>
  )
}

const achievementIcons: Record<string, typeof Award> = {
  'First 10 Problems': Target,
  'Completed Arrays': BookOpen,
  '7-Day Streak': Flame,
  'Quick Learner': Brain,
  'Problem Solver': Code2,
  'Consistent': BarChart3,
}

const defaultAchievements: { label: string; unlocked: boolean }[] = [
  { label: 'First 10 Problems', unlocked: false },
  { label: 'Completed Arrays', unlocked: false },
  { label: '7-Day Streak', unlocked: false },
  { label: 'Quick Learner', unlocked: false },
  { label: 'Problem Solver', unlocked: false },
  { label: 'Consistent', unlocked: false },
]

function RecentAchievements() {
  const stored = localStorage.getItem('placement-os-achievements')
  const achievements: { label: string; unlocked: boolean }[] = stored ? JSON.parse(stored) : defaultAchievements

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h2 className="section-title mb-4">Achievements</h2>
      <div className="grid grid-cols-3 gap-2">
        {achievements.map(a => {
          const Icon = achievementIcons[a.label] || Award
          return (
            <div
              key={a.label}
              className={`text-center p-3 rounded-xl ${a.unlocked ? 'bg-[#DBEAFE] dark:bg-blue-500/10' : 'bg-[#F1F5F9] dark:bg-zinc-800/30'} ${!a.unlocked ? 'opacity-40' : ''}`}
            >
              <Icon size={18} className={a.unlocked ? 'text-[#2563EB] mx-auto' : 'text-[#94A3B8] mx-auto'} />
              <p className="text-[10px] text-[#64748B] mt-1.5 leading-tight">{a.label}</p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function PomodoroWidget() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setIsActive(false)
            return 25 * 60
          }
          return t - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const totalSeconds = 25 * 60
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100

  const reset = () => {
    setTimeLeft(25 * 60)
    setIsActive(false)
  }

  return (
    <div className="card p-6 text-center">
      <h2 className="section-title mb-4">Pomodoro</h2>
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#E2E8F0" strokeWidth="4" />
          <circle
            cx="60" cy="60" r="54" fill="none" stroke="#2563EB" strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-mono font-bold text-[#0F172A] dark:text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="flex gap-2 justify-center mt-4">
        <button onClick={() => setIsActive(!isActive)} className="btn-primary text-xs px-3 py-1.5">
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} className="btn-ghost text-xs">Reset</button>
      </div>
    </div>
  )
}

function QuickNotesWidget() {
  const [note, setNote] = useState(() => localStorage.getItem('placement-os-quick-notes') || '')
  useEffect(() => { localStorage.setItem('placement-os-quick-notes', note) }, [note])

  return (
    <div className="card p-6">
      <h2 className="section-title mb-3">Quick Notes</h2>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Type a quick note..."
        className="w-full h-24 px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-zinc-800/50 border border-[#E2E8F0] dark:border-zinc-700/50 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#93C5FD] placeholder:text-[#94A3B8]"
      />
    </div>
  )
}

function RecentActivity() {
  const progress = useDSAStore(s => s.progress)
  const { techProgress } = useRoadmapStore()

  const activities = useMemo(() => {
    const result: { text: string; date: Date }[] = []

    const problemMap = new Map<string, string>()
    for (const section of allSections) {
      for (const p of section.problems) {
        problemMap.set(p.id, p.name)
      }
    }

    const now = new Date()
    for (const [id, p] of Object.entries(progress)) {
      if (p.completedAt) {
        const name = problemMap.get(id) || id
        result.push({ text: `Solved: ${name}`, date: new Date(p.completedAt) })
      }
    }

    for (const [id, tp] of Object.entries(techProgress)) {
      if (tp.completionDate) {
        const tech = roadmapTechs.find(t => t.id === id)
        const name = tech?.name || id
        result.push({ text: `Completed: ${name}`, date: new Date(tp.completionDate) })
      }
    }

    result.sort((a, b) => b.date.getTime() - a.date.getTime())
    return result.slice(0, 5).map(({ text, date }) => {
      const diff = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      const timeStr = diff === 0 ? 'Today' : diff === 1 ? 'Yesterday' : `${diff}d ago`
      return { text, time: timeStr }
    })
  }, [progress, techProgress])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h2 className="section-title mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-[#64748B] py-2">No recent activity — start solving problems!</p>
        ) : (
          activities.map((act, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-[#334155] dark:text-zinc-300">{act.text}</span>
              <span className="text-xs text-[#64748B]">{act.time}</span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <HeroSection />
      <QuickStatsGrid />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TodayTimeline />
          <ContinueLearning />
          <PomodoroWidget />
          <QuickNotesWidget />
        </div>
        <div className="space-y-6">
          <WeeklyHeatmap />
          <RecentAchievements />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
