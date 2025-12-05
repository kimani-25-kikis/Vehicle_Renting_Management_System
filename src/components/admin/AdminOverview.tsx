// components/admin/AdminOverview.tsx
import { useGetVehicleByIdQuery } from '../../features/api/vehiclesApi'
import React, { useState, useEffect } from 'react'
import { 
  Users, Car, Calendar, DollarSign, 
  TrendingUp, AlertTriangle, Star, MessageSquare,
  Eye, Download, Filter, Clock, CheckCircle,
  XCircle, Loader, RefreshCw, TrendingDown,
  CreditCard, BarChart3, Activity, Zap,
  ChevronUp, ChevronDown, Shield, Database,
  MapPin, BarChart, Target, Award,
  ShoppingBag, Package, Truck, Bell,
  Building, Globe, Navigation, Home,
  UserCheck, UserPlus, ShoppingCart, TrendingUp as TrendingUpIcon,
  ArrowUpRight, ArrowDownRight, Percent, Rocket
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

// Import existing APIs
import { useGetAllUsersQuery } from '../../features/api/UserApi'
import { useGetVehiclesQuery } from '../../features/api/vehiclesApi'
import { 
  useGetAllBookingsQuery,  // For admin to get ALL bookings
  useGetBookingStatsQuery  // For stats if available
} from '../../features/api/bookingsApi'

// Types for our data
interface DashboardStats {
  totalUsers: number
  totalVehicles: number
  availableVehicles: number
  totalBookings: number
  activeBookings: number
  pendingBookings: number
  completedBookings: number
  todayBookings: number
  todayRevenue: number
  totalRevenue: number
}

interface RecentActivity {
  id: number
  type: 'booking' | 'user' | 'payment' | 'review'
  message: string
  user_name: string
  time: string
  amount?: number
  vehicle?: string
}

interface TopVehicle {
  vehicle_id: number
  manufacturer: string
  model: string
  rental_count: number
  daily_rate: number
}

interface SystemStatus {
  service: string
  status: 'operational' | 'degraded' | 'down'
  response_time: number
}

// Animated components
const AnimatedCard = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -3 }}
    className={`transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
)

const AdminOverview: React.FC = () => {
  const navigate = useNavigate()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month')

  // Fetch data from existing APIs
  const { 
    data: users = [], 
    isLoading: usersLoading, 
    refetch: refetchUsers 
  } = useGetAllUsersQuery()

  const { 
    data: vehiclesResponse, 
    isLoading: vehiclesLoading, 
    refetch: refetchVehicles 
  } = useGetVehiclesQuery({})

  const { 
  data: allBookingsResponse, 
  isLoading: bookingsLoading, 
  refetch: refetchBookings 
} = useGetAllBookingsQuery({})

const { 
  data: statsResponse,
  isLoading: statsLoading 
} = useGetBookingStatsQuery()

  // Parse data
  const statsFromApi = statsResponse?.stats || {}
  const vehicles = vehiclesResponse?.vehicles || []
  const bookingsArray = Array.isArray(allBookingsResponse?.data) ? allBookingsResponse?.data : (allBookingsResponse?.data ? [allBookingsResponse.data] : [])

  

  // Calculate all statistics
 const calculateStats = (): DashboardStats => {
  const today = new Date().toISOString().split('T')[0]
  const now = new Date()

  // Filter bookings by status - CORRECTED
  const completedBookings = bookingsArray.filter(b => 
    b.booking_status?.toLowerCase() === 'completed'
  )
  
  const activeBookings = bookingsArray.filter(b => 
    ['confirmed', 'active'].includes(b.booking_status?.toLowerCase() || '')
  )
  
  const pendingBookings = bookingsArray.filter(b => 
    b.booking_status?.toLowerCase() === 'pending'
  )

  // Today's bookings - check if booking_date OR created_at is today
  const todayBookings = bookingsArray.filter(b => {
  // Try multiple date fields to find bookings from today
  const dateFields = ['pickup_date', 'booking_date', 'created_at', 'updated_at']
  
  for (const field of dateFields) {
    const dateValue = b[field as keyof typeof b]
    if (dateValue && typeof dateValue === 'string') {
      try {
        const date = new Date(dateValue)
        const dateString = date.toISOString().split('T')[0]
        if (dateString === today) {
          return true
        }
      } catch (e) {
        // Ignore invalid dates
      }
    }
  }
  return false
})

  // Revenue calculations - ONLY from completed bookings
  const todayRevenue = todayBookings
    .filter(b => b.booking_status?.toLowerCase() === 'completed')
    .reduce((sum, b) => sum + (b.total_amount || 0), 0)

  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)

  // Available vehicles
  const availableVehicles = vehicles.filter(v => v.availability === true).length

  return {
    totalUsers: users.length,
    totalVehicles: vehicles.length,
    availableVehicles,
    totalBookings: bookingsArray.length,
    activeBookings: activeBookings.length,
    pendingBookings: pendingBookings.length,
    completedBookings: completedBookings.length,
    todayBookings: todayBookings.length,
    todayRevenue,
    totalRevenue,
  }
}

  const stats = calculateStats()

  // Calculate growth percentages (mock data for now)
  const calculateGrowth = () => {
    return {
      users: Math.round((users.length / Math.max(users.length - 5, 1) - 1) * 100),
      vehicles: Math.round((vehicles.length / Math.max(vehicles.length - 2, 1) - 1) * 100),
      bookings: Math.round((bookingsArray.length / Math.max(bookingsArray.length - 3, 1) - 1) * 100),
      revenue: Math.round((stats.totalRevenue / Math.max(stats.totalRevenue - 1000, 1) - 1) * 100),
    }
  }

  const growth = calculateGrowth()

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format number with K/M suffixes
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Get growth indicator
  const getGrowthIndicator = (value: number) => {
    if (value > 0) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: <ArrowUpRight size={16} />,
        text: `${value}%`
      }
    } else if (value < 0) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: <ArrowDownRight size={16} />,
        text: `${Math.abs(value)}%`
      }
    }
    return {
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: <TrendingUp size={16} />,
      text: '0%'
    }
  }

  // Recent activities from bookings
  const getRecentActivities = (): RecentActivity[] => {
    const recentBookings = [...bookingsArray]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    return recentBookings.map((booking, index) => ({
      id: index + 1,
      type: 'booking' as const,
      message: `Booking #${booking.booking_id} - ${booking.booking_status}`,
      user_name: booking.user_name || `User ${booking.user_id}`,
      time: new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amount: booking.total_amount,
      vehicle: booking.vehicle_manufacturer ? `${booking.vehicle_manufacturer} ${booking.vehicle_model}` : 'Unknown Vehicle'
    }))
  }

  // Top vehicles (mock for now)
  const getTopVehicles = (): TopVehicle[] => {
    if (vehicles.length === 0) return []
    
    return vehicles.slice(0, 5).map(vehicle => ({
      vehicle_id: vehicle.vehicle_id,
      manufacturer: vehicle.specification?.manufacturer || 'Unknown',
      model: vehicle.specification?.model || 'Unknown',
      rental_count: Math.floor(Math.random() * 50) + 10, // Mock data
      daily_rate: vehicle.rental_rate || 0
    }))
  }

  // System status
  const systemStatus: SystemStatus[] = [
    { service: 'Database', status: 'operational', response_time: 45 },
    { service: 'API Server', status: 'operational', response_time: 120 },
    { service: 'Authentication', status: 'operational', response_time: 85 },
    { service: 'Payment Gateway', status: 'operational', response_time: 280 },
  ]

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchUsers(),
        refetchVehicles(),
        refetchBookings()
      ])
      toast.success('Dashboard refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh dashboard')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Loading state
  const isLoading = usersLoading || vehiclesLoading || bookingsLoading

  if (isLoading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="mx-auto text-blue-600 animate-spin mb-4" size={48} />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Gathering business insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <AnimatedCard>
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl shadow-xl border border-blue-100 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg">
                  <Shield className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 mt-2">Welcome back! Here's what's happening in your car rental business.</p>
                </div>
              </div>

              {/* Timeframe selector */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  {(['today', 'week', 'month', 'year'] as const).map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimeframe(time)}
                      className={`px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                        timeframe === time
                          ? 'bg-white text-blue-600 shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/admin/reports')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <BarChart3 size={20} />
                View Reports
              </button>
              <button
                onClick={() => navigate('/admin/bookings')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Calendar size={20} />
                Manage Bookings
              </button>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          {
            label: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: <DollarSign className="text-white" size={24} />,
            growth: growth.revenue,
            color: 'from-purple-500 to-purple-600',
            description: 'All-time earnings',
            loading: bookingsLoading
          },
          {
            label: 'Active Users',
            value: formatNumber(stats.totalUsers),
            icon: <Users className="text-white" size={24} />,
            growth: growth.users,
            color: 'from-blue-500 to-blue-600',
            description: 'Registered customers',
            loading: usersLoading
          },
          {
            label: 'Available Vehicles',
            value: stats.availableVehicles.toString(),
            icon: <Car className="text-white" size={24} />,
            growth: growth.vehicles,
            color: 'from-green-500 to-green-600',
            description: 'Ready for rent',
            loading: vehiclesLoading
          },
          {
            label: "Today's Bookings",
            value: stats.todayBookings.toString(),
            icon: <Calendar className="text-white" size={24} />,
            growth: growth.bookings,
            color: 'from-orange-500 to-orange-600',
            description: 'New reservations',
            loading: bookingsLoading
          },
        ].map((stat, index) => {
          const growthIndicator = getGrowthIndicator(stat.growth)
          
          return (
            <AnimatedCard key={index} delay={index * 0.1}>
              <div className={`bg-gradient-to-r ${stat.color} rounded-3xl shadow-xl p-5 md:p-6 text-white relative overflow-hidden group`}>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      {stat.loading ? <Loader className="animate-spin" size={20} /> : stat.icon}
                    </div>
                    <span className={`${growthIndicator.bgColor} ${growthIndicator.color} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                      {growthIndicator.icon}
                      {growthIndicator.text}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-2xl md:text-3xl font-bold mb-1">
                      {stat.loading ? '...' : stat.value}
                    </h3>
                    <p className="font-semibold text-sm md:text-base">{stat.label}</p>
                  </div>
                  <p className="text-white/80 text-xs md:text-sm">{stat.description}</p>
                </div>
              </div>
            </AnimatedCard>
          )
        })}
      </div>

      {/* Secondary Stats and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <AnimatedCard delay={0.2}>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Activity className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quick Stats</h3>
              </div>
              <span className="text-sm text-gray-500">
                Real-time
              </span>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Total Bookings', value: stats.totalBookings, icon: <ShoppingBag size={18} />, color: 'bg-blue-500' },
                { label: 'Active Bookings', value: stats.activeBookings, icon: <Clock size={18} />, color: 'bg-green-500' },
                { label: 'Pending Bookings', value: stats.pendingBookings, icon: <AlertTriangle size={18} />, color: 'bg-yellow-500' },
                { label: 'Completed Bookings', value: stats.completedBookings, icon: <CheckCircle size={18} />, color: 'bg-purple-500' },
                { label: 'Revenue Today', value: formatCurrency(stats.todayRevenue), icon: <CreditCard size={18} />, color: 'bg-green-600' },
                { label: 'Total Vehicles', value: stats.totalVehicles, icon: <Truck size={18} />, color: 'bg-orange-500' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 ${item.color} rounded-xl flex items-center justify-center`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm md:text-base">{item.label}</p>
                    </div>
                  </div>
                  <div className="text-lg md:text-xl font-bold text-gray-900">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>

        {/* Recent Activities */}
        <AnimatedCard delay={0.3} className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Clock className="text-green-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Recent Activities</h3>
              </div>
              <button 
                onClick={() => navigate('/admin/bookings')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                View All
                <ChevronUp className="rotate-90" size={16} />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {getRecentActivities().length > 0 ? (
                getRecentActivities().map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                    onClick={() => navigate(`/admin/bookings`)}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      {activity.type === 'booking' && <Calendar className="text-blue-500" size={20} />}
                      {activity.type === 'user' && <UserPlus className="text-green-500" size={20} />}
                      {activity.type === 'payment' && <CreditCard className="text-purple-500" size={20} />}
                      {activity.type === 'review' && <Star className="text-orange-500" size={20} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{activity.message}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-gray-500 text-sm">By {activity.user_name}</span>
                        <span className="text-gray-400 hidden sm:inline">•</span>
                        <span className="text-gray-500 text-sm">{activity.time}</span>
                        {activity.vehicle && (
                          <>
                            <span className="text-gray-400 hidden sm:inline">•</span>
                            <span className="text-gray-500 text-sm truncate">{activity.vehicle}</span>
                          </>
                        )}
                      </div>
                      {activity.amount && (
                        <div className="mt-2">
                          <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(activity.amount)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 whitespace-nowrap hidden md:block">
                      Today
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No recent activities</p>
                  <p className="text-gray-400 text-sm mt-1">Bookings will appear here</p>
                </div>
              )}
            </div>

            {/* Quick Insights */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Insights</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl">
                  <div className="text-2xl font-bold text-blue-600">{stats.todayBookings}</div>
                  <div className="text-sm text-gray-600">Today's Bookings</div>
                </div>
                <div className="bg-green-50 p-3 rounded-2xl">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalBookings > 0 
                      ? `${Math.round((stats.completedBookings / stats.totalBookings) * 100)}%`
                      : '0%'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <AnimatedCard delay={0.4}>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Database className="text-purple-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">System Status</h3>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                All Systems OK
              </span>
            </div>
            
            <div className="space-y-4">
              {systemStatus.map((system, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    {system.status === 'operational' && <CheckCircle className="text-green-500" size={20} />}
                    {system.status === 'degraded' && <AlertTriangle className="text-yellow-500" size={20} />}
                    {system.status === 'down' && <XCircle className="text-red-500" size={20} />}
                    <div>
                      <p className="font-medium text-gray-900">{system.service}</p>
                      <p className="text-sm text-gray-500">{system.response_time}ms response</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    system.status === 'operational' 
                      ? 'bg-green-100 text-green-800' 
                      : system.status === 'degraded'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {system.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Performance Metrics */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-2xl">
                  <div className="text-xl font-bold text-blue-600">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-2xl">
                  <div className="text-xl font-bold text-green-600">{stats.availableVehicles}</div>
                  <div className="text-sm text-gray-600">Available Vehicles</div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Top Vehicles */}
        <AnimatedCard delay={0.5}>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Car className="text-orange-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Top Vehicles</h3>
              </div>
              <button 
                onClick={() => navigate('/admin/vehicles')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {getTopVehicles().length > 0 ? (
                getTopVehicles().map((vehicle, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl flex items-center justify-center">
                        <Car className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {vehicle.manufacturer} {vehicle.model}
                        </p>
                        <p className="text-sm text-gray-500">{formatCurrency(vehicle.daily_rate)}/day</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{vehicle.rental_count} rentals</p>
                      <p className="text-sm text-green-600">
                        {formatCurrency(vehicle.rental_count * vehicle.daily_rate)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Car className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No vehicle data available</p>
                </div>
              )}
            </div>

            {/* Vehicle Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Vehicle Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl">
                  <div className="text-xl font-bold text-blue-600">{stats.availableVehicles}</div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
                <div className="bg-green-50 p-3 rounded-2xl">
                  <div className="text-xl font-bold text-green-600">
                    {stats.totalVehicles > 0 
                      ? `${Math.round((stats.availableVehicles / stats.totalVehicles) * 100)}%`
                      : '0%'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Availability Rate</div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Summary Footer */}
      <AnimatedCard delay={0.6}>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl shadow-xl border border-blue-100 p-5 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div>
              <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
              <div className="text-gray-600 text-sm">Total Bookings</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.availableVehicles}</div>
              <div className="text-gray-600 text-sm">Available Vehicles</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-orange-600">{stats.todayBookings}</div>
              <div className="text-gray-600 text-sm">Today's Bookings</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-purple-600">{formatCurrency(stats.todayRevenue)}</div>
              <div className="text-gray-600 text-sm">Today's Revenue</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-blue-200 text-center">
            <p className="text-gray-600 text-sm">
              Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {' • '}
              <button 
                onClick={handleRefresh}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Refresh now
              </button>
            </p>
          </div>
        </div>
      </AnimatedCard>
    </div>
  )
}

export default AdminOverview