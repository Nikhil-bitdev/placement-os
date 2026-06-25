import { NavLink } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⏹' },
  { to: '/planner', label: "Today's Planner", icon: '📅' },
  { to: '/calendar', label: 'Study Calendar', icon: '📆' },
  { to: '/dsa-tracker', label: 'DSA Tracker', icon: '💻' },
  { to: '/roadmap', label: 'Full Stack Roadmap', icon: '🗺' },
  { to: '/projects', label: 'Projects', icon: '📁' },
  { to: '/subjects', label: 'Core Subjects', icon: '📖' },
  { to: '/leetcode', label: 'LeetCode', icon: '⌨️' },
  { to: '/contests', label: 'Contests', icon: '🏆' },
  { to: '/revision', label: 'Revision', icon: '🔄' },
  { to: '/notes', label: 'Notes', icon: '📝' },
  { to: '/habits', label: 'Habits', icon: '✅' },
  { to: '/statistics', label: 'Statistics', icon: '📊' },
  { to: '/achievements', label: 'Achievements', icon: '🏅' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

const activePages = ['/dsa-tracker', '/roadmap']

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, theme, toggleTheme } = useUIStore()

  return (
    <aside
      className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ${
        sidebarOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200/50 dark:border-gray-700/50">
        {sidebarOpen && (
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Placement OS
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = activePages.includes(item.to)
          return (
            <NavLink
              key={item.to}
              to={isActive ? item.to : '#'}
              onClick={(e) => !isActive && e.preventDefault()}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="truncate text-sm flex-1">{item.label}</span>
              )}
              {sidebarOpen && !isActive && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 uppercase tracking-wider">
                  Soon
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Theme toggle */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-400"
        >
          <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
          {sidebarOpen && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>
      </div>
    </aside>
  )
}
