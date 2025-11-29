import React from 'react'
import { 
  Users, Car, Calendar, DollarSign, 
  TrendingUp, AlertTriangle, Star, MessageSquare,
  Eye, Download, Filter
} from 'lucide-react'

const AdminOverview: React.FC = () => {
  // Mock data - replace with actual API calls
  const stats = [
    { 
      label: 'Total Users', 
      value: '1,234', 
      icon: <Users className="text-white" size={24} />, 
      change: '+12%',
      color: 'from-blue-500 to-blue-600',
      description: 'Registered users'
    },
    { 
      label: 'Active Vehicles', 
      value: '89', 
      icon: <Car className="text-white" size={24} />, 
      change: '+5%',
      color: 'from-green-500 to-green-600',
      description: 'Available for rent'
    },
    { 
      label: 'Today\'s Bookings', 
      value: '23', 
      icon: <Calendar className="text-white" size={24} />, 
      change: '+8%',
      color: 'from-orange-500 to-orange-600',
      description: 'New reservations'
    },
    { 
      label: 'Revenue', 
      value: '$45,678', 
      icon: <DollarSign className="text-white" size={24} />, 
      change: '+15%',
      color: 'from-purple-500 to-purple-600',
      description: 'This month'
    },
  ]

  const quickActions = [
    { label: 'View Reports', icon: <Eye size={20} />, color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Export Data', icon: <Download size={20} />, color: 'bg-green-500 hover:bg-green-600' },
    { label: 'Manage Filters', icon: <Filter size={20} />, color: 'bg-orange-500 hover:bg-orange-600' },
  ]

  const recentActivities = [
    { id: 1, type: 'booking', message: 'New booking #1234 created', time: '2 min ago', user: 'John Doe' },
    { id: 2, type: 'user', message: 'User Sarah Wilson registered', time: '5 min ago', user: 'System' },
    { id: 3, type: 'payment', message: 'Payment received for booking #1233', time: '10 min ago', user: 'Mike Johnson' },
    { id: 4, type: 'review', message: 'New review submitted for Toyota Camry', time: '15 min ago', user: 'Emily Davis' },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="text-blue-500" size={20} />
      case 'user': return <Users className="text-green-500" size={20} />
      case 'payment': return <DollarSign className="text-purple-500" size={20} />
      case 'review': return <Star className="text-orange-500" size={20} />
      default: return <MessageSquare className="text-gray-500" size={20} />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`${action.color} text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-gradient-to-r ${stat.color} rounded-2xl shadow-2xl p-6 text-white transform hover:scale-105 transition-transform duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                {stat.icon}
              </div>
              <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                {stat.change}
              </span>
            </div>
            <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
            <p className="font-semibold mb-1">{stat.label}</p>
            <p className="text-white/80 text-sm">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recent Activities</h3>
            <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-500 text-sm">By {activity.user}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 text-sm">{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">System Status</h3>
          <div className="space-y-4">
            {[
              { service: 'Database', status: 'operational', response: '45ms' },
              { service: 'API Server', status: 'operational', response: '120ms' },
              { service: 'Payment Gateway', status: 'degraded', response: '280ms' },
              { service: 'Email Service', status: 'operational', response: '85ms' },
            ].map((system, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900">{system.service}</p>
                  <p className="text-gray-500 text-sm">Response: {system.response}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  system.status === 'operational' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {system.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOverview