import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import PageTransition from './components/PageTransition'
import CommandPalette from './components/CommandPalette'
import { ToastContainer } from './components/Toast'
import { useAchievementChecker } from './hooks/useAchievementChecker'
import DSATracker from './pages/DSATracker'
import Roadmap from './pages/Roadmap'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Statistics from './pages/Statistics'
import LeetCode from './pages/LeetCode'
import CalendarPage from './pages/Calendar'
import CoreSubjects from './pages/CoreSubjects'

const Placeholder = ({ title }: { title: string }) => (
  <PageTransition>
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <p className="text-gray-400 text-lg">{title} — Coming Soon</p>
    </div>
  </PageTransition>
)

function WrappedPage({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const location = useLocation()

  useAchievementChecker()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(o => !o)
      }
      if (e.key === 'Escape') setPaletteOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dsa-tracker" replace />} />
            <Route path="/dsa-tracker" element={<WrappedPage><DSATracker /></WrappedPage>} />
            <Route path="/roadmap" element={<WrappedPage><Roadmap /></WrappedPage>} />
            <Route path="/dashboard" element={<WrappedPage><Dashboard /></WrappedPage>} />
            <Route path="/planner" element={<WrappedPage><Planner /></WrappedPage>} />
            <Route path="/calendar" element={<WrappedPage><CalendarPage /></WrappedPage>} />
            <Route path="/projects" element={<Placeholder title="Projects" />} />
            <Route path="/subjects" element={<WrappedPage><CoreSubjects /></WrappedPage>} />
            <Route path="/leetcode" element={<WrappedPage><LeetCode /></WrappedPage>} />
            <Route path="/contests" element={<Placeholder title="Contests" />} />
            <Route path="/revision" element={<Placeholder title="Revision" />} />
            <Route path="/notes" element={<Placeholder title="Notes" />} />
            <Route path="/habits" element={<Placeholder title="Habits" />} />
            <Route path="/statistics" element={<WrappedPage><Statistics /></WrappedPage>} />
            <Route path="/achievements" element={<Placeholder title="Achievements" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Route>
        </Routes>
      </AnimatePresence>
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ToastContainer />
    </>
  )
}
