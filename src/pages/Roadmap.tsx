import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import roadmapTechs from '../data/roadmap'
import { useRoadmapStore } from '../store/roadmapStore'

const categoryDisplay: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  tooling: 'Tooling',
}

const categoryOrder = ['Basics', 'Frontend', 'Backend', 'Database', 'Tooling']

const statusColors: Record<string, string> = {
  'not-started': 'border-zinc-800 bg-zinc-900/50',
  'learning': 'border-yellow-500/30 bg-yellow-500/5',
  'completed': 'border-green-500/30 bg-green-500/5',
}

const accentColors: Record<string, string> = {
  frontend: 'from-blue-500 to-cyan-500',
  backend: 'from-green-500 to-emerald-500',
  database: 'from-purple-500 to-pink-500',
  tooling: 'from-orange-500 to-red-500',
}

const badgeColors: Record<string, string> = {
  Frontend: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Backend: 'bg-green-500/10 text-green-400 border-green-500/20',
  Database: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Tooling: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

const defaultBadgeColor = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'

function HeaderSection({ completed, learning, notStarted, total }: { completed: number; learning: number; notStarted: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium p-6 lg:p-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-stone-900 dark:text-white tracking-tight">
              Full Stack Roadmap
            </h1>
            <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
              Track your journey to becoming a full-stack engineer
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-stone-600 dark:text-zinc-300">Progress</span>
            <span className="font-mono text-indigo-400 font-semibold">{completed}/{total}</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-500">{pct}% Complete</span>
          </div>
          <div className="w-full max-w-md h-2 bg-stone-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
        </div>
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#27272a" strokeWidth="6" />
            <circle
              cx="60" cy="60" r="54" fill="none" stroke="#6366f1" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-mono font-bold text-stone-900 dark:text-white">{pct}%</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 mt-4 text-sm">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-zinc-400">{completed} Completed</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-zinc-400">{learning} In Progress</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-600" />
          <span className="text-zinc-400">{notStarted} Not Started</span>
        </span>
      </div>
    </motion.div>
  )
}

function LegendBar() {
  return (
    <div className="flex items-center gap-4 text-xs text-zinc-400">
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        Completed
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        In Progress
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
        Not Started
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
        Checkpoint
      </span>
    </div>
  )
}

function TechNodeCard({ tech }: { tech: typeof roadmapTechs[0] }) {
  const { getProgress, updateStatus, updateHours, updateConfidence } = useRoadmapStore()
  const progress = getProgress(tech.id)
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`relative card-premium p-4 border ${statusColors[progress.status] || statusColors['not-started']} ${
        tech.isCheckpoint ? 'border-dashed border-indigo-500/30' : ''
      } transition-all duration-300`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
        accentColors[tech.category] || 'from-indigo-500 to-purple-500'
      } rounded-t-xl`} />

      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full shrink-0 ${
          progress.status === 'completed' ? 'bg-green-500' :
          progress.status === 'learning' ? 'bg-yellow-500' :
          tech.isCheckpoint ? 'bg-indigo-500' :
          'bg-zinc-600'
        }`} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800 dark:text-white">
            {tech.name}
            {tech.isCheckpoint && (
              <span className="text-[10px] text-indigo-400 ml-2">Checkpoint</span>
            )}
          </p>
          {!tech.isCheckpoint && (
            <p className="text-[10px] text-zinc-500 mt-0.5">{categoryDisplay[tech.category] || tech.category}</p>
          )}
        </div>

        {!tech.isCheckpoint && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-zinc-400 hover:text-white transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <motion.span animate={{ rotate: expanded ? 180 : 0 }}>
              ▼
            </motion.span>
          </button>
        )}
      </div>

      {!tech.isCheckpoint && (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progress.status === 'completed' ? 'bg-green-500' :
                progress.status === 'learning' ? 'bg-yellow-500' :
                'bg-zinc-700'
              }`}
              style={{ width: `${Math.min(100, progress.hoursSpent * 5)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-zinc-500">{progress.hoursSpent}h</span>
        </div>
      )}

      <AnimatePresence>
        {expanded && !tech.isCheckpoint && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-3">
              <div className="flex gap-2">
                {(['not-started', 'learning', 'completed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => updateStatus(tech.id, status)}
                    className={`text-[10px] px-2 py-1 rounded-full transition-colors ${
                      progress.status === status
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-zinc-800/50 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {status === 'not-started' ? 'Not Started' :
                     status === 'learning' ? 'Learning' : 'Completed'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">Hours:</span>
                <input
                  type="number"
                  value={progress.hoursSpent}
                  onChange={e => updateHours(tech.id, Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 px-2 py-1 text-xs font-mono bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white"
                  min="0"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">Confidence:</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={progress.confidence}
                  onChange={e => updateConfidence(tech.id, parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-[10px] font-mono text-indigo-400 w-4">{progress.confidence}/5</span>
              </div>

              <div className="flex gap-3">
                {tech.resources.officialDocs && (
                  <a
                    href={tech.resources.officialDocs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Docs →
                  </a>
                )}
                {tech.resources.bestVideo && (
                  <a
                    href={tech.resources.bestVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Video →
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CategorySection({ title, techs }: { title: string; techs: typeof roadmapTechs }) {
  const { getProgress } = useRoadmapStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badgeColors[title] || defaultBadgeColor}`}>
          {title}
        </span>
        <div className="flex-1 h-px bg-zinc-800/50" />
        <span className="text-xs text-zinc-500">
          {techs.filter(t => getProgress(t.id).status === 'completed').length}/{techs.length}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {techs.map(tech => (
          <TechNodeCard key={tech.id} tech={tech} />
        ))}
      </div>
    </motion.div>
  )
}

export default function Roadmap() {
  const { getProgress } = useRoadmapStore()

  const { completed, learning, notStarted, total } = useMemo(() => {
    const nonCheckpoints = roadmapTechs.filter(t => !t.isCheckpoint)
    return {
      completed: nonCheckpoints.filter(t => getProgress(t.id).status === 'completed').length,
      learning: nonCheckpoints.filter(t => getProgress(t.id).status === 'learning').length,
      notStarted: nonCheckpoints.filter(t => getProgress(t.id).status === 'not-started').length,
      total: nonCheckpoints.length,
    }
  }, [getProgress])

  const categories = useMemo(() => {
    const cats = new Map<string, typeof roadmapTechs>()
    for (const tech of roadmapTechs) {
      const displayName = categoryDisplay[tech.category] || tech.category
      const existing = cats.get(displayName) || []
      existing.push(tech)
      cats.set(displayName, existing)
    }
    return Array.from(cats.entries())
  }, [])

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const ai = categoryOrder.indexOf(a[0])
      const bi = categoryOrder.indexOf(b[0])
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })
  }, [categories])

  return (
    <div className="space-y-6">
      <HeaderSection
        completed={completed}
        learning={learning}
        notStarted={notStarted}
        total={total}
      />
      <LegendBar />
      {sortedCategories.map(([category, techs]) => (
        <CategorySection key={category} title={category} techs={techs} />
      ))}
    </div>
  )
}
