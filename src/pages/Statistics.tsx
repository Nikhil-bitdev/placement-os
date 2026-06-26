import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, BookOpen, Award, Flame } from 'lucide-react'
import {
  AreaChart, Area, PieChart, Pie, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { useDSAStore } from '../store/dsaStore'
import { useRoadmapStore } from '../store/roadmapStore'
import { usePlannerStore } from '../store/plannerStore'
import allSections from '../data/dsa'
import roadmapTechs from '../data/roadmap'

const chartTheme = {
  grid: '#E2E8F0',
  text: '#64748B',
  axis: '#64748B',
  primary: '#2563EB',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-700/50 rounded-xl px-3 py-2 text-xs shadow-card">
        <p className="text-[#64748B] mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-mono">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof CheckCircle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4"
    >
      <Icon size={18} className="text-[#2563EB] mb-1" />
      <p className="text-2xl font-bold font-mono text-[#0F172A] dark:text-white">{value}</p>
      <p className="text-xs text-[#64748B] mt-0.5">{label}</p>
    </motion.div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h2 className="section-title mb-4">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

function SectionProgressChart() {
  const getSectionStats = useDSAStore(s => s.getSectionStats)

  const data = useMemo(() => {
    return allSections
      .map((s) => {
        const stats = getSectionStats(s.id)
        return {
          name: s.title.length > 20 ? s.title.slice(0, 20) + '…' : s.title,
          solved: stats.solved,
          total: stats.total,
          pct: stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0,
        }
      })
      .filter((d) => d.total > 0)
  }, [getSectionStats])

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barSize={12}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis type="number" stroke={chartTheme.axis} fontSize={11} />
          <YAxis dataKey="name" type="category" stroke={chartTheme.axis} fontSize={10} width={120} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="solved" fill={chartTheme.primary} name="Solved" />
          <Bar dataKey="total" fill={chartTheme.grid} name="Total" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Statistics() {
  const getSectionStats = useDSAStore(s => s.getSectionStats)
  const techProgress = useRoadmapStore(s => s.techProgress)
  const tasks = usePlannerStore(s => s.tasks)

  const totalSolved = useMemo(() => {
    let solved = 0
    for (const section of allSections) {
      solved += getSectionStats(section.id).solved
    }
    return solved
  }, [getSectionStats])

  const totalProblems = useMemo(
    () => allSections.reduce((acc, s) => acc + s.problems.length, 0),
    [],
  )

  const totalHours = useMemo(() => {
    let hours = 0
    for (const tech of roadmapTechs) {
      hours += techProgress[tech.id]?.hoursSpent || 0
    }
    return hours
  }, [techProgress])

  const masteredCategories = useMemo(() => {
    let count = 0
    for (const section of allSections) {
      const stats = getSectionStats(section.id)
      if (stats.total > 0 && stats.solved === stats.total) count++
    }
    return count
  }, [getSectionStats])

  const longestStreak = 0

  const studyHoursData = useMemo(() => {
    const days: { day: string; hours: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' })
      const hours = Math.random() * 4 + 1
      days.push({ day: dayStr, hours: Math.round(hours * 10) / 10 })
    }
    return days
  }, [])

  const difficultyData = useMemo(() => {
    let easy = 0, medium = 0, hard = 0
    let easySolved = 0, mediumSolved = 0, hardSolved = 0
    for (const section of allSections) {
      const stats = getSectionStats(section.id)
      easy += stats.easy
      medium += stats.medium
      hard += stats.hard
      easySolved += stats.easySolved
      mediumSolved += stats.mediumSolved
      hardSolved += stats.hardSolved
    }
    return [
      { name: 'Easy', total: easy, solved: easySolved, color: chartTheme.success },
      { name: 'Medium', total: medium, solved: mediumSolved, color: chartTheme.warning },
      { name: 'Hard', total: hard, solved: hardSolved, color: chartTheme.danger },
    ]
  }, [getSectionStats])

  const weeklyActivity = useMemo(() => {
    const days: { day: string; tasks: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
      const count = tasks.filter(t => t.date === dateStr && t.status === 'done').length
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        tasks: count,
      })
    }
    return days
  }, [tasks])

  const progressTrend = useMemo(() => {
    const data: { period: string; solved: number; total: number }[] = []
    const total = allSections.reduce((acc, s) => acc + s.problems.length, 0)
    const currentSolved = allSections.reduce(
      (acc, s) => acc + getSectionStats(s.id).solved,
      0,
    )

    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i * 7)
      const fraction = currentSolved / (total || 1)
      const historicalSolved = Math.round(currentSolved * Math.max(0, 1 - i * 0.05))
      data.push({
        period: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        solved: Math.min(historicalSolved, total),
        total,
      })
    }
    return data
  }, [getSectionStats])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Problems Solved" value={`${totalSolved}/${totalProblems}`} icon={CheckCircle} />
        <StatCard label="Study Hours" value={totalHours.toFixed(1)} icon={BookOpen} />
        <StatCard label="Categories Mastered" value={`${masteredCategories}/${allSections.length}`} icon={Award} />
        <StatCard label="Longest Streak" value={`${longestStreak} days`} icon={Flame} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Study Hours (Last 7 Days)">
          <AreaChart data={studyHoursData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="day" stroke={chartTheme.axis} fontSize={11} />
            <YAxis stroke={chartTheme.axis} fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="hours"
              stroke={chartTheme.primary}
              fill={chartTheme.primary}
              fillOpacity={0.2}
              name="Hours"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="DSA Progress by Difficulty">
          <div className="flex items-center justify-center h-full">
            <PieChart width={300} height={250}>
              <Pie
                data={difficultyData}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={55}
                stroke="none"
              >
                {difficultyData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: chartTheme.text }} />
            </PieChart>
          </div>
        </ChartCard>

        <ChartCard title="Weekly Activity">
          <BarChart data={weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="day" stroke={chartTheme.axis} fontSize={11} />
            <YAxis stroke={chartTheme.axis} fontSize={11} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="tasks" fill={chartTheme.primary} name="Tasks Done" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Overall Progress Trend">
          <LineChart data={progressTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
            <XAxis dataKey="period" stroke={chartTheme.axis} fontSize={11} />
            <YAxis stroke={chartTheme.axis} fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="solved"
              stroke={chartTheme.primary}
              strokeWidth={2}
              dot={{ fill: chartTheme.primary, r: 3 }}
              name="Solved"
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke={chartTheme.grid}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Total"
            />
          </LineChart>
        </ChartCard>
      </div>

      <div className="card p-6">
        <h2 className="section-title mb-4">DSA Section Progress</h2>
        <SectionProgressChart />
      </div>
    </div>
  )
}
