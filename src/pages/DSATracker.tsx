import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import allSections from '../data/dsa'
import { useDSAStore } from '../store/dsaStore'

function LegendBar() {
  const { progress } = useDSAStore()

  const totals = useMemo(() => {
    let easy = 0, medium = 0, hard = 0
    let easySolved = 0, mediumSolved = 0, hardSolved = 0
    for (const section of allSections) {
      for (const p of section.problems) {
        if (p.difficulty === 'easy') {
          easy++
          if (progress[p.id]?.solved) easySolved++
        } else if (p.difficulty === 'medium') {
          medium++
          if (progress[p.id]?.solved) mediumSolved++
        } else {
          hard++
          if (progress[p.id]?.solved) hardSolved++
        }
      }
    }
    return { easy, medium, hard, easySolved, mediumSolved, hardSolved }
  }, [progress])

  return (
    <div className="card-premium p-4 flex items-center gap-6 text-sm">
      <span className="text-green-400">🟢 Easy <span className="text-white font-mono">{totals.easySolved}/{totals.easy}</span></span>
      <span className="text-yellow-400">🟡 Medium <span className="text-white font-mono">{totals.mediumSolved}/{totals.medium}</span></span>
      <span className="text-red-400">🔴 Hard <span className="text-white font-mono">{totals.hardSolved}/{totals.hard}</span></span>
      <span className="text-zinc-500 text-xs ml-auto">Solving the path to product companies</span>
    </div>
  )
}

function SectionFlowCard({ section, index, total }: { section: typeof allSections[number]; index: number; total: number }) {
  const { progress, getSectionStats, toggleProblem, setSectionExpanded, expandedSections } = useDSAStore()
  const stats = getSectionStats(section.id)
  const isExpanded = expandedSections[section.id] ?? false
  const solvedCount = stats.solved
  const totalCount = stats.total
  const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0
  const isComplete = solvedCount === totalCount && totalCount > 0

  const counts = useMemo(() => {
    const easy = { total: 0, solved: 0 }
    const medium = { total: 0, solved: 0 }
    const hard = { total: 0, solved: 0 }
    for (const p of section.problems) {
      if (p.difficulty === 'easy') { easy.total++; if (progress[p.id]?.solved) easy.solved++ }
      else if (p.difficulty === 'medium') { medium.total++; if (progress[p.id]?.solved) medium.solved++ }
      else { hard.total++; if (progress[p.id]?.solved) hard.solved++ }
    }
    return { easy, medium, hard }
  }, [section, progress])

  const ringColor = isComplete ? '#22c55e' : pct > 50 ? '#6366f1' : pct > 0 ? '#f59e0b' : '#27272a'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="relative"
    >
      {index < total - 1 && (
        <div className="absolute left-8 top-full w-0.5 h-6 bg-gradient-to-b from-indigo-500/40 to-transparent z-0" />
      )}
      <div className={`relative z-10 card-premium p-5 ${isComplete ? 'ring-1 ring-green-500/30' : ''} ${isExpanded ? 'ring-1 ring-indigo-500/30' : ''}`}>
        <div className="flex items-start gap-5">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#27272a" strokeWidth="3" />
              <circle cx="28" cy="28" r="24" fill="none" stroke={ringColor} strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-mono font-bold text-white">{isComplete ? '✓' : `${pct}%`}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-xs text-indigo-400 font-mono">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="text-base font-semibold text-stone-800 dark:text-white">{section.title}</h3>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-zinc-500">Solved: <span className="text-white font-mono">{solvedCount}/{totalCount}</span></span>
              <span className="text-[10px] text-green-400">{counts.easy.solved}/{counts.easy.total} Easy</span>
              <span className="text-[10px] text-yellow-400">{counts.medium.solved}/{counts.medium.total} Medium</span>
              <span className="text-[10px] text-red-400">{counts.hard.solved}/{counts.hard.total} Hard</span>
              <span className="text-[10px] text-zinc-500">• {totalCount} problems</span>
            </div>
            <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                style={{ width: `${pct}%` }} />
            </div>
          </div>
          <button
            onClick={() => setSectionExpanded(section.id, !isExpanded)}
            className="text-xs text-zinc-400 hover:text-white transition-colors p-1"
            aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="block">
              ▼
            </motion.span>
          </button>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-1">
                {section.problems.map((problem) => {
                  const isSolved = !!progress[problem.id]?.solved
                  return (
                    <a
                      key={problem.id}
                      href={problem.solutionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-4 px-3 py-2 rounded-lg text-sm transition-all ${
                        isSolved ? 'opacity-60' : 'hover:bg-zinc-800/30'
                      }`}
                    >
                      <span className={`text-xs font-mono w-4 ${isSolved ? 'text-green-400' : 'text-zinc-600'}`}>
                        {isSolved ? '✓' : '○'}
                      </span>
                      <span className={`flex-1 ${isSolved ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
                        {problem.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">{problem.platform}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        problem.difficulty === 'easy' ? 'text-green-400 bg-green-500/10' :
                        problem.difficulty === 'medium' ? 'text-yellow-400 bg-yellow-500/10' :
                        'text-red-400 bg-red-500/10'
                      }`}>
                        {problem.difficulty}
                      </span>
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); toggleProblem(section.id, problem.id) }}
                        className={`text-[10px] px-2 py-1 rounded ${
                          isSolved ? 'bg-zinc-800 text-zinc-400' : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                        }`}
                      >
                        {isSolved ? 'Undo' : 'Done'}
                      </button>
                    </a>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function DSATracker() {
  const [search, setSearch] = useState('')
  const { progress, getSectionStats } = useDSAStore()

  const filteredSections = useMemo(
    () => allSections.filter((s) => s.title.toLowerCase().includes(search.toLowerCase())),
    [search]
  )

  const totalSolved = useMemo(
    () => allSections.reduce((sum, s) => sum + getSectionStats(s.id).solved, 0),
    [getSectionStats, progress]
  )
  const totalProblems = useMemo(
    () => allSections.reduce((sum, s) => sum + s.problems.length, 0),
    []
  )
  const totalPct = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium p-6"
      >
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#27272a" strokeWidth="4" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#6366f1" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - totalPct / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-mono font-bold text-white">{totalPct}%</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">DSA Roadmap</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {totalSolved} / {totalProblems} problems solved
            </p>
          </div>
        </div>
      </motion.div>

      <LegendBar />

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search sections..."
        aria-label="Search sections"
        className="w-full card-premium px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <div className="space-y-6">
        {filteredSections.map((section, i) => (
          <SectionFlowCard key={section.id} section={section} index={i} total={filteredSections.length} />
        ))}
      </div>

      {filteredSections.length === 0 && search && (
        <div className="text-center py-20 text-zinc-500">
          No sections found matching "{search}"
        </div>
      )}
    </div>
  )
}
