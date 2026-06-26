import { useState, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Search, CheckCircle, Circle, Clock, BookOpen, FileText, Video,
  Lightbulb, Target, Star, Flame, Globe, FileCode,
  Palette, FileJson, Package, GitBranch, Code2, Wind,
  Layout, Server, Terminal, Database, List, Lock, Rocket, Box,
  ArrowRight, ExternalLink, Zap,
} from 'lucide-react'
import roadmapTechs from '../data/roadmap'
import { useRoadmapStore } from '../store/roadmapStore'
import { useGamificationStore } from '../store/gamificationStore'

const techIcons: Record<string, typeof Globe> = {
  html: FileCode, css: Palette, javascript: FileJson,
  'checkpoint-static': Globe, 'checkpoint-interactive': Code2,
  npm: Package, git: GitBranch, github: Code2,
  react: Code2, tailwind: Wind, 'checkpoint-frontend': Layout,
  nodejs: Server, 'checkpoint-cli': Terminal,
  postgresql: Database, 'checkpoint-crud': List,
  'rest-apis': Globe, jwt: Lock, redis: Database,
  'checkpoint-fullstack': Rocket,
}

const rowsConfig = [
  ['html', 'css', 'javascript', 'checkpoint-static', 'checkpoint-interactive'],
  ['git', 'github', 'npm', 'react', 'tailwind', 'checkpoint-frontend'],
  ['nodejs', 'checkpoint-cli', 'postgresql', 'checkpoint-crud', 'rest-apis', 'jwt', 'redis'],
  ['checkpoint-fullstack'],
]

const rowLabels = ['Foundations', 'Frontend', 'Backend & Database', 'Capstone']

