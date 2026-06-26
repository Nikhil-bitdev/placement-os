import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search, RefreshCw, TrendingUp,
  Trophy, BarChart3, BookOpen, CheckCircle, Circle, Star,
  ExternalLink, ArrowRight, ChevronDown, ChevronUp, Filter,
  Calendar, Flame, Award, Lightbulb, FileText, Video, List,
  Play, Sparkles, Lock, Code2, PieChart, Activity, X,
} from 'lucide-react'
import { useLeetCodeStore } from '../store/leetcodeStore'
import { useGamificationStore } from '../store/gamificationStore'
import AnimatedCounter from '../components/AnimatedCounter'
import {
  PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const D3 = '#DC2626'
const D2 = '#F59E0B'
const D1 = '#16A34A'
const D0 = '#1E293B'

const heatmapColors = ['#1E293B', '#1D4ED8', '#2563EB', '#3B82F6', '#60A5FA']

const difficultyColors = { easy: '#16A34A', medium: '#F59E0B', hard: '#DC2626' }

function MiniStatCard({ label, value, sub, color = 'text-blue-400', icon: Icon }: { label: string; value: string | number; sub?: string; color?: string; icon?: typeof Star }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#1E293B] bg-[#111827] p-4 flex items-center gap-4 hover:border-blue-500/20 transition-colors"
    >
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-[#1E293B] ${color.replace('text-', 'text-').replace('400', '400/20')}`}>
          <Icon size={18} className={color} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold font-mono mt-0.5 ${color}`}>
          {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
        </p>
        {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

function RadialStatCard({ label, value, max, color = 'text-blue-400', strokeColor = '#3B82F6', suffix = '%' }: { label: string; value: number; max: number; color?: string; strokeColor?: string; suffix?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#1E293B] bg-[#111827] p-4 flex items-center gap-4 hover:border-blue-500/20 transition-colors"
    >
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="-rotate-90" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#1E293B" strokeWidth="3" />
          <circle cx="24" cy="24" r="20" fill="none" stroke={strokeColor} strokeWidth="3"
            strokeDasharray={2 * Math.PI * 20}
            strokeDashoffset={2 * Math.PI * 20 * (1 - pct / 100)}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-[9px] font-bold font-mono ${color}`}>{value}{suffix}</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold font-mono mt-0.5 ${color}`}>{value}{suffix}</p>
      </div>
    </motion.div>
  )
}

function HeatmapCell({ level, onClick }: { level: 0 | 1 | 2 | 3 | 4; onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-3 h-3 rounded-[3px] transition-all hover:ring-1 hover:ring-blue-400/50 ${level === 0 ? 'bg-[#1E293B]' : level === 1 ? 'bg-[#1D4ED8]' : level === 2 ? 'bg-[#2563EB]' : level === 3 ? 'bg-[#3B82F6]' : 'bg-[#60A5FA]'}`}
    />
  )
}

