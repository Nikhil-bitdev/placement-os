import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
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
import DSAPatterns from './pages/DSAPatterns'
import AuthPage from './pages/AuthPage'

const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full min-h-[60vh]">
    <p className="text-gray-400 text-lg">{title} — Coming Soon</p>
  </div>
)

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-[#F8FAFC] dark:bg-zinc-900" />
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function AppRoutes() {
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
      <Routes location={location}>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<Layout />}>
          {['/dsa-tracker', '/roadmap', '/dashboard', '/planner', '/calendar',
            '/projects', '/subjects', '/leetcode', '/patterns', '/contests', '/revision',
            '/notes', '/habits', '/statistics', '/achievements', '/settings'].map(p => (
            <Route key={p} path={p} element={
              <ProtectedRoute>
                {p === '/dsa-tracker' ? <DSATracker /> :
                 p === '/roadmap' ? <Roadmap /> :
                 p === '/dashboard' ? <Dashboard /> :
                 p === '/planner' ? <Planner /> :
                 p === '/calendar' ? <CalendarPage /> :
                 p === '/subjects' ? <CoreSubjects /> :
                 p === '/leetcode' ? <LeetCode /> :
                 p === '/patterns' ? <DSAPatterns /> :
                 p === '/statistics' ? <Statistics /> :
                 <Placeholder title={p.slice(1).replace(/^\w/, c => c.toUpperCase())} />}
              </ProtectedRoute>
            } />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ToastContainer />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
