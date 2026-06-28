import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search, CheckCircle, Circle, ExternalLink, LayoutGrid, List, ChevronDown,
  ArrowLeftRight, Crosshair, Zap, Calculator, Layers, GitCompare, GitBranch,
  TreePine, BarChart3, Calendar, RotateCcw, Share2, Link2, TrendingUp,
  Award, Binary, type LucideIcon,
} from 'lucide-react'
import { patterns, allQuestions } from '../data/dsaPatterns'
import { useLeetCodeStore } from '../store/leetcodeStore'

function extractSlug(url: string): string | null {
  const m = url.match(/problems\/([^/]+)/)
  return m ? m[1] : null
}

const patternIcons: Record<string, LucideIcon> = {
  'Sliding Window': ArrowLeftRight,
  'Two Pointers': Crosshair,
  'Fast & Slow Pointers': Zap,
  'Prefix Sum': Calculator,
  'Binary Search': Search,
  'Stack': Layers,
  'Linked List Reversal': GitCompare,
  'Trees — DFS': GitBranch,
  'Trees — BFS': TreePine,
  'Heap': BarChart3,
  'Intervals': Calendar,
  'Backtracking': RotateCcw,
  'Graph — BFS/DFS': Share2,
  'Topological Sort': List,
  'Union-Find': Link2,
  'Dynamic Programming — 1D': TrendingUp,
  'Dynamic Programming — 2D': LayoutGrid,
  'Greedy': Award,
  'Trie': GitBranch,
  'Bit Manipulation': Binary,
}

const STORAGE_KEY = 'pattern_solved_ids'

const difficultyColors = {
  Easy: 'text-[#16A34A] bg-green-100 dark:bg-green-500/10 dark:text-green-400',
  Medium: 'text-[#D97706] bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400',
  Hard: 'text-[#DC2626] bg-red-100 dark:bg-red-500/10 dark:text-red-400',
}

