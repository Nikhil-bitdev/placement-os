import { memo, useState } from 'react'
import type { RoadmapTech, TechProgress } from '../types'

interface TechCardProps {
  tech: RoadmapTech
  progress: TechProgress
  onUpdateStatus: (status: TechProgress['status']) => void
  onUpdateHours: (hours: number) => void
  onUpdateNotes: (notes: string) => void
  onToggleComplete: () => void
  onUpdateConfidence: (confidence: TechProgress['confidence']) => void
  onUpdateEstimatedHours: (hours: number) => void
}

function TechCard({ tech, progress, onUpdateStatus, onUpdateHours, onUpdateNotes, onToggleComplete, onUpdateConfidence, onUpdateEstimatedHours }: TechCardProps) {
  const [expanded, setExpanded] = useState(false)
  const isCheckpoint = tech.isCheckpoint

  const statusColors = {
    'not-started': 'bg-gray-100 dark:bg-gray-800 text-gray-400',
    'learning': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    'completed': 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  }

  return (
    <div className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border shadow-lg overflow-hidden transition-all duration-300 animate-fade-in ${
      progress.status === 'completed'
        ? 'border-green-200 dark:border-green-800'
        : progress.status === 'learning'
        ? 'border-indigo-200 dark:border-indigo-800'
        : 'border-white/20 dark:border-gray-700/20'
    }`}>
      <button
        onClick={() => !isCheckpoint && setExpanded(!expanded)}
        className={`w-full flex items-center gap-4 p-5 text-left transition-colors ${
          isCheckpoint ? 'cursor-default' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
        }`}
      >
        {!isCheckpoint && (
          <span className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>▶</span>
        )}
        {isCheckpoint && (
          <span className="text-indigo-400">◆</span>
        )}
        <div className="flex-1">
          <h3 className={`font-semibold ${isCheckpoint ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {isCheckpoint ? 'Checkpoint: ' : ''}{tech.name}
          </h3>
          {!isCheckpoint && (
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span className="capitalize">{tech.category}</span>
              <span>{progress.hoursSpent}h spent</span>
              <span>Confidence: {progress.confidence}/5</span>
            </div>
          )}
        </div>
        {!isCheckpoint && (
          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusColors[progress.status]}`}>
            {progress.status === 'completed' ? '✓ Completed' : progress.status === 'learning' ? 'Learning' : 'Not Started'}
          </span>
        )}
      </button>

      {!isCheckpoint && expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4 animate-fade-in">
          <div className="flex items-center gap-3">
            {tech.resources.officialDocs && (
              <a href={tech.resources.officialDocs} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">
                Official Docs →
              </a>
            )}
            {tech.resources.bestVideo && (
              <a href={tech.resources.bestVideo} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline">
                Best Video →
              </a>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs text-gray-400 mr-1">Status:</span>
              <select
                value={progress.status}
                onChange={(e) => onUpdateStatus(e.target.value as TechProgress['status'])}
                className="text-xs px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <option value="not-started">Not Started</option>
                <option value="learning">Learning</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Hours Spent</label>
              <input
                type="number"
                value={progress.hoursSpent}
                onChange={(e) => onUpdateHours(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Est. Remaining Hours</label>
              <input
                type="number"
                value={progress.estimatedRemainingHours}
                onChange={(e) => onUpdateEstimatedHours(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Confidence</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={(e) => { e.stopPropagation(); onUpdateConfidence(n as TechProgress['confidence']) }}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    progress.confidence >= n
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Notes</label>
            <textarea
              value={progress.notes}
              onChange={(e) => onUpdateNotes(e.target.value)}
              placeholder="Learning notes, key concepts, etc."
              className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs resize-none h-20 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {isCheckpoint && (
        <div className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400 animate-fade-in">
          Build projects to solidify your skills before moving forward.
        </div>
      )}
    </div>
  )
}

export default memo(TechCard)
