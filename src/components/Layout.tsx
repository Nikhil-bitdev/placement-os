import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useUIStore } from '../store/uiStore'

export default function Layout() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-[#050506] transition-colors duration-300">
      {/* Skip to main content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-indigo-500 focus:text-white focus:rounded-lg">
        Skip to main content
      </a>
      <Sidebar />
      {/* Banner landmark for the skip link target */}
      <div role="banner" className="sr-only">Placement OS</div>
      <main id="main-content" className={`transition-all duration-300 min-h-dvh ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
