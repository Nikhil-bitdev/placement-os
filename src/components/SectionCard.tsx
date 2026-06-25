import { memo, useState } from 'react'
import type { DSASection, SectionStats } from '../types'
import ProgressBar from './ProgressBar'

interface SectionCardProps {
  section: DSASection
  stats: SectionStats
  children: React.ReactNode
}

function SectionCard({ section, stats, children }: SectionCardProps) {
  const [open, setOpen] = useState(false)
  const percent = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-lg overflow-hidden transition-all duration-300 animate-fade-in">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={`section-content-${section.id}`}
        className="w-full flex items-center gap-4 p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>▶</span>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {section.order}. {section.title}
          </h3>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span>{stats.solved}/{stats.total} solved</span>
            <span className="text-green-500">E {stats.easySolved}/{stats.easy}</span>
            <span className="text-yellow-500">M {stats.mediumSolved}/{stats.medium}</span>
            <span className="text-red-500">H {stats.hardSolved}/{stats.hard}</span>
          </div>
        </div>
        <div className="w-24">
          <ProgressBar value={percent} />
          <span className="text-xs text-gray-400 mt-1 block text-right">{percent}%</span>
        </div>
      </button>
      {open && (
        <div id={`section-content-${section.id}`} className="border-t border-gray-100 dark:border-gray-800 transition-all">
          {children}
        </div>
      )}
    </div>
  )
}

export default memo(SectionCard)
