import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { FileText, Clock, Plus, Target } from 'lucide-react'
import Sidebar from './Sidebar'
import { useUIStore } from '../store/uiStore'
import { motion, AnimatePresence } from 'framer-motion'

function FABItem({ icon: Icon, label, onClick }: { icon: typeof FileText; label: string; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-[12px] px-4 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC] shadow-card"
    >
      <Icon size={14} className="text-[#64748B]" />
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
            <FABItem icon={FileText} label="Quick Note" onClick={() => navigate('/notes')} />
            <FABItem icon={Clock} label="Pomodoro" onClick={() => navigate('/planner')} />
            <FABItem icon={Target} label="Add Task" onClick={() => navigate('/planner')} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-[14px] bg-[#2563EB] text-white shadow-lg shadow-blue-500/20 flex items-center justify-center text-lg"
      >
        <motion.span animate={{ rotate: open ? 45 : 0 }}>+</motion.span>
      </motion.button>
    </div>
  )
}

export default function Layout() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-dvh bg-[#F8FAFC] dark:bg-[#09090B]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#2563EB] focus:text-white focus:rounded-[10px]">
        Skip to main content
      </a>
      <Sidebar />
      <div role="banner" className="sr-only">Placement OS</div>
      <main id="main-content" className={`transition-all duration-300 min-h-dvh ${sidebarOpen ? 'ml-52' : 'ml-16'}`}>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <FAB />
    </div>
  )
}
