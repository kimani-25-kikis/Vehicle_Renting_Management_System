import React from 'react'
import Navbar from '../Navbar'

import AdminSidebar from '../admin/AdminSidebar'

interface DashboardLayoutProps {
    children: React.ReactNode
}

const AdminDashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Top Navbar */}
            <Navbar />

            {/* Layout Container */}
            <div className="flex pt-16">
                {/* Sidebar */}
                <AdminSidebar />

                {/* Main Content */}
                <main className="flex-1 ml-64 min-h-screen">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>

        </div>
    )
}

export default AdminDashboardLayout