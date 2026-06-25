import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useUIStore } from '../store/uiStore'
import { motion, AnimatePresence } from 'framer-motion'

function FABItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 bg-zinc-900 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 shadow-xl"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </motion.button>
  )
}

function FAB() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-16 right-0 space-y-2"
          >
            <FABItem icon="📝" label="Quick Note" onClick={() => navigate('/notes')} />
            <FABItem icon="⏱️" label="Pomodoro" onClick={() => navigate('/planner')} />
            <FABItem icon="🎯" label="Add Task" onClick={() => navigate('/planner')} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center text-xl"
      >
        <motion.span animate={{ rotate: open ? 45 : 0 }}>+</motion.span>
      </motion.button>
    </div>
  )
}

export default function Layout() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-dvh bg-stone-50 dark:bg-[#09090B]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-indigo-500 focus:text-white focus:rounded-lg">
        Skip to main content
      </a>
      <Sidebar />
      <div role="banner" className="sr-only">Placement OS</div>
      <main id="main-content" className={`transition-all duration-300 min-h-dvh ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
      <FAB />
    </div>
  )
}
