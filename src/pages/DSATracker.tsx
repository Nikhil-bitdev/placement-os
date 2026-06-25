import { useState } from 'react'
import allSections from '../data/dsa'
import { useDSAStore } from '../store/dsaStore'
import SectionCard from '../components/SectionCard'
import ProblemRow from '../components/ProblemRow'

export default function DSATracker() {
  const [search, setSearch] = useState('')
  const { progress, getSectionStats, markSolved, markUnsolved, toggleFavorite, incrementAttempts, updateNotes, updateTimeTaken } = useDSAStore()

  const filteredSections = allSections
    .map((section) => ({
      ...section,
      problems: section.problems.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((s) => s.problems.length > 0 || !search)

  const totalSolved = allSections.reduce(
    (sum, s) => sum + getSectionStats(s.id).solved, 0
  )
  const totalProblems = allSections.reduce(
    (sum, s) => sum + s.problems.length, 0
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">DSA Tracker</h1>
          <p className="text-sm text-gray-400 mt-1">
            {totalSolved}/{totalProblems} problems solved • Striver's A2Z DSA Sheet
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search problems..."
          className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-3">
        {filteredSections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            stats={getSectionStats(section.id)}
          >
            {section.problems.map((problem) => {
              const p = progress[problem.id] || {
                solved: false, attempts: 0, favorite: false,
                revisionStatus: 'new' as const, notes: '', timeTaken: 0, completedAt: null,
              }
              return (
                <ProblemRow
                  key={problem.id}
                  problem={problem}
                  progress={p}
                  onToggleSolved={() => p.solved ? markUnsolved(problem.id) : markSolved(problem.id)}
                  onToggleFavorite={() => toggleFavorite(problem.id)}
                  onUpdateNotes={(notes) => updateNotes(problem.id, notes)}
                  onUpdateTimeTaken={(min) => updateTimeTaken(problem.id, min)}
                  onIncrementAttempts={() => incrementAttempts(problem.id)}
                />
              )
            })}
          </SectionCard>
        ))}
      </div>

      {filteredSections.length === 0 && search && (
        <div className="text-center py-20 text-gray-400">
          No problems found matching "{search}"
        </div>
      )}
    </div>
  )
}