export default function DSAPatterns() {
  const leetcodeStore = useLeetCodeStore()

  const [solvedIds, setSolvedIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return new Set(stored ? JSON.parse(stored) : [])
    } catch { return new Set() }
  })

  const [patternFilter, setPatternFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set(patterns.map(p => p.name)))
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...solvedIds]))
  }, [solvedIds])

  useEffect(() => {
    const solvedSlugs = new Set(
      leetcodeStore.problemHistory
        .filter(p => p.solved)
        .map(p => p.id.replace(/^lc-/, ''))
    )
    if (solvedSlugs.size === 0) return
    let changed = false
    const merged = new Set(solvedIds)
    for (const q of allQuestions) {
      if (merged.has(q.id)) continue
      const slug = extractSlug(q.leetcodeUrl)
      if (slug && solvedSlugs.has(slug)) {
        merged.add(q.id)
        changed = true
      }
    }
    if (changed) setSolvedIds(merged)
  }, [])

  const total = allQuestions.length
  const solvedCount = solvedIds.size
  const remaining = total - solvedCount
  const percent = total > 0 ? Math.round((solvedCount / total) * 100) : 0

  const filteredPatterns = useMemo(() => {
    return patterns
      .map(pattern => {
        const questions = pattern.questions.filter(q => {
          if (patternFilter !== 'All' && q.pattern !== patternFilter) return false
          if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false
          if (statusFilter === 'Solved' && !solvedIds.has(q.id)) return false
          if (statusFilter === 'Unsolved' && solvedIds.has(q.id)) return false
          if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false
          return true
        })
        return { ...pattern, questions }
      })
      .filter(p => p.questions.length > 0)
  }, [patternFilter, difficultyFilter, statusFilter, search, solvedIds])

  function toggleSolved(id: string) {
    setSolvedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleExpanded(name: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  function selectPattern(name: string) {
    setPatternFilter(name)
    setViewMode('list')
  }

  const shownPatterns = patternFilter !== 'All'
    ? filteredPatterns
    : filteredPatterns

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Questions', value: total, icon: List, color: 'text-blue-500' },
          { label: 'Solved', value: solvedCount, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Remaining', value: remaining, icon: Circle, color: 'text-amber-500' },
          { label: 'Progress', value: `${percent}%`, icon: null, color: 'text-[#2563EB]', progress: percent },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between mb-2">
              {stat.icon ? (
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <stat.icon size={16} className={stat.color} />
                </div>
              ) : (
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="3" className="dark:stroke-zinc-700" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#2563EB" strokeWidth="3" strokeDasharray={`${percent * 0.88} 88`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#2563EB]">
                    {percent}
                  </span>
                </div>
              )}
            </div>
            <p className={`text-xl font-bold text-[#0F172A] dark:text-white ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-[#F8FAFC] dark:bg-[#09090B] border-b border-[#E2E8F0] dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <select
              value={patternFilter}
              onChange={e => setPatternFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 text-[#334155] dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none cursor-pointer"
            >
              <option value="All">All Patterns</option>
              {patterns.map(p => {
                const Icon = patternIcons[p.name]
                return (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                )
              })}
            </select>

            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 rounded-lg border border-[#E2E8F0] dark:border-zinc-800 p-0.5">
              {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                    difficultyFilter === d
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#334155] dark:hover:text-zinc-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 rounded-lg border border-[#E2E8F0] dark:border-zinc-800 p-0.5">
              {['All', 'Solved', 'Unsolved'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-all ${
                    statusFilter === s
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-[#64748B] hover:text-[#334155] dark:hover:text-zinc-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[140px] max-w-[220px]">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search problems..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-[#E2E8F0] dark:border-zinc-800 text-[#334155] dark:text-zinc-300 placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 rounded-lg border border-[#E2E8F0] dark:border-zinc-800 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:text-[#334155]'}`}
              title="List view"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:text-[#334155]'}`}
              title="Grid view"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {shownPatterns.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-lg text-[#64748B]">No questions match your filters.</p>
          <p className="text-sm text-[#94A3B8] mt-1">Try adjusting them to see more results.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredPatterns.map((pattern, i) => {
            const ps = pattern.questions.filter(q => solvedIds.has(q.id)).length
            const pt = pattern.questions.length
            const pct = pt > 0 ? Math.round((ps / pt) * 100) : 0
            return (
              <motion.button
                key={pattern.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => selectPattern(pattern.name)}
                className="card p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                  {(() => {
                    const Icon = patternIcons[pattern.name]
                    return Icon ? <Icon size={18} className="text-blue-500" /> : null
                  })()}
                </div>
                <p className="text-xs font-semibold text-[#0F172A] dark:text-white leading-tight">{pattern.name}</p>
                <p className="text-[11px] text-[#64748B] mt-1.5">{ps}/{pt} solved</p>
                <div className="mt-2 h-1.5 bg-[#E2E8F0] dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-[#2563EB] transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </motion.button>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {shownPatterns.map((pattern, pi) => {
            const ps = pattern.questions.filter(q => solvedIds.has(q.id)).length
            const pt = pattern.questions.length
            const pct = pt > 0 ? Math.round((ps / pt) * 100) : 0
            const isExpanded = expanded.has(pattern.name)

            return (
              <motion.div
                key={pattern.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: pi * 0.04 }}
                className="card overflow-hidden"
              >
                <button
                  onClick={() => toggleExpanded(pattern.name)}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#F8FAFC] dark:hover:bg-zinc-800/30 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const Icon = patternIcons[pattern.name]
                      return Icon ? <Icon size={16} className="text-blue-500" /> : null
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#0F172A] dark:text-white">{pattern.name}</h3>
                      <span className="text-[11px] text-[#64748B] font-mono">{ps}/{pt}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-[#E2E8F0] dark:bg-zinc-800 rounded-full overflow-hidden max-w-[200px]">
                      <div className="h-full rounded-full bg-[#2563EB] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-[#64748B]" />
                  </motion.div>
                </button>

                {isExpanded && (
                  <div className="border-t border-[#E2E8F0] dark:border-zinc-800">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#E2E8F0] dark:border-zinc-800">
                            <th className="w-10 px-4 py-2.5" />
                            <th className="text-left text-[10px] text-[#64748B] font-medium px-3 py-2.5">Problem</th>
                            <th className="text-left text-[10px] text-[#64748B] font-medium px-3 py-2.5 w-24">Difficulty</th>
                            <th className="text-right text-[10px] text-[#64748B] font-medium px-3 py-2.5 w-16">Solve</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pattern.questions.map((q, qi) => {
                            const solved = solvedIds.has(q.id)
                            return (
                              <tr
                                key={q.id}
                                className={`border-b border-[#E2E8F0] dark:border-zinc-800/50 transition-colors ${
                                  solved ? 'opacity-50' : 'hover:bg-[#F8FAFC] dark:hover:bg-zinc-800/20'
                                }`}
                              >
                                <td className="px-4 py-2.5">
                                  <button
                                    onClick={() => toggleSolved(q.id)}
                                    className="flex items-center justify-center"
                                  >
                                    {solved ? (
                                      <CheckCircle size={16} className="text-[#2563EB]" />
                                    ) : (
                                      <Circle size={16} className="text-[#CBD5E1] dark:text-zinc-600 hover:text-[#2563EB] transition-colors" />
                                    )}
                                  </button>
                                </td>
                                <td className={`px-3 py-2.5 ${solved ? 'opacity-50' : ''}`}>
                                  <a
                                    href={q.leetcodeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`font-medium text-[#334155] dark:text-zinc-300 hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors ${solved ? 'line-through' : ''}`}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {q.title}
                                  </a>
                                </td>
                                <td className="px-3 py-2.5">
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${difficultyColors[q.difficulty]}`}>
                                    {q.difficulty}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  <a
                                    href={q.leetcodeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[#64748B] hover:text-[#2563EB] transition-colors"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <span className="text-[10px] hidden sm:inline">LeetCode</span>
                                    <ExternalLink size={12} />
                                  </a>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
