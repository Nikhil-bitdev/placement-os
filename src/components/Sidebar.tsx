import { NavLink, useLocation } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import { useGamificationStore, XP_PER_LEVEL } from '../store/gamificationStore'
import { motion } from 'framer-motion'

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
      { to: '/planner', label: "Today's Planner", icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { to: '/calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    ],
  },
  {
    label: 'Learning',
    items: [
      { to: '/dsa-tracker', label: 'DSA Tracker', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
      { to: '/roadmap', label: 'Full Stack', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
      { to: '/leetcode', label: 'LeetCode', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
      { to: '/subjects', label: 'Core Subjects', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    ],
  },
  {
    label: 'Work',
    items: [
      { to: '/projects', label: 'Projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/statistics', label: 'Statistics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { to: '/achievements', label: 'Achievements', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
      { to: '/contests', label: 'Contests', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ],
  },
]

const activePages = ['/dashboard', '/planner', '/calendar', '/dsa-tracker', '/roadmap', '/projects', '/leetcode', '/subjects', '/statistics', '/achievements', '/contests', '/settings']

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore()
  const { xp, level } = useGamificationStore()
  const location = useLocation()

  const xpInLevel = xp % XP_PER_LEVEL
  const xpProgress = Math.min(100, Math.round((xpInLevel / XP_PER_LEVEL) * 100))

  return (
    <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-white dark:bg-[#09090B] border-r border-stone-200/50 dark:border-[#ffffff08] transition-all duration-300 ${sidebarOpen ? 'w-52' : 'w-16'}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-stone-200/50 dark:border-[#ffffff08]">
        {sidebarOpen && (
          <span className="font-bold text-base bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent tracking-tight">
            Placement OS
          </span>
        )}
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-white/5 transition-colors" aria-label={sidebarOpen ? 'Collapse' : 'Expand'}>
          <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {sidebarOpen ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
          </svg>
        </button>
      </div>

      {/* User area */}
      <div className="px-3 py-3 border-b border-stone-200/50 dark:border-[#ffffff08]">
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              NK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-zinc-300">Nikhil</p>
              <p className="text-[10px] text-blue-400">Level {level}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white">
              NK
            </div>
          </div>
        )}
        {sidebarOpen && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-500">
              <span>XP</span>
              <span className="font-mono">{xpInLevel}/{XP_PER_LEVEL}</span>
            </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: `${xpProgress}%` }} />
              </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-3">
            {sidebarOpen && (
              <p className="px-5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1.5">{group.label}</p>
            )}
            {group.items.map((item) => {
              const isActive = activePages.includes(item.to) && location.pathname === item.to
              const isDisabled = !activePages.includes(item.to)
              return (
                <NavLink
                  key={item.to}
                  to={isDisabled ? '#' : item.to}
                  onClick={(e) => isDisabled && e.preventDefault()}
                  className={`sidebar-item relative ${isActive ? 'sidebar-item-active' : isDisabled ? 'text-zinc-600 cursor-not-allowed' : 'sidebar-item-inactive'}`}
                >
                  {isActive && (
                    <motion.div layoutId="sidebar-indicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                  )}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  {sidebarOpen && <span className="truncate text-sm">{item.label}</span>}
                  {sidebarOpen && isDisabled && <span className="text-[9px] px-1 py-0.5 rounded bg-zinc-800 text-zinc-500 ml-auto uppercase">Soon</span>}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 py-3 border-t border-stone-200/50 dark:border-[#ffffff08]">
        <button onClick={toggleTheme} className="sidebar-item-inactive w-full sidebar-item" aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}>
          {theme === 'light' ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
          {sidebarOpen && <span className="text-sm">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>
      </div>
    </aside>
  )
}
