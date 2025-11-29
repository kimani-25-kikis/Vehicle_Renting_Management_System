import React from 'react'
import { Link, useLocation } from 'react-router'
import {
  BarChart3, Users, Car, Calendar, Settings,
  Shield, DollarSign, MessageSquare, AlertTriangle,
  Home, TrendingUp, FileText, CheckCircle
} from 'lucide-react'

const AdminSidebar: React.FC = () => {
  const location = useLocation()
  
  const menuItems = [
    { 
      id: 'overview', 
      label: 'Dashboard', 
      icon: <BarChart3 size={20} />, 
      path: '/admin',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: <Users size={20} />, 
      path: '/admin/users',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'vehicles', 
      label: 'Vehicles', 
      icon: <Car size={20} />, 
      path: '/admin/vehicles',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      id: 'bookings', 
      label: 'Bookings', 
      icon: <Calendar size={20} />, 
      path: '/admin/bookings',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'payments', 
      label: 'Payments', 
      icon: <DollarSign size={20} />, 
      path: '/admin/payments',
      color: 'from-emerald-500 to-emerald-600'
    },
    { 
      id: 'reviews', 
      label: 'Reviews', 
      icon: <MessageSquare size={20} />, 
      path: '/admin/reviews',
      color: 'from-pink-500 to-pink-600'
    },
    { 
      id: 'support', 
      label: 'Support', 
      icon: <AlertTriangle size={20} />, 
      path: '/admin/support',
      color: 'from-red-500 to-red-600'
    },
  ]

  return (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white min-h-screen fixed left-0 top-0 pt-16 shadow-2xl">
      <div className="p-6">
        {/* Admin Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          <p className="text-blue-200 text-sm mt-1">Car Rental Management</p>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`group flex items-center gap-4 px-4 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-2xl scale-105`
                    : 'text-blue-100 hover:bg-blue-700 hover:text-white'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${
                  isActive ? 'bg-white/20' : 'bg-blue-700/50 group-hover:bg-white/20'
                }`}>
                  {item.icon}
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-blue-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-blue-200 text-sm">
              <span>Online Users</span>
              <span className="font-bold text-green-400">24</span>
            </div>
            <div className="flex items-center justify-between text-blue-200 text-sm">
              <span>Pending Actions</span>
              <span className="font-bold text-orange-400">8</span>
            </div>
          </div>
        </div>

        {/* Back to Site */}
        <div className="mt-6 pt-6 border-t border-blue-700">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-blue-100 hover:bg-blue-700 hover:text-white transition-all group"
          >
            <Home size={20} />
            Back to Site
            <TrendingUp size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminSidebar