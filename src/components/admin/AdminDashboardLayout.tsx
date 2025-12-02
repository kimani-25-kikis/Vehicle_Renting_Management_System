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
      <Navbar />

      {/* Mobile Menu Button - Positioned inside navbar area */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg transition-colors"
      >
        Menu
      </button>

      <div className="flex h-screen pt-16"> {/* ← THIS IS THE KEY LINE */}
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-white shadow-xl lg:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto
            pt-16 lg:pt-0  // ← Important: don't double-offset on desktop
          `}
        >
          <div className="h-full overflow-y-auto pb-10">
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboardLayout