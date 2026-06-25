import { memo, useState } from 'react'
import type { DSAProblem, DSAProblemProgress } from '../types'

interface ProblemRowProps {
  problem: DSAProblem
  progress: DSAProblemProgress
  onToggleSolved: () => void
  onToggleFavorite: () => void
  onUpdateNotes: (notes: string) => void
  onUpdateTimeTaken: (minutes: number) => void
  onIncrementAttempts: () => void
}

const difficultyColors = {
  easy: 'text-green-500 bg-green-50 dark:bg-green-500/10',
  medium: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10',
  hard: 'text-red-500 bg-red-50 dark:bg-red-500/10',
}

function ProblemRow({
  problem,
  progress,
  onToggleSolved,
  onToggleFavorite,
  onUpdateNotes,
  onUpdateTimeTaken,
  onIncrementAttempts,
}: ProblemRowProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-gray-50 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <input
          type="checkbox"
          checked={progress.solved}
          onChange={(e) => { e.stopPropagation(); onToggleSolved() }}
          className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
        />
        <span className={`text-xs text-gray-400 ${expanded ? 'rotate-90' : ''} transition-transform`}>▶</span>
        <span className={`flex-1 text-sm ${progress.solved ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
          {problem.name}
        </span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${difficultyColors[problem.difficulty]}`}>
          {problem.difficulty}
        </span>
        <span className="text-xs text-gray-400">{problem.platform}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
          aria-label={progress.favorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`text-sm ${progress.favorite ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        >
          ★
        </button>
      </button>

      {expanded && (
        <div className="px-5 pb-4 pt-1 ml-8 space-y-3 animate-fade-in">
          {problem.companyTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {problem.companyTags.map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <a
            href={problem.solutionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-indigo-500 hover:underline"
          >
            View Solution →
          </a>

          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={(e) => { e.stopPropagation(); onIncrementAttempts() }}
              className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Attempts: {progress.attempts}
            </button>
            <label className="text-xs text-gray-400 flex items-center gap-1">
              Time:
              <input
                type="number"
                value={progress.timeTaken || ''}
                onChange={(e) => onUpdateTimeTaken(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs"
                placeholder="min"
                onClick={(e) => e.stopPropagation()}
              />
              min
            </label>
          </div>

          <textarea
            value={progress.notes}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="Personal notes..."
            className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs resize-none h-20 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default memo(ProblemRow)
