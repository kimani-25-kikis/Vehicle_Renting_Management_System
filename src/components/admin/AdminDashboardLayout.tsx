// components/admin/AdminDashboardLayout.tsx
import React, { useState } from 'react'
import Navbar from '../Navbar'
import AdminSidebar from '../admin/AdminSidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const AdminDashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Fixed Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg transition-colors mt-16"
      >
        Menu
      </button>

      <div className="flex h-screen">
        {/* Sidebar - starts below navbar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-white shadow-xl lg:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto
            top-16 lg:top-0  /* ← This ensures sidebar starts below navbar on mobile */
          `}
        >
          <div className="h-full overflow-y-auto">
            <AdminSidebar />
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area - Added 10px (2.5rem) space below navbar */}
        <main className="flex-1 overflow-y-auto pt-[100px] lg:pt-10"> 
          <div className="p-4 lg:p-6 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboardLayout