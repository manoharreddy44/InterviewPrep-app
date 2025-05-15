import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/sidebar/Sidebar'
import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-close sidebar on resize to desktop
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-base-200 relative overflow-x-hidden">
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-white shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar - hidden on mobile until toggled, always visible on md+ screens */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Overlay when sidebar is open on mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Main content - adjusted for full width to accommodate charts */}
      <main className={`flex-1 md:ml-64 mt-14 md:mt-0 transition-all duration-300 ${
        isMobile && sidebarOpen ? 'opacity-50' : 'opacity-100'
      }`}>
        <Outlet />
      </main>
    </div>
  )
} 