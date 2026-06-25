import { useState, useMemo, useRef } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import {
  Search, CheckCircle, Circle, Clock, BookOpen, FileText, Video,
  Lightbulb, Target, Star, StickyNote, Flame, Globe, FileCode,
  Palette, FileJson, Package, GitBranch, Code2, Wind,
  Layout, Server, Terminal, Database, List, Lock, Rocket, Box,
  ArrowRight, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react'
import roadmapTechs from '../data/roadmap'
import { useRoadmapStore } from '../store/roadmapStore'

const categoryBadge: Record<string, string> = {
  frontend: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  backend: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  database: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  tooling: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
}

const statusRing: Record<string, string> = {
  completed: 'stroke-green-500',
  learning: 'stroke-blue-500',
  'not-started': 'stroke-slate-300 dark:stroke-slate-600',
}

const statusBg: Record<string, string> = {
  completed: 'bg-green-500',
  learning: 'bg-blue-500',
  'not-started': 'bg-slate-300 dark:bg-slate-600',
}

const statusText: Record<string, string> = {
  completed: 'text-green-600 dark:text-green-400',
  learning: 'text-blue-600 dark:text-blue-400',
  'not-started': 'text-slate-500 dark:text-slate-500',
}

const lineColors: Record<string, string> = {
  completed: 'bg-green-400 dark:bg-green-500',
  learning: 'bg-blue-400 dark:bg-blue-500',
  'not-started': 'bg-slate-300 dark:bg-slate-600',
}

const techIcons: Record<string, typeof Globe> = {
  html: FileCode,
  css: Palette,
  javascript: FileJson,
  'checkpoint-static': Globe,
  'checkpoint-interactive': Code2,
  npm: Package,
  git: GitBranch,
  github: Code2,
  react: Code2,
  tailwind: Wind,
  'checkpoint-frontend': Layout,
  nodejs: Server,
  'checkpoint-cli': Terminal,
  postgresql: Database,
  'checkpoint-crud': List,
  'rest-apis': Globe,
  jwt: Lock,
  redis: Database,
  'checkpoint-fullstack': Rocket,
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 80, damping: 15 })
  const display = useTransform(spring, (v) => `${Math.round(v)}${suffix}`)
  useMemo(() => spring.set(value), [value, spring])
  return <motion.span className="font-mono tabular-nums">{display}</motion.span>
}

function ProgressRing({ pct, size = 48, strokeWidth = 4, className = '' }: { pct: number; size?: number; strokeWidth?: number; className?: string }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(100, Math.max(0, pct)) / 100)
  const ringClass = pct >= 100 ? 'stroke-green-500' : 'stroke-blue-500'
  return (
    <svg className={`${className} -rotate-90`} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" className={ringClass} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
    </svg>
  )
}

