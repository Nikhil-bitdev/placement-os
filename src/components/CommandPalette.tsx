import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const commands = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'DSA Tracker', path: '/dsa-tracker' },
  { label: 'Roadmap', path: '/roadmap' },
  { label: 'Planner', path: '/planner' },
  { label: 'Statistics', path: '/statistics' },
  { label: 'Projects', path: '/projects' },
  { label: 'Core Subjects', path: '/subjects' },
  { label: 'LeetCode', path: '/leetcode' },
  { label: 'Contests', path: '/contests' },
  { label: 'Revision', path: '/revision' },
  { label: 'Notes', path: '/notes' },
  { label: 'Habits', path: '/habits' },
  { label: 'Settings', path: '/settings' },
]

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const filtered = query
    ? commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].path)
      onClose()
    }
    if (e.key === 'Escape') onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-zinc-900 border border-zinc-700/50 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages..."
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-600">ESC</span>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.map((cmd, i) => (
                <button
                  key={cmd.path}
                  onClick={() => { navigate(cmd.path); onClose() }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    i === selectedIndex ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {cmd.label}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">No results found</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