function ContributionHeatmap({ data: _data }: { data: { date: string; level: 0 | 1 | 2 | 3 | 4; problemsSolved: number; hoursStudied: number; notes: string }[] }) {
  const [selected, setSelected] = useState<{ date: string; problemsSolved: number; hoursStudied: number; notes: string } | null>(null)
  const weeks = useMemo(() => {
    const result: { week: number; days: { date: string; level: 0 | 1 | 2 | 3 | 4 }[] }[] = []
    for (let i = 0; i < _data.length; i += 7) {
      const days = _data.slice(i, i + 7)
      if (days.length > 0) result.push({ week: result.length, days: days.map(d => ({ date: d.date, level: d.level })) })
    }
    return result
  }, [_data])

  const monthLabels = useMemo(() => {
    const labels: { index: number; label: string }[] = []
    weeks.forEach((w, i) => {
      const firstDay = w.days[0]?.date
      if (firstDay) {
        const month = parseInt(firstDay.split('-')[1])
        if (i === 0 || (weeks[i - 1]?.days[0] && parseInt(weeks[i - 1].days[0].date.split('-')[1]) !== month)) {
          labels.push({ index: i, label: MONTHS[month - 1] })
        }
      }
    })
    return labels
  }, [weeks])

  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-200">Contribution Heatmap</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{_data.filter(d => d.level > 0).length} contributions in the last year</p>
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-0.5" style={{ minWidth: weeks.length * 16 }}>
          <div className="flex flex-col gap-0.5 mr-1">
            {DAYS.map((d, i) => (
              <div key={d} className="w-3 h-3 flex items-center justify-center">
                {i % 2 === 0 && <span className="text-[7px] text-slate-600">{d[0]}</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-0.5 relative">
            {monthLabels.map(m => (
              <span key={m.label} className="absolute text-[7px] text-slate-600" style={{ left: m.index * 16 + 4, top: -14 }}>{m.label}</span>
            ))}
            {weeks.map(w => (
              <div key={w.week} className="flex flex-col gap-0.5">
                {w.days.map(d => (
                  <HeatmapCell key={d.date} level={d.level} onClick={() => {
                    const found = _data.find(a => a.date === d.date)
                    if (found) setSelected(found)
                  }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-slate-600">Less</span>
          {heatmapColors.map(c => (
            <div key={c} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: c }} />
          ))}
          <span className="text-[9px] text-slate-600">More</span>
        </div>
        {selected && (
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span>{selected.date}</span>
            <span>{selected.problemsSolved} solved</span>
            <span>{selected.hoursStudied}h studied</span>
          </div>
        )}
      </div>
    </div>
  )
}

function DifficultyChart({ easy, medium, hard }: { easy: number; medium: number; hard: number }) {
  const total = easy + medium + hard
  const data = [
    { name: 'Easy', value: easy, color: '#16A34A' },
    { name: 'Medium', value: medium, color: '#F59E0B' },
    { name: 'Hard', value: hard, color: '#DC2626' },
  ]
  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
      <p className="text-sm font-semibold text-slate-200 mb-3">Difficulty Distribution</p>
      <div className="flex items-center gap-6">
        <div className="w-36 h-36 flex-shrink-0">
          <ResponsiveContainer width={144} height={144}>
            <RePieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" stroke="none">
                {data.map(e => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 8, fontSize: 12 }} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map(d => (
            <div key={d.name} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-slate-400">{d.name}</span>
              </div>
              <span className="text-xs font-mono text-slate-200">{d.value}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-[#1E293B]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Total</span>
              <span className="text-xs font-mono text-slate-200">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TopicCard({ topic, solved, total, confidence, revisionCount, estimatedCompletion }: { topic: string; solved: number; total: number; confidence: number; revisionCount: number; estimatedCompletion?: string }) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0
  return (
    <motion.div whileHover={{ y: -2, scale: 1.01 }}
      className="rounded-xl border border-[#1E293B] bg-[#111827] p-4 hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-200">{topic}</p>
        <div className="relative w-8 h-8 flex-shrink-0">
          <svg className="-rotate-90" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="13" fill="none" stroke="#1E293B" strokeWidth="2.5" />
            <circle cx="16" cy="16" r="13" fill="none" stroke={confidence >= 70 ? '#16A34A' : confidence >= 40 ? '#F59E0B' : '#DC2626'} strokeWidth="2.5"
              strokeDasharray={2 * Math.PI * 13}
              strokeDashoffset={2 * Math.PI * 13 * (1 - pct / 100)}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[7px] font-bold font-mono text-slate-200">{pct}%</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
        <div><span className="text-slate-500">Solved</span><span className="ml-1 font-mono text-slate-300">{solved}/{total}</span></div>
        <div><span className="text-slate-500">Conf.</span><span className="ml-1 font-mono text-slate-300">{confidence}%</span></div>
        <div><span className="text-slate-500">Revisions</span><span className="ml-1 font-mono text-slate-300">{revisionCount}</span></div>
        <div><span className="text-slate-500">Remaining</span><span className="ml-1 font-mono text-slate-300">{total - solved}</span></div>
      </div>
    </motion.div>
  )
}

export default function LeetCodePage() {
  const store = useLeetCodeStore()
  const { displayName } = useGamificationStore()
  const [editingUsername, setEditingUsername] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const stats = store.stats

  const filteredProblems = useMemo(() => {
    let problems = store.problemHistory
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      problems = problems.filter(p => p.name.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q))
    }
    if (filterDifficulty !== 'all') problems = problems.filter(p => p.difficulty === filterDifficulty)
    if (filterStatus === 'solved') problems = problems.filter(p => p.solved)
    else if (filterStatus === 'unsolved') problems = problems.filter(p => !p.solved)
    return problems
  }, [store.problemHistory, searchQuery, filterDifficulty, filterStatus])

  const radarData = useMemo(() => {
    return store.topicProgress.slice(0, 8).map(t => ({ topic: t.topic, confidence: t.confidence, solved: t.solved }))
  }, [store.topicProgress])

  const weeklyData = useMemo(() => {
    return store.activity.slice(-28).reduce((acc: { day: string; solved: number; hours: number }[], day, i) => {
      if (i % 7 === 0) {
        const weekNum = Math.floor(i / 7)
        acc.push({ day: `W${weekNum + 1}`, solved: day.problemsSolved, hours: day.hoursStudied })
      } else {
        acc[acc.length - 1].solved += day.problemsSolved
        acc[acc.length - 1].hours += day.hoursStudied
      }
      return acc
    }, [])
  }, [store.activity])

  const monthlyChartData = useMemo(() => {
    const months: Record<string, number> = {}
    for (const day of store.activity) {
      const m = day.date.slice(0, 7)
      months[m] = (months[m] || 0) + day.problemsSolved
    }
    return Object.entries(months).slice(-6).map(([month, solved]) => {
      const [, m] = month.split('-')
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return { month: monthNames[parseInt(m) - 1] || month, solved }
    })
  }, [store.activity])

  const focusItems = useMemo(() => {
    const items: { label: string; desc: string; icon: typeof List }[] = []
    const weak = store.weakTopics.slice(0, 3)
    for (const w of weak) {
      items.push({ label: `Continue ${w.topic}`, desc: `${w.total - w.solved} problems remaining`, icon: List })
    }
    if (items.length < 4) {
      const practiced = store.topicProgress.filter(t => t.confidence < 50).slice(0, 4 - items.length)
      for (const p of practiced) {
        if (!items.find(i => i.label.includes(p.topic))) {
          items.push({ label: `Practice ${p.topic}`, desc: `${p.total - p.solved} problems remaining`, icon: TrendingUp })
        }
      }
    }
    if (items.length < 4) {
      items.push({ label: 'Weekly Contest', desc: 'Participate to boost rating', icon: Trophy })
    }
    return items.slice(0, 4)
  }, [store.weakTopics, store.topicProgress])

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#1E293B] bg-[#111827] p-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Code2 size={16} className="text-blue-400" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold text-slate-100 tracking-tight">LeetCode Progress</h1>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">Track your interview preparation and coding consistency.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0F172A] border border-[#1E293B]">
              <Code2 size={11} className="text-blue-400" />
              <input
                value={editingUsername ?? store.username}
                onChange={e => setEditingUsername(e.target.value)}
                onBlur={() => { if (editingUsername?.trim()) store.setUsername(editingUsername.trim()); setEditingUsername(null) }}
                onKeyDown={e => { if (e.key === 'Enter') { if (editingUsername?.trim()) store.setUsername(editingUsername.trim()); setEditingUsername(null) } }}
                className="w-20 text-xs font-mono text-slate-300 bg-transparent border-none outline-none focus:ring-0 p-0"
                placeholder="leetcode_id"
              />
              {store.username && (
                <button onClick={() => { store.clearUsername(); setEditingUsername('') }}
                  className="p-0.5 rounded hover:bg-red-500/10 transition-colors" title="Remove LeetCode ID">
                  <X size={10} className="text-zinc-600 hover:text-red-400" />
                </button>
              )}
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search problems..."
                className="w-28 lg:w-36 text-xs pl-8 pr-2.5 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <button onClick={() => store.syncFromLeetCode()} disabled={store.isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                store.isSyncing ? 'bg-blue-500/50 text-blue-200 cursor-wait' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <RefreshCw size={12} className={store.isSyncing ? 'animate-spin' : ''} />
              {store.isSyncing ? 'Syncing...' : 'Sync'}
            </button>
            {store.lastSynced && (
              <span className="text-[9px] text-slate-600 hidden lg:block">Synced {new Date(store.lastSynced).toLocaleDateString()}</span>
            )}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-white">{displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SYNC ERROR */}
      {store.syncError && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          <span>Sync failed: {store.syncError}</span>
          <button onClick={() => store.syncFromLeetCode()} className="ml-auto text-[10px] px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 transition-colors">Retry</button>
        </div>
      )}

      {/* STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <MiniStatCard label="Total Solved" value={stats.totalSolved} color="text-blue-400" icon={CheckCircle} />
        <MiniStatCard label="Easy" value={stats.easySolved} color="text-green-400" icon={CheckCircle} />
        <MiniStatCard label="Medium" value={stats.mediumSolved} color="text-amber-400" icon={CheckCircle} />
        <MiniStatCard label="Hard" value={stats.hardSolved} color="text-red-400" icon={CheckCircle} />
        <RadialStatCard label="Acceptance" value={stats.acceptanceRate} max={100} color="text-green-400" strokeColor="#16A34A" suffix="%" />
        <MiniStatCard label="Current Streak" value={stats.currentStreak} sub="days" color="text-orange-400" icon={Flame} />
        <MiniStatCard label="Longest Streak" value={stats.longestStreak} sub="days" color="text-orange-400" icon={Flame} />
        <MiniStatCard label="Global Rank" value={`#${stats.globalRanking.toLocaleString()}`} color="text-slate-300" icon={BarChart3} />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="min-w-0 space-y-6">
          {/* HEATMAP */}
          <ContributionHeatmap data={store.activity} />

          {/* DIFFICULTY + TOPIC GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
            <DifficultyChart easy={stats.easySolved} medium={stats.mediumSolved} hard={stats.hardSolved} />
            <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
              <p className="text-sm font-semibold text-slate-200 mb-3">Topic Progress</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto scrollbar-thin pr-1">
                {store.topicProgress.map(t => (
                  <TopicCard key={t.topic} topic={t.topic} solved={t.solved} total={t.total} confidence={t.confidence} revisionCount={t.revisionCount} />
                ))}
              </div>
            </div>
          </div>

          {/* CURRENT FOCUS */}
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
            <p className="text-sm font-semibold text-slate-200 mb-3">Current Focus</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {focusItems.map(item => (
                <motion.button key={item.label} whileHover={{ y: -2 }}
                  className="flex items-start gap-3 p-3 rounded-lg border border-[#1E293B] bg-[#0F172A] hover:border-blue-500/30 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1E293B] flex items-center justify-center flex-shrink-0">
                    <item.icon size={14} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200">{item.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="xl:sticky xl:top-24 self-start space-y-4">
          {/* PROFILE */}
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5 text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-3">
              <span className="text-lg font-bold text-white">{displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || store.profile.username.slice(0, 2).toUpperCase() || 'U'}</span>
            </div>
            <p className="text-sm font-semibold text-slate-200">{store.profile.username || displayName}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <Trophy size={12} className="text-amber-400" />
              <span className="text-xs text-slate-400">{stats.contestRating} Rating</span>
            </div>
            {store.profile.contestBadge && (
              <div className="inline-block px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 mt-2">
                <span className="text-[10px] font-medium text-amber-400">{store.profile.contestBadge}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#1E293B]">
              <div><p className="text-[9px] text-slate-500 uppercase">Global Rank</p><p className="text-xs font-mono text-slate-300 mt-0.5">#{stats.globalRanking.toLocaleString()}</p></div>
              <div><p className="text-[9px] text-slate-500 uppercase">Streak</p><p className="text-xs font-mono text-orange-400 mt-0.5">{stats.currentStreak} days</p></div>
              <div><p className="text-[9px] text-slate-500 uppercase">Solved</p><p className="text-xs font-mono text-blue-400 mt-0.5">{stats.totalSolved}</p></div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
            <p className="text-xs font-semibold text-slate-200 mb-3">Quick Actions</p>
            <div className="space-y-1.5">
              {[
                { label: 'Open LeetCode', icon: ExternalLink },
                { label: 'Daily Challenge', icon: Calendar },
                { label: 'Random Problem', icon: Sparkles },
                { label: 'Continue Last Problem', icon: Play },
                { label: 'Mark Goal Complete', icon: CheckCircle },
              ].map(a => (
                <button key={a.label}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#1E293B] transition-colors text-left"
                >
                  <a.icon size={13} className="text-slate-500 flex-shrink-0" />
                  <span className="text-xs text-slate-400">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
            <p className="text-xs font-semibold text-slate-200 mb-3">Recent Activity</p>
            <div className="space-y-2">
              {store.recentActivity.slice(0, 6).map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${a.type === 'solve' ? 'bg-green-500' : a.type === 'contest' ? 'bg-amber-500' : a.type === 'badge' ? 'bg-blue-500' : a.type === 'streak' ? 'bg-orange-500' : a.type === 'revision' ? 'bg-purple-500' : 'bg-slate-500'}`} />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 leading-tight">{a.text}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">{a.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PROBLEM HISTORY */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[#1E293B] bg-[#111827] overflow-hidden"
      >
        <div className="p-5 border-b border-[#1E293B]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-200">Problem History</p>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-28 text-[10px] pl-7 pr-2 py-1.5 rounded-lg bg-[#0F172A] border border-[#1E293B] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 text-[10px] px-2 py-1.5 rounded-lg bg-[#1E293B] text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Filter size={10} /> Filters
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {['all', 'easy', 'medium', 'hard'].map(d => (
                <button key={d} onClick={() => setFilterDifficulty(d)}
                  className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${filterDifficulty === d ? 'bg-blue-500 text-white' : 'bg-[#1E293B] text-slate-500 hover:text-slate-300'}`}
                >{d === 'all' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}</button>
              ))}
              <div className="w-px h-4 bg-[#1E293B]" />
              {['all', 'solved', 'unsolved'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${filterStatus === s ? 'bg-blue-500 text-white' : 'bg-[#1E293B] text-slate-500 hover:text-slate-300'}`}
                >{s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}</button>
              ))}
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1E293B]">
                {['Problem', 'Difficulty', 'Topic', 'Companies', 'Attempts', 'Time', 'Revisions', '', ''].map(h => (
                  <th key={h} className="text-left text-[10px] text-slate-500 font-medium px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProblems.slice(0, 20).map(p => (
                <tr key={p.id} className="border-b border-[#1E293B] hover:bg-[#0F172A]/50 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => store.toggleFavorite(p.id)}>
                        <Star size={10} className={p.favorite ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} />
                      </button>
                      <span className="text-slate-200 whitespace-nowrap">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[10px] font-medium ${p.difficulty === 'easy' ? 'text-green-400' : p.difficulty === 'medium' ? 'text-amber-400' : 'text-red-400'}`}>
                      {p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-400">{p.topic}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      {p.companyTags.slice(0, 2).map(t => (
                        <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1E293B] text-slate-500">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-400">{p.attempts}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-400">{p.timeTaken}m</td>
                  <td className="px-3 py-2.5 font-mono text-slate-400">{p.revisionCount}</td>
                  <td className="px-3 py-2.5">
                    {p.solved ? <CheckCircle size={12} className="text-green-500" /> : <Circle size={12} className="text-slate-600" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProblems.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">No problems match your filters.</div>
          )}
        </div>
      </motion.div>

      {/* BOTTOM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WEAK TOPICS */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
          <p className="text-sm font-semibold text-slate-200 mb-3">Weak Topics</p>
          <div className="space-y-3">
            {store.weakTopics.slice(0, 4).map(t => (
              <div key={t.topic} className="p-3 rounded-lg bg-[#0F172A] border border-[#1E293B]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-slate-200">{t.topic}</p>
                  <span className="text-[10px] font-mono text-red-400">{t.confidence}%</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-2">
                  <span>Solved {t.solved}/{t.total}</span>
                </div>
                <p className="text-[10px] text-slate-600 mb-2">{t.recommended}</p>
                <button className="text-[10px] px-2.5 py-1 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">Start Practicing</button>
              </div>
            ))}
          </div>
        </div>

        {/* STUDY INSIGHTS */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
          <p className="text-sm font-semibold text-slate-200 mb-3">Study Insights</p>
          <div className="space-y-2">
            {store.studyInsights.map((ins, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${ins.type === 'positive' ? 'bg-green-500/5 border border-green-500/10' : ins.type === 'negative' ? 'bg-red-500/5 border border-red-500/10' : 'bg-[#0F172A] border border-[#1E293B]'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${ins.type === 'positive' ? 'bg-green-500/10' : ins.type === 'negative' ? 'bg-red-500/10' : 'bg-[#1E293B]'}`}>
                  <Lightbulb size={11} className={ins.type === 'positive' ? 'text-green-400' : ins.type === 'negative' ? 'text-red-400' : 'text-blue-400'} />
                </div>
                <p className={`text-[11px] leading-relaxed ${ins.type === 'positive' ? 'text-green-300' : ins.type === 'negative' ? 'text-red-300' : 'text-slate-400'}`}>{ins.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CONTEST ANALYTICS */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
          <p className="text-sm font-semibold text-slate-200 mb-3">Contest Analytics</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-[#0F172A] text-center">
              <p className="text-[9px] text-slate-500 uppercase">Rating</p>
              <p className="text-sm font-bold font-mono text-blue-400 mt-1">{store.contest.rating}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0F172A] text-center">
              <p className="text-[9px] text-slate-500 uppercase">Peak</p>
              <p className="text-sm font-bold font-mono text-purple-400 mt-1">{store.contest.peakRating}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#0F172A] text-center">
              <p className="text-[9px] text-slate-500 uppercase">Attended</p>
              <p className="text-sm font-bold font-mono text-slate-300 mt-1">{store.contest.attended}</p>
            </div>
          </div>
        </div>

        {/* ACHIEVEMENTS */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
          <p className="text-sm font-semibold text-slate-200 mb-3">Achievements</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {store.badges.map(b => (
              <div key={b.id} className={`p-3 rounded-lg text-center transition-all ${b.unlocked ? 'bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20' : 'bg-[#0F172A] border border-[#1E293B] opacity-50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${b.unlocked ? 'bg-amber-500/20' : 'bg-[#1E293B]'}`}>
                  {b.unlocked ? <Award size={14} className="text-amber-400" /> : <Lock size={14} className="text-slate-600" />}
                </div>
                <p className={`text-[10px] font-medium ${b.unlocked ? 'text-amber-300' : 'text-slate-600'}`}>{b.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RECOMMENDED PROBLEMS */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
          <p className="text-sm font-semibold text-slate-200 mb-3">Recommended Problems</p>
          <div className="space-y-2">
            {store.problemHistory.filter(p => !p.solved).slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#0F172A] border border-[#1E293B]">
                <div className="w-8 h-8 rounded-lg bg-[#1E293B] flex items-center justify-center flex-shrink-0">
                  <Code2 size={14} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-medium ${p.difficulty === 'easy' ? 'text-green-400' : p.difficulty === 'medium' ? 'text-amber-400' : 'text-red-400'}`}>
                      {p.difficulty.charAt(0).toUpperCase() + p.difficulty.slice(1)}
                    </span>
                    <span className="text-[9px] text-slate-600">{p.topic}</span>
                  </div>
                </div>
                <button className="flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                  Solve <ArrowRight size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* RESOURCES */}
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
          <p className="text-sm font-semibold text-slate-200 mb-3">Resources</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Striver Playlist', icon: Video, desc: 'Complete DSA series' },
              { label: 'NeetCode', icon: FileText, desc: 'Roadmap & practice' },
              { label: 'Blind 75', icon: List, desc: 'Curated problem set' },
              { label: 'LeetCode Discuss', icon: FileText, desc: 'Community solutions' },
              { label: 'Official Editorial', icon: BookOpen, desc: 'LeetCode solutions' },
              { label: 'Cheat Sheets', icon: FileText, desc: 'Quick references' },
            ].map(r => (
              <button key={r.label}
                className="flex items-start gap-2.5 p-3 rounded-lg bg-[#0F172A] border border-[#1E293B] hover:border-blue-500/30 transition-all text-left"
              >
                <r.icon size={12} className="text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-200">{r.label}</p>
                  <p className="text-[9px] text-slate-600 mt-0.5">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
          <p className="text-xs font-semibold text-slate-200 mb-3">Weekly Progress</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <defs><linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="solved" stroke="#3B82F6" strokeWidth={2} fill="url(#weeklyGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
          <p className="text-xs font-semibold text-slate-200 mb-3">Monthly Progress</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E293B', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="solved" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-5">
          <p className="text-xs font-semibold text-slate-200 mb-3">Topic Radar</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1E293B" />
              <PolarAngleAxis dataKey="topic" tick={{ fontSize: 8, fill: '#64748B' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8, fill: '#64748B' }} />
              <Radar name="Confidence" dataKey="confidence" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