function StatCard({ label, value, pct, icon: Icon }: { label: string; value: string; pct?: number; icon?: typeof Target }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4 transition-shadow hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        {pct !== undefined ? (
          <div className="relative w-10 h-10 flex-shrink-0">
            <ProgressRing pct={pct} size={40} strokeWidth={3} />
            <div className="absolute inset-0 flex items-center justify-center">
              {Icon && <Icon size={14} className="text-slate-500 dark:text-slate-400" />}
            </div>
          </div>
        ) : Icon ? (
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center flex-shrink-0">
            <Icon size={16} className="text-slate-500 dark:text-slate-400" />
          </div>
        ) : null}
        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-mono tabular-nums">{value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}

function FilterPill({ label, active, count, onClick }: { label: string; active: boolean; count: number; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
        active
          ? 'bg-blue-500 text-white shadow-sm'
          : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {label} <span className="font-mono ml-1 opacity-70">{count}</span>
    </button>
  )
}

function ResourceCard({ icon: Icon, label, description, href }: { icon: typeof FileText; label: string; description: string; href?: string }) {
  const content = (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 transition-all hover:bg-slate-100 dark:hover:bg-slate-700/30 hover:shadow-sm">
      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-slate-500 dark:text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-900 dark:text-slate-200">{label}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      </div>
      {href && <ExternalLink size={12} className="text-slate-400 mt-1 flex-shrink-0" />}
    </div>
  )
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>
  return content
}

function RoadmapHeader() {
  const { getProgress } = useRoadmapStore()
  const nonCheckpoints = useMemo(() => roadmapTechs.filter(t => !t.isCheckpoint), [])
  const { completed, total, pct } = useMemo(() => {
    const c = nonCheckpoints.filter(t => getProgress(t.id).status === 'completed').length
    const t = nonCheckpoints.length
    return { completed: c, total: t, pct: t > 0 ? Math.round((c / t) * 100) : 0 }
  }, [getProgress, nonCheckpoints])
  const totalHours = useMemo(() =>
    roadmapTechs.reduce((s, t) => s + getProgress(t.id).hoursSpent, 0),
    [getProgress]
  )
  const streak = parseInt(localStorage.getItem('placement-os-streak') || '0', 10)
  const [search, setSearch] = useState('')

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 lg:p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Full Stack Roadmap 🚀
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track your journey from HTML to Full Stack Engineer
          </p>
        </div>

        <div className="relative w-full lg:w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search technologies..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 lg:gap-5">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Flame size={14} className="text-amber-500" />
            <span className="font-mono text-slate-900 dark:text-slate-200">{streak}</span>
            <span className="text-xs text-slate-400">days</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Clock size={14} className="text-blue-500" />
            <span className="font-mono text-slate-900 dark:text-slate-200">{totalHours}</span>
            <span className="text-xs text-slate-400">hrs</span>
          </div>
          <div className="relative w-10 h-10">
            <ProgressRing pct={pct} size={40} strokeWidth={3} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold font-mono text-slate-900 dark:text-slate-200">{pct}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

interface FilteredTech {
  id: string
  name: string
  category: string
  order: number
  isCheckpoint: boolean
}

function RoadmapPage() {
  const { getProgress, updateStatus, updateHours, updateConfidence, updateNotes, markComplete, addMiniProject, removeMiniProject, updateMainProject } = useRoadmapStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'completed' | 'learning' | 'not-started'>('all')
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null)

  const allTechs = useMemo(() => [...roadmapTechs].sort((a, b) => a.order - b.order), [])

  const nonCheckpoints = useMemo(() => allTechs.filter(t => !t.isCheckpoint), [allTechs])

  const stats = useMemo(() => {
    const completed = nonCheckpoints.filter(t => getProgress(t.id).status === 'completed').length
    const learning = nonCheckpoints.filter(t => getProgress(t.id).status === 'learning').length
    const notStarted = nonCheckpoints.filter(t => getProgress(t.id).status === 'not-started').length
    const total = nonCheckpoints.length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    const totalHours = allTechs.reduce((s, t) => s + getProgress(t.id).hoursSpent, 0)
    const active = nonCheckpoints.find(t => getProgress(t.id).status === 'learning')
    return { completed, learning, notStarted, total, pct, totalHours, activeName: active?.name || '—' }
  }, [getProgress, nonCheckpoints, allTechs])

  const filteredTechs = useMemo(() => {
    let list = allTechs
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(t => t.name.toLowerCase().includes(q))
    }
    if (filter !== 'all') {
      list = list.filter(t => t.isCheckpoint || getProgress(t.id).status === filter)
    }
    return list
  }, [allTechs, search, filter, getProgress])

  const selectedTech = useMemo(() => {
    if (!selectedTechId) return null
    return allTechs.find(t => t.id === selectedTechId) || null
  }, [selectedTechId, allTechs])

  const selectedProgress = selectedTech ? getProgress(selectedTech.id) : null

  const recommendedNext = useMemo(() => {
    for (const tech of allTechs) {
      if (tech.isCheckpoint) continue
      if (getProgress(tech.id).status !== 'not-started') continue
      const prereqsMet = tech.prerequisites.length === 0 || tech.prerequisites.every(p => getProgress(p).status === 'completed')
      if (prereqsMet) return tech
    }
    return null
  }, [allTechs, getProgress])

  const filterCounts = useMemo(() => ({
    all: nonCheckpoints.length,
    completed: nonCheckpoints.filter(t => getProgress(t.id).status === 'completed').length,
    learning: nonCheckpoints.filter(t => getProgress(t.id).status === 'learning').length,
    'not-started': nonCheckpoints.filter(t => getProgress(t.id).status === 'not-started').length,
  }), [nonCheckpoints, getProgress])

  return (
    <div className="space-y-5">
      <RoadmapHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Overall Progress" value={`${stats.pct}%`} pct={stats.pct} icon={Target} />
            <StatCard label="Completed" value={`${stats.completed}`} pct={stats.completed > 0 ? Math.round((stats.completed / stats.total) * 100) : 0} icon={CheckCircle} />
            <StatCard label="Current" value={stats.activeName} icon={BookOpen} />
            <StatCard label="Total Hours" value={`${stats.totalHours}`} icon={Clock} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <FilterPill label="All" active={filter === 'all'} count={filterCounts.all} onClick={() => setFilter('all')} />
            <FilterPill label="Completed" active={filter === 'completed'} count={filterCounts.completed} onClick={() => setFilter('completed')} />
            <FilterPill label="In Progress" active={filter === 'learning'} count={filterCounts.learning} onClick={() => setFilter('learning')} />
            <FilterPill label="Not Started" active={filter === 'not-started'} count={filterCounts['not-started']} onClick={() => setFilter('not-started')} />
          </div>

          {recommendedNext && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Recommended Next</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                  <BookOpen size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{recommendedNext.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">{recommendedNext.category}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedTechId(recommendedNext.id); updateStatus(recommendedNext.id, 'learning') }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Continue Learning <ArrowRight size={12} />
              </button>
            </motion.div>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Completed</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Current</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Locked</span>
          </div>
        </div>

        {/* Center Panel — Roadmap Flow */}
        <div className="lg:col-span-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-4">
            {filteredTechs.map((tech, i) => {
              const progress = getProgress(tech.id)
              const isSelected = selectedTechId === tech.id
              const status = tech.isCheckpoint ? (progress.status === 'completed' ? 'completed' : 'not-started') : progress.status
              const Icon = techIcons[tech.id] || Box
              const prevTech = filteredTechs[i - 1]
              const prevStatus = prevTech ? getProgress(prevTech.id).status : 'completed'
              const lineColor = prevStatus === 'completed' ? 'bg-green-400 dark:bg-green-500' : prevStatus === 'learning' ? 'bg-blue-400 dark:bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'

              return (
                <div key={tech.id} className="flex flex-col items-center">
                  {i > 0 && <div className={`w-0.5 h-8 ${lineColor} rounded-full transition-colors duration-500`} />}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTechId(tech.id)}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
                      isSelected ? 'ring-2 ring-blue-500/40 bg-blue-50 dark:bg-blue-500/5' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      status === 'completed' ? 'bg-green-500 text-white shadow-sm shadow-green-200 dark:shadow-green-500/20' :
                      status === 'learning' ? 'bg-blue-500 text-white shadow-sm shadow-blue-200 dark:shadow-blue-500/20' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}>
                      {status === 'completed' ? <CheckCircle size={18} /> : <Icon size={18} />}
                    </div>
                    <span className={`text-[11px] font-medium text-center leading-tight max-w-[80px] ${
                      status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      status === 'learning' ? 'text-blue-600 dark:text-blue-400' :
                      'text-slate-500 dark:text-slate-400'
                    }`}>
                      {tech.name}
                    </span>
                  </motion.button>
                </div>
              )
            })}
            {filteredTechs.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-12">No technologies match your search or filter.</p>
            )}
          </motion.div>
        </div>

        {/* Right Panel — Tech Details */}
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-24 space-y-4">
            {selectedTech && selectedProgress ? (
              <TechDetailsPanel
                tech={selectedTech}
                progress={selectedProgress}
                onUpdateStatus={(s) => updateStatus(selectedTech.id, s)}
                onUpdateHours={(h) => updateHours(selectedTech.id, h)}
                onUpdateConfidence={(c) => updateConfidence(selectedTech.id, c)}
                onUpdateNotes={(n) => updateNotes(selectedTech.id, n)}
                onMarkComplete={() => markComplete(selectedTech.id)}
                onAddProject={(p) => addMiniProject(selectedTech.id, p)}
                onRemoveProject={(i) => removeMiniProject(selectedTech.id, i)}
                onUpdateMainProject={(p) => updateMainProject(selectedTech.id, p)}
              />
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 text-center"
              >
                <Target size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Select a technology to view details</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TechDetailsPanel({
  tech, progress, onUpdateStatus, onUpdateHours, onUpdateConfidence, onUpdateNotes, onMarkComplete,
  onAddProject, onRemoveProject, onUpdateMainProject,
}: {
  tech: typeof roadmapTechs[0]
  progress: { status: string; hoursSpent: number; confidence: number; notes: string; miniProjects: string[]; mainProject: string; estimatedRemainingHours: number }
  onUpdateStatus: (s: 'not-started' | 'learning' | 'completed') => void
  onUpdateHours: (h: number) => void
  onUpdateConfidence: (c: 1 | 2 | 3 | 4 | 5) => void
  onUpdateNotes: (n: string) => void
  onMarkComplete: () => void
  onAddProject: (p: string) => void
  onRemoveProject: (i: number) => void
  onUpdateMainProject: (p: string) => void
}) {
  const [notes, setNotes] = useState(progress.notes)
  const notesTimer = useRef<ReturnType<typeof setTimeout>>()
  const [projectInput, setProjectInput] = useState('')
  const [mainProject, setMainProject] = useState(progress.mainProject)
  const mainProjectTimer = useRef<ReturnType<typeof setTimeout>>()

  const handleNotes = (val: string) => {
    setNotes(val)
    clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(() => onUpdateNotes(val), 500)
  }

  const handleMainProject = (val: string) => {
    setMainProject(val)
    clearTimeout(mainProjectTimer.current)
    mainProjectTimer.current = setTimeout(() => onUpdateMainProject(val), 500)
  }

  const handleAddProject = () => {
    if (projectInput.trim()) {
      onAddProject(projectInput.trim())
      setProjectInput('')
    }
  }

  const pct = Math.min(100, Math.round((progress.hoursSpent / Math.max(1, progress.estimatedRemainingHours + progress.hoursSpent)) * 100))
  const Icon = techIcons[tech.id] || Box

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            progress.status === 'completed' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' :
            progress.status === 'learning' ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' :
            'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'
          }`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{tech.name}</h3>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${categoryBadge[tech.category] || 'bg-slate-100 text-slate-600'}`}>
              {tech.category}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <ProgressRing pct={tech.isCheckpoint ? (progress.status === 'completed' ? 100 : 0) : pct} size={56} strokeWidth={4} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-200">
                {tech.isCheckpoint ? (progress.status === 'completed' ? '✓' : '0') : `${pct}%`}
              </span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div>
              <p className="text-[10px] text-slate-400">Status</p>
              <p className={`text-xs font-medium capitalize ${statusText[progress.status]}`}>{progress.status.replace('-', ' ')}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Hours</p>
              <p className="text-xs font-mono text-slate-900 dark:text-slate-200">{progress.hoursSpent}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Confidence</p>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={10} className={i <= progress.confidence ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Checkpoint</p>
              <p className="text-xs text-slate-900 dark:text-slate-200">{tech.isCheckpoint ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Progress</p>
          <div className="flex gap-1.5">
            {(['not-started', 'learning', 'completed'] as const).map(s => (
              <button key={s} onClick={() => onUpdateStatus(s)}
                className={`text-[10px] px-2.5 py-1.5 rounded-lg font-medium transition-all flex-1 ${
                  progress.status === s
                    ? s === 'completed' ? 'bg-green-500 text-white shadow-sm' :
                      s === 'learning' ? 'bg-blue-500 text-white shadow-sm' :
                      'bg-slate-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s === 'not-started' ? 'Not Started' : s === 'learning' ? 'Learning' : 'Done'}
              </button>
            ))}
          </div>
        </div>

        {/* Hours & Confidence Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Hours Spent</p>
            <input type="number" value={progress.hoursSpent} onChange={e => onUpdateHours(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              min="0"
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Confidence</p>
            <input type="range" min="1" max="5" value={progress.confidence}
              onChange={e => onUpdateConfidence(parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        {/* Resources */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Resources</p>
          <div className="space-y-1.5">
            {tech.resources.officialDocs && (
              <ResourceCard icon={FileText} label="Official Docs" description="Read the official documentation" href={tech.resources.officialDocs} />
            )}
            {tech.resources.bestVideo && (
              <ResourceCard icon={Video} label="Best Video" description="Watch the recommended tutorial" href={tech.resources.bestVideo} />
            )}
            <ResourceCard icon={Lightbulb} label="Mini Project" description="Build something to practice" />
            <ResourceCard icon={Target} label="Practice" description="Apply what you've learned" />
          </div>
        </div>

        {/* Mini Projects Checklist */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Mini Projects</p>
          <div className="space-y-1">
            {progress.miniProjects.map((project, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                <button onClick={() => onRemoveProject(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <Circle size={10} />
                </button>
                <span className="text-xs text-slate-700 dark:text-slate-300 flex-1">{project}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input value={projectInput} onChange={e => setProjectInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddProject()}
                placeholder="Add mini project..."
                className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button onClick={handleAddProject} className="text-xs px-2 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">Add</button>
            </div>
          </div>
        </div>

        {/* Main Project */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Main Project</p>
          <input value={mainProject} onChange={e => handleMainProject(e.target.value)}
            placeholder="Describe your main project..."
            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Notes */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Notes</p>
          <textarea value={notes} onChange={e => handleNotes(e.target.value)}
            placeholder="Take notes about this technology..."
            rows={3}
            className="w-full text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 space-y-2">
        {progress.status !== 'completed' && (
          <button onClick={onMarkComplete}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <CheckCircle size={12} /> Mark Complete
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default RoadmapPage