function ResourceCard({ icon: Icon, label, description, href }: { icon: typeof FileText; label: string; description: string; href?: string }) {
  const c = (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 transition-all hover:border-[#93C5FD] dark:hover:border-blue-500/30">
      <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-[#2563EB] dark:text-[#2563EB] dark:text-blue-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[#334155] dark:text-slate-200">{label}</p>
        <p className="text-[11px] text-[#64748B] mt-0.5">{description}</p>
      </div>
      {href && <ExternalLink size={12} className="text-[#94A3B8] mt-1 flex-shrink-0" />}
    </div>
  )
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className="block">{c}</a>
  return c
}

function RoadmapPage() {
  const { getProgress, updateStatus, updateHours, updateConfidence, updateNotes, markComplete, addMiniProject, removeMiniProject, updateMainProject } = useRoadmapStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'completed' | 'learning' | 'not-started'>('all')
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null)

  const allTechs = useMemo(() => [...roadmapTechs].sort((a, b) => a.order - b.order), [])
  const techMap = useMemo(() => {
    const m = new Map<string, typeof roadmapTechs[0]>()
    for (const t of allTechs) m.set(t.id, t)
    return m
  }, [allTechs])

  const nonCheckpoints = useMemo(() => allTechs.filter(t => !t.isCheckpoint), [allTechs])

  const stats = useMemo(() => {
    const completed = nonCheckpoints.filter(t => getProgress(t.id).status === 'completed').length
    const learning = nonCheckpoints.filter(t => getProgress(t.id).status === 'learning').length
    const total = nonCheckpoints.length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    const totalHours = allTechs.reduce((s, t) => s + getProgress(t.id).hoursSpent, 0)
    const active = nonCheckpoints.find(t => getProgress(t.id).status === 'learning')
    const { xp } = useGamificationStore.getState()
    return { completed, learning, total, pct, totalHours, activeName: active?.name || '-', xp }
  }, [getProgress, nonCheckpoints, allTechs])

  const selectedTech = selectedTechId ? techMap.get(selectedTechId) || null : null
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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="card p-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl lg:text-2xl font-bold text-[#0F172A] dark:text-slate-100 tracking-tight">Full Stack Roadmap</h1>
              <span className="text-lg">🚀</span>
            </div>
            <p className="text-sm text-[#64748B] mt-0.5">Track your journey from HTML to Full Stack Engineer</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-full lg:w-44">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 text-[#334155] dark:text-slate-200 placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="flex items-center gap-1">
              {(['all', 'completed', 'learning', 'not-started'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
                    filter === f
                      ? f === 'completed' ? 'bg-green-500 text-white' :
                        f === 'learning' ? 'bg-blue-500 text-white' :
                        f === 'not-started' ? 'bg-[#94A3B8] dark:bg-slate-600 text-white' :
                        'bg-[#CBD5E1] dark:bg-slate-700 text-[#334155] dark:text-slate-200'
                      : 'bg-[#F1F5F9] dark:bg-zinc-800 text-[#64748B] hover:text-[#334155] dark:text-slate-300'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'not-started' ? 'New' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="relative w-9 h-9 flex-shrink-0">
              <svg className="-rotate-90" width="36" height="36" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" className="stroke-[#E2E8F0] dark:stroke-zinc-700" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none"
                  className={stats.pct >= 100 ? 'stroke-[#16A34A] dark:stroke-green-500' : 'stroke-[#2563EB] dark:stroke-blue-500'} strokeWidth="3"
                  strokeDasharray={2 * Math.PI * 15}
                  strokeDashoffset={2 * Math.PI * 15 * (1 - Math.min(100, Math.max(0, stats.pct)) / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8px] font-bold font-mono text-[#334155] dark:text-slate-200">{stats.pct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact stats row */}
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[#E2E8F0] dark:border-zinc-800">
          <MiniStat label="Overall" value={`${stats.pct}%`} />
          <MiniStat label="Completed" value={`${stats.completed}/${stats.total}`} color="text-[#16A34A]" />
          <MiniStat label="Current" value={stats.activeName} color="text-[#2563EB] dark:text-blue-400" />
          <MiniStat label="Hours" value={`${stats.totalHours}`} />
          <MiniStat label="XP" value={`${stats.xp}`} color="text-amber-400" />
        </div>
      </motion.div>

      {/* MAIN: Roadmap + Details Panel — side by side with proper grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* ROADMAP FLOW */}
        <div className="min-w-0 pl-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {rowsConfig.map((row, ri) => {
              const visibleTechs = row
                .map(id => techMap.get(id))
                .filter((t): t is typeof roadmapTechs[0] => {
                  if (!t) return false
                  if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
                  if (filter !== 'all' && !t.isCheckpoint && getProgress(t.id).status !== filter) return false
                  return true
                })
              if (visibleTechs.length === 0) return null

              return (
                <div key={ri}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-3">{rowLabels[ri]}</p>
                  <div className="flex items-center gap-0 overflow-x-auto pb-2">
                    {visibleTechs.map((tech, ti) => {
                      const progress = getProgress(tech.id)
                      const isSelected = selectedTechId === tech.id
                      const status = tech.isCheckpoint
                        ? (progress.status === 'completed' ? 'completed' : 'not-started')
                        : progress.status
                      const Icon = techIcons[tech.id] || Box

                      return (
                        <div key={tech.id} className={`flex items-center flex-shrink-0${ti === 0 ? ' ml-3' : ''}`}>
                          {ti > 0 && (
                            <div className={`h-0.5 w-6 sm:w-8 md:w-10 flex-shrink-0 ${
                              status === 'completed' || progress.status === 'completed'
                                ? 'bg-green-500/60' : status === 'learning' || progress.status === 'learning'
                                ? 'bg-blue-500/60' : 'bg-[#CBD5E1] dark:bg-slate-700'
                            }`} />
                          )}
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (ri * 5 + ti) * 0.04 }}
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTechId(tech.id)}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all min-w-[72px] ${
                              isSelected ? 'bg-[#DBEAFE] dark:bg-blue-500/10 ring-2 ring-[#93C5FD]/40 dark:ring-blue-500/40 ring-inset' : 'hover:bg-[#F1F5F9] dark:hover:bg-zinc-800/50'
                            }`}
                          >
                            <div className={`w-[64px] h-[64px] md:w-[76px] md:h-[76px] rounded-full flex items-center justify-center transition-all duration-300 ${
                              status === 'completed'
                                ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
                                : status === 'learning'
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                                : 'bg-[#F1F5F9] dark:bg-zinc-800 text-[#64748B]'
                            }`}>
                              {status === 'completed' ? <CheckCircle size={24} /> : <Icon size={24} />}
                            </div>
                            <span className={`text-xs font-medium text-center leading-tight max-w-[90px] ${
                              status === 'completed' ? 'text-[#16A34A]' :
                              status === 'learning' ? 'text-[#2563EB] dark:text-blue-400' :
                              'text-[#64748B]'
                            }`}>
                              {tech.name}
                            </span>
                            {progress.hoursSpent > 0 && (
                              <span className="text-[9px] font-mono text-[#94A3B8]">{progress.hoursSpent}h</span>
                            )}
                          </motion.button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {(() => {
              let hasVisible = false
              for (const row of rowsConfig) {
                for (const id of row) {
                  const t = techMap.get(id)
                  if (!t) continue
                  if (search && !t.name.toLowerCase().includes(search.toLowerCase())) continue
                  if (filter !== 'all' && !t.isCheckpoint && getProgress(id).status !== filter) continue
                  hasVisible = true; break
                }
                if (hasVisible) break
              }
              return hasVisible ? null : (
                <p className="text-sm text-[#64748B] text-center py-12">No technologies match your search or filter.</p>
              )
            })()}
          </motion.div>
        </div>

        {/* DETAILS PANEL — 320px fixed, never overlaps because CSS grid enforces it */}
        <div className="xl:sticky xl:top-24 self-start">
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
              onSelectTech={(id) => setSelectedTechId(id)}
              allTechs={allTechs}
            />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card p-6 text-center"
            >
              <Target size={28} className="mx-auto text-[#CBD5E1] dark:text-slate-700 mb-3" />
              <p className="text-sm text-[#64748B]">Select a technology to view details</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* RECOMMENDED NEXT */}
      {recommendedNext && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-[#DBEAFE] dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Zap size={20} className="text-[#2563EB] dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">Recommended Next</p>
                <p className="text-sm font-semibold text-[#334155] dark:text-slate-200 mt-0.5">{recommendedNext.name}</p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {recommendedNext.prerequisites.length > 0
                    ? `Requires: ${recommendedNext.prerequisites.map(p => techMap.get(p)?.name || p).join(', ')}`
                    : 'No prerequisites needed'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#64748B]">{recommendedNext.isCheckpoint ? 'Portfolio project' : '~20 hours'}</span>
              <button onClick={() => { setSelectedTechId(recommendedNext.id); updateStatus(recommendedNext.id, 'learning') }}
                className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Continue <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* RESOURCES */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card p-5"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Resources</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ResourceCard icon={FileText} label="Documentation" description="Official docs and references" />
          <ResourceCard icon={Video} label="YouTube" description="Best video tutorials" />
          <ResourceCard icon={Target} label="Practice" description="Exercises and challenges" />
          <ResourceCard icon={Lightbulb} label="Project Ideas" description="Build real projects" />
        </div>
      </motion.div>
    </div>
  )
}

function MiniStat({ label, value, color = 'text-[#334155] dark:text-slate-200' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#64748B]">{label}</span>
      <span className={`text-sm font-semibold font-mono ${color}`}>{value}</span>
    </div>
  )
}

function TechDetailsPanel({
  tech, progress, onUpdateStatus, onUpdateHours, onUpdateConfidence, onUpdateNotes, onMarkComplete,
  onAddProject, onRemoveProject, onSelectTech, allTechs,
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
  onSelectTech: (id: string) => void
  allTechs: typeof roadmapTechs
}) {
  const [notes, setNotes] = useState(progress.notes)
  const notesTimer = useRef<ReturnType<typeof setTimeout>>()
  const [projectInput, setProjectInput] = useState('')

  const handleNotes = (val: string) => {
    setNotes(val)
    clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(() => onUpdateNotes(val), 500)
  }

  const handleAddProject = () => {
    if (projectInput.trim()) {
      onAddProject(projectInput.trim())
      setProjectInput('')
    }
  }

  const Icon = techIcons[tech.id] || Box
  const pct = progress.status === 'completed' ? 100 : Math.min(100, Math.round((progress.hoursSpent / 40) * 100))
  const estRemaining = Math.max(0, 40 - progress.hoursSpent)

  const prerequisites = tech.prerequisites
    .map(id => allTechs.find(t => t.id === id))
    .filter(Boolean) as typeof roadmapTechs

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E2E8F0] dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            progress.status === 'completed' ? 'bg-green-500/10 text-[#16A34A]' :
            progress.status === 'learning' ? 'bg-[#DBEAFE] dark:bg-blue-500/10 text-[#2563EB] dark:text-blue-400' :
            'bg-[#F1F5F9] dark:bg-zinc-800 text-[#64748B]'
          }`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-[#334155] dark:text-slate-200">{tech.name}</h3>
            <span className="text-[10px] font-medium text-[#64748B] capitalize">{tech.category}</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Progress ring + stats */}
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="-rotate-90" width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" className="stroke-[#E2E8F0] dark:stroke-zinc-700" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" fill="none"
                className={progress.status === 'completed' ? 'stroke-[#16A34A] dark:stroke-green-500' : 'stroke-[#2563EB] dark:stroke-blue-500'} strokeWidth="4"
                strokeDasharray={2 * Math.PI * 24}
                strokeDashoffset={2 * Math.PI * 24 * (1 - pct / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold font-mono text-[#334155] dark:text-slate-200">{progress.status === 'completed' ? '✓' : `${pct}%`}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 flex-1">
            <div>
              <p className="text-[10px] text-[#64748B]">Status</p>
              <p className={`text-xs font-medium capitalize ${
                progress.status === 'completed' ? 'text-[#16A34A]' :
                progress.status === 'learning' ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#64748B]'
              }`}>{progress.status.replace('-', ' ')}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#64748B]">Hours</p>
              <p className="text-xs font-mono text-[#334155] dark:text-slate-200">{progress.hoursSpent}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#64748B]">Confidence</p>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={10} className={i <= progress.confidence ? 'text-amber-400 fill-amber-400' : 'text-[#CBD5E1] dark:text-slate-700'} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-[#64748B]">Est. remaining</p>
              <p className="text-xs font-mono text-[#334155] dark:text-slate-200">{estRemaining}h</p>
            </div>
          </div>
        </div>

        {/* Status toggle */}
        <div className="flex gap-1.5">
          {(['not-started', 'learning', 'completed'] as const).map(s => (
            <button key={s} onClick={() => onUpdateStatus(s)}
              className={`text-[10px] px-2.5 py-1.5 rounded-lg font-medium transition-all flex-1 ${
                progress.status === s
                  ? s === 'completed' ? 'bg-green-500 text-white' :
                    s === 'learning' ? 'bg-blue-500 text-white' :
                    'bg-[#94A3B8] dark:bg-slate-600 text-white'
                  : 'bg-[#F1F5F9] dark:bg-zinc-800 text-[#64748B] hover:text-[#334155] dark:text-slate-300'
              }`}
            >
              {s === 'not-started' ? 'Not Started' : s === 'learning' ? 'Learning' : 'Done'}
            </button>
          ))}
        </div>

        {/* Prerequisites */}
        {prerequisites.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">Prerequisites</p>
            <div className="flex flex-wrap gap-1.5">
              {prerequisites.map(p => (
                <button key={p.id} onClick={() => onSelectTech(p.id)}
                  className="text-[10px] px-2 py-1 rounded-md bg-[#F1F5F9] dark:bg-zinc-800 text-[#64748B] hover:text-[#334155] dark:text-slate-200 hover:bg-[#CBD5E1] dark:bg-slate-700 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {(tech.resources.officialDocs || tech.resources.bestVideo) && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-2">Resources</p>
            <div className="space-y-1.5">
              {tech.resources.officialDocs && (
                <ResourceCard icon={FileText} label="Official Documentation" description="Read the official docs" href={tech.resources.officialDocs} />
              )}
              {tech.resources.bestVideo && (
                <ResourceCard icon={Video} label="Video Tutorial" description="Watch the best video guide" href={tech.resources.bestVideo} />
              )}
            </div>
          </div>
        )}

        {/* Mini Projects */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-2">Mini Projects</p>
          <div className="space-y-1">
            {progress.miniProjects.map((project, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] dark:bg-zinc-900">
                <button onClick={() => onRemoveProject(i)} className="text-[#94A3B8] hover:text-red-400 transition-colors">
                  <Circle size={10} />
                </button>
                <span className="text-xs text-[#334155] dark:text-slate-300 flex-1">{project}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input value={projectInput} onChange={e => setProjectInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddProject()}
                placeholder="Add project..."
                className="flex-1 text-xs px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-lg text-[#334155] dark:text-slate-200 placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button onClick={handleAddProject} className="text-xs px-2 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors">Add</button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] mb-1.5">Notes</p>
          <textarea value={notes} onChange={e => handleNotes(e.target.value)}
            placeholder="Take notes..."
            rows={2}
            className="w-full text-xs px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 rounded-lg text-[#334155] dark:text-slate-200 placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          />
        </div>
      </div>

      {/* Action */}
      <div className="p-4 border-t border-[#E2E8F0] dark:border-zinc-800 space-y-2">
        {progress.status !== 'completed' && (
          <button onClick={onMarkComplete}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            <CheckCircle size={12} /> Mark Complete
          </button>
        )}
        {progress.status !== 'learning' && progress.status !== 'completed' && (
          <button onClick={() => onUpdateStatus('learning')}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Continue Learning
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default RoadmapPage