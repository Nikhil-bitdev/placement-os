import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useUIStore } from '../store/uiStore'

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
    </div>
  )
}
