// components/admin/AdminOverview.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ComposedChart
} from 'recharts';

// Import existing APIs
import { useGetAllUsersQuery } from '../../features/api/UserApi';
import { useGetVehiclesQuery } from '../../features/api/vehiclesApi';
import { 
  useGetAllBookingsQuery,
  useGetBookingStatsQuery
} from '../../features/api/bookingsApi';

// Import icons
import { 
  Users, Car, Calendar, DollarSign, 
  TrendingUp, Loader, RefreshCw,
  CreditCard, BarChart3, Activity, Zap,
  ChevronUp, Shield, Database,
  MapPin, Award, ShoppingBag,
  Truck, UserPlus,
  ArrowUpRight, ArrowDownRight,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon, TrendingUp as TrendingUpIcon,
  Download, Clock,
} from 'lucide-react';

// Types for our data
interface DashboardStats {
  totalUsers: number;
  totalVehicles: number;
  availableVehicles: number;
  totalBookings: number;
  activeBookings: number;
  pendingBookings: number;
  completedBookings: number;
  todayBookings: number;
  todayRevenue: number;
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  growth: number;
}

interface VehicleCategoryChartData {
  name: string;
  value: number;
  revenue: number;
  percentage: number;
  [key: string]: string | number;
}

interface BookingStatusChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface UserGrowthData {
  month: string;
  newUsers: number;
  totalUsers: number;
}

interface TopVehicle {
  vehicle_id: number;
  manufacturer: string;
  model: string;
  rental_count: number;
  daily_rate: number;
  revenue: number;
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
);

const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [selectedChartType, setSelectedChartType] = useState<'line' | 'bar' | 'area'>('line');

  // Fetch data from existing APIs
  const { 
    data: users = [], 
    isLoading: usersLoading, 
    refetch: refetchUsers 
  } = useGetAllUsersQuery();

  const { 
    data: vehiclesResponse, 
    isLoading: vehiclesLoading, 
    refetch: refetchVehicles 
  } = useGetVehiclesQuery({});

  const { 
    data: allBookingsResponse, 
    isLoading: bookingsLoading, 
    refetch: refetchBookings 
  } = useGetAllBookingsQuery({});

  const { 
    data: statsResponse,
    isLoading: statsLoading 
  } = useGetBookingStatsQuery();

  // Parse data
  const statsFromApi = statsResponse?.stats || {};
  const vehicles = vehiclesResponse?.vehicles || [];
  const bookingsArray = Array.isArray(allBookingsResponse?.data) ? allBookingsResponse?.data : (allBookingsResponse?.data ? [allBookingsResponse.data] : []);

  // Calculate all statistics with memoization
  const calculateStats = useMemo((): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const completedBookings = bookingsArray.filter(b => 
      b.booking_status?.toLowerCase() === 'completed'
    );
    
    const activeBookings = bookingsArray.filter(b => 
      ['confirmed', 'active'].includes(b.booking_status?.toLowerCase() || '')
    );
    
    const pendingBookings = bookingsArray.filter(b => 
      b.booking_status?.toLowerCase() === 'pending'
    );

    // Today's bookings
    const todayBookings = bookingsArray.filter(b => {
      const dateFields = ['pickup_date', 'booking_date', 'created_at', 'updated_at'];
      for (const field of dateFields) {
        const dateValue = b[field as keyof typeof b];
        if (dateValue && typeof dateValue === 'string') {
          try {
            const date = new Date(dateValue);
            const dateString = date.toISOString().split('T')[0];
            if (dateString === today) {
              return true;
            }
          } catch (e) {}
        }
      }
      return false;
    });

    // Monthly bookings (current month)
    const monthlyBookings = bookingsArray.filter(b => {
      const dateFields = ['pickup_date', 'booking_date', 'created_at'];
      for (const field of dateFields) {
        const dateValue = b[field as keyof typeof b];
        if (dateValue && typeof dateValue === 'string') {
          try {
            const date = new Date(dateValue);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
              return true;
            }
          } catch (e) {}
        }
      }
      return false;
    });

    // Yearly bookings (current year)
    const yearlyBookings = bookingsArray.filter(b => {
      const dateFields = ['pickup_date', 'booking_date', 'created_at'];
      for (const field of dateFields) {
        const dateValue = b[field as keyof typeof b];
        if (dateValue && typeof dateValue === 'string') {
          try {
            const date = new Date(dateValue);
            if (date.getFullYear() === currentYear) {
              return true;
            }
          } catch (e) {}
        }
      }
      return false;
    });

    // Revenue calculations
    const todayRevenue = todayBookings
      .filter(b => b.booking_status?.toLowerCase() === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    
    const monthlyRevenue = monthlyBookings
      .filter(b => b.booking_status?.toLowerCase() === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
    
    const yearlyRevenue = yearlyBookings
      .filter(b => b.booking_status?.toLowerCase() === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);

    // Available vehicles
    const availableVehicles = vehicles.filter(v => v.availability === true).length;

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
      monthlyRevenue,
      yearlyRevenue,
    };
  }, [users, vehicles, bookingsArray]);

  const stats = calculateStats;

  // Generate revenue data for charts (last 6 months)
  const generateRevenueData = useMemo((): RevenueData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: RevenueData[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = months[date.getMonth()];
      
      // Filter bookings for this month
      const monthBookings = bookingsArray.filter(b => {
        const dateFields = ['pickup_date', 'booking_date', 'created_at'];
        for (const field of dateFields) {
          const dateValue = b[field as keyof typeof b];
          if (dateValue && typeof dateValue === 'string') {
            try {
              const bookingDate = new Date(dateValue);
              if (
                bookingDate.getMonth() === date.getMonth() &&
                bookingDate.getFullYear() === date.getFullYear() &&
                b.booking_status?.toLowerCase() === 'completed'
              ) {
                return true;
              }
            } catch (e) {}
          }
        }
        return false;
      });

      const revenue = monthBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const bookingsCount = monthBookings.length;
      
      const previousMonthRevenue = i > 0 ? 
        (data[i-1]?.revenue || 0) : 
        revenue * 0.8; // Mock previous month
        
      const growth = previousMonthRevenue > 0 
        ? Math.round(((revenue - previousMonthRevenue) / previousMonthRevenue) * 100)
        : 0;

      data.push({
        month: monthName,
        revenue,
        bookings: bookingsCount,
        growth
      });
    }
    
    return data;
  }, [bookingsArray]);

  // Generate vehicle category chart data for Recharts
  const generateVehicleCategoryChartData = useMemo((): VehicleCategoryChartData[] => {
    const categories: { [key: string]: { count: number, revenue: number } } = {};
    
    vehicles.forEach(vehicle => {
      const category = vehicle.specification?.vehicle_type || 'Other';
      if (!categories[category]) {
        categories[category] = { count: 0, revenue: 0 };
      }
      categories[category].count++;
      
      // Calculate revenue for this vehicle type from completed bookings
      const vehicleBookings = bookingsArray.filter(b => 
        b.vehicle_id === vehicle.vehicle_id && 
        b.booking_status?.toLowerCase() === 'completed'
      );
      categories[category].revenue += vehicleBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    });

    const totalVehicles = Object.values(categories).reduce((sum, cat) => sum + cat.count, 0);
    
    return Object.entries(categories).map(([category, data]) => ({
      name: category,
      value: data.count,
      revenue: data.revenue,
      percentage: Math.round((data.count / totalVehicles) * 100)
    })).sort((a, b) => b.revenue - a.revenue);
  }, [vehicles, bookingsArray]);

  // Generate booking status chart data for Recharts
  const generateBookingStatusChartData = useMemo((): BookingStatusChartData[] => {
    const statuses: { [key: string]: number } = {};
    
    bookingsArray.forEach(booking => {
      const status = booking.booking_status?.toLowerCase() || 'unknown';
      statuses[status] = (statuses[status] || 0) + 1;
    });

    const colors: { [key: string]: string } = {
      'completed': '#10B981',
      'confirmed': '#3B82F6',
      'pending': '#F59E0B',
      'active': '#8B5CF6',
      'cancelled': '#EF4444',
      'unknown': '#6B7280'
    };

    return Object.entries(statuses).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: colors[status] || '#6B7280'
    }));
  }, [bookingsArray]);

  // Generate user growth data
  const generateUserGrowthData = useMemo((): UserGrowthData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: UserGrowthData[] = [];
    
    // Sort users by creation date
    const sortedUsers = [...users].sort((a, b) => 
      new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );

    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthName = months[date.getMonth()];
      
      const monthUsers = sortedUsers.filter(user => {
        try {
          const userDate = new Date(user.created_at || 0);
          return (
            userDate.getMonth() === date.getMonth() &&
            userDate.getFullYear() === date.getFullYear()
          );
        } catch (e) {
          return false;
        }
      });

      const cumulativeUsers = sortedUsers.filter(user => {
        try {
          const userDate = new Date(user.created_at || 0);
          const targetDate = new Date(date);
          return userDate <= targetDate;
        } catch (e) {
          return false;
        }
      }).length;

      data.push({
        month: monthName,
        newUsers: monthUsers.length,
        totalUsers: cumulativeUsers
      });
    }
    
    return data;
  }, [users]);

  // Get top vehicles with actual rental data
  const getTopVehicles = useMemo((): TopVehicle[] => {
    const vehicleRentals: { [key: number]: { rental_count: number, revenue: number } } = {};
    
    // Count rentals per vehicle
    bookingsArray.forEach(booking => {
      if (booking.vehicle_id) {
        if (!vehicleRentals[booking.vehicle_id]) {
          vehicleRentals[booking.vehicle_id] = { rental_count: 0, revenue: 0 };
        }
        vehicleRentals[booking.vehicle_id].rental_count++;
        if (booking.booking_status?.toLowerCase() === 'completed' && booking.total_amount) {
          vehicleRentals[booking.vehicle_id].revenue += booking.total_amount;
        }
      }
    });

    // Find vehicle details and create top list
    const topVehicles: TopVehicle[] = vehicles
      .map(vehicle => {
        const rentalData = vehicleRentals[vehicle.vehicle_id] || { rental_count: 0, revenue: 0 };
        return {
          vehicle_id: vehicle.vehicle_id,
          manufacturer: vehicle.specification?.manufacturer || 'Unknown',
          model: vehicle.specification?.model || 'Unknown',
          rental_count: rentalData.rental_count,
          daily_rate: vehicle.rental_rate || 0,
          revenue: rentalData.revenue
        };
      })
      .sort((a, b) => b.rental_count - a.rental_count)
      .slice(0, 5);

    return topVehicles;
  }, [vehicles, bookingsArray]);

  // Calculate growth percentages
  const calculateGrowth = () => {
    const revenueData = generateRevenueData;
    const lastMonth = revenueData[revenueData.length - 2]?.revenue || 0;
    const currentMonth = revenueData[revenueData.length - 1]?.revenue || 0;
    
    return {
      users: users.length > 1 ? 
        Math.round(((users.length - (users.length - 5)) / Math.max(users.length - 5, 1)) * 100) : 0,
      vehicles: vehicles.length > 1 ? 
        Math.round(((vehicles.length - (vehicles.length - 2)) / Math.max(vehicles.length - 2, 1)) * 100) : 0,
      bookings: bookingsArray.length > 1 ? 
        Math.round(((bookingsArray.length - (bookingsArray.length - 3)) / Math.max(bookingsArray.length - 3, 1)) * 100) : 0,
      revenue: lastMonth > 0 ? Math.round(((currentMonth - lastMonth) / lastMonth) * 100) : 0,
    };
  };

  const growth = calculateGrowth();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format number with K/M suffixes
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get growth indicator
  const getGrowthIndicator = (value: number) => {
    if (value > 0) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: <ArrowUpRight size={16} />,
        text: `${value}%`
      };
    } else if (value < 0) {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: <ArrowDownRight size={16} />,
        text: `${Math.abs(value)}%`
      };
    }
    return {
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: <TrendingUp size={16} />,
      text: '0%'
    };
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: pld.color }}>
              {pld.name}: {pld.name.includes('Revenue') ? formatCurrency(pld.value) : pld.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie charts
  const PieChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-1">{data.name}</p>
          <p className="text-sm text-gray-600">Count: {data.value}</p>
          {data.revenue && (
            <p className="text-sm text-gray-600">Revenue: {formatCurrency(data.revenue)}</p>
          )}
          {data.percentage && (
            <p className="text-sm text-gray-600">Share: {data.percentage}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchUsers(),
        refetchVehicles(),
        refetchBookings()
      ]);
      toast.success('Dashboard refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle export data
  const handleExportData = () => {
    const data = {
      stats,
      revenueData: generateRevenueData,
      vehicleCategories: generateVehicleCategoryChartData,
      bookingStatuses: generateBookingStatusChartData,
      userGrowth: generateUserGrowthData,
      topVehicles: getTopVehicles
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `rentwheels-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Data exported successfully!');
  };

  const isLoading = usersLoading || vehiclesLoading || bookingsLoading;

  if (isLoading && !isRefreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="mx-auto text-blue-600 animate-spin mb-4" size={48} />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h3>
          <p className="text-gray-600">Gathering business insights...</p>
        </div>
      </div>
    );
  }

  // Chart colors
  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#6366F1'];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <AnimatedCard>
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl shadow-xl border border-blue-100 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg">
                  <BarChart3 className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-gray-600 mt-2">Real-time insights and visual analytics for your car rental business</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-4">
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
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm font-medium">Chart Type:</span>
                  <div className="flex bg-gray-100 rounded-2xl p-1">
                    {(['line', 'bar', 'area'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedChartType(type)}
                        className={`px-3 py-1 rounded-xl font-medium text-xs transition-all flex items-center gap-1 ${
                          selectedChartType === type
                            ? 'bg-white text-blue-600 shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {type === 'line' && <LineChartIcon size={14} />}
                        {type === 'bar' && <BarChart3 size={14} />}
                        {type === 'area' && <TrendingUpIcon size={14} />}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleExportData}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Download size={20} />
                Export Data
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
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
            trend: generateRevenueData.slice(-2).map(d => d.revenue)
          },
          {
            label: 'Active Users',
            value: formatNumber(stats.totalUsers),
            icon: <Users className="text-white" size={24} />,
            growth: growth.users,
            color: 'from-blue-500 to-blue-600',
            description: 'Registered customers',
            trend: generateUserGrowthData.slice(-2).map(d => d.totalUsers)
          },
          {
            label: 'Available Vehicles',
            value: stats.availableVehicles.toString(),
            icon: <Car className="text-white" size={24} />,
            growth: growth.vehicles,
            color: 'from-green-500 to-green-600',
            description: 'Ready for rent',
            trend: [stats.availableVehicles, stats.totalVehicles]
          },
          {
            label: "Today's Bookings",
            value: stats.todayBookings.toString(),
            icon: <Calendar className="text-white" size={24} />,
            growth: growth.bookings,
            color: 'from-orange-500 to-orange-600',
            description: 'New reservations',
            trend: [stats.todayBookings, stats.totalBookings]
          },
        ].map((stat, index) => {
          const growthIndicator = getGrowthIndicator(stat.growth);
          
          return (
            <AnimatedCard key={index} delay={index * 0.1}>
              <div className={`bg-gradient-to-r ${stat.color} rounded-3xl shadow-xl p-5 md:p-6 text-white relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      {stat.icon}
                    </div>
                    <span className={`${growthIndicator.bgColor} ${growthIndicator.color} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                      {growthIndicator.icon}
                      {growthIndicator.text}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-2xl md:text-3xl font-bold mb-1">
                      {stat.value}
                    </h3>
                    <p className="font-semibold text-sm md:text-base">{stat.label}</p>
                  </div>
                  <p className="text-white/80 text-xs md:text-sm">{stat.description}</p>
                  
                  {/* Mini trend chart */}
                  <div className="mt-4 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { value: stat.trend[0] || 0 },
                        { value: stat.trend[1] || stat.trend[0] || 0 }
                      ]}>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#FFFFFF" 
                          fill="url(#colorMiniChart)"
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="colorMiniChart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          );
        })}
      </div>

      {/* Charts Section - Revenue & Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <AnimatedCard delay={0.2}>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Revenue Trend</h3>
                  <p className="text-gray-500 text-sm">Last 6 months performance</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</div>
                <div className="text-sm text-gray-500">Current month</div>
              </div>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                {selectedChartType === 'line' ? (
                  <LineChart data={generateRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue"
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      name="Bookings"
                      stroke="#10B981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                ) : selectedChartType === 'bar' ? (
                  <BarChart data={generateRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      name="Revenue" 
                      fill="#3B82F6" 
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="bookings" 
                      name="Bookings" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <AreaChart data={generateRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue"
                      stroke="#3B82F6" 
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bookings" 
                      name="Bookings"
                      stroke="#10B981" 
                      fill="url(#colorBookings)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{formatCurrency(generateRevenueData[5]?.revenue || 0)}</div>
                <div className="text-xs text-gray-500">Current Month</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">+{generateRevenueData[5]?.growth || 0}%</div>
                <div className="text-xs text-gray-500">Growth Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">{generateRevenueData[5]?.bookings || 0}</div>
                <div className="text-xs text-gray-500">Monthly Bookings</div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Vehicle Categories & Booking Status */}
        <AnimatedCard delay={0.3}>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <PieChartIcon className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Vehicle Distribution</h3>
                  <p className="text-gray-500 text-sm">By category and revenue contribution</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</div>
                <div className="text-sm text-gray-500">Total Vehicles</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Categories Pie Chart */}
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={generateVehicleCategoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.percent}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                    >
                      {generateVehicleCategoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Booking Status Donut Chart */}
              <div className="h-60">
                <h4 className="font-semibold text-gray-900 mb-4">Booking Status</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={generateBookingStatusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      nameKey="name"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {generateBookingStatusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Vehicle Category Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Top Vehicle Categories by Revenue</h4>
              <div className="space-y-3">
                {generateVehicleCategoryChartData.slice(0, 3).map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: chartColors[index] }}
                      ></div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{formatCurrency(category.revenue)}</span>
                      <span className="text-xs text-gray-500 ml-2">({category.value} vehicles)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* User Growth & Top Vehicles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <AnimatedCard delay={0.4}>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <UserPlus className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">User Growth</h3>
                  <p className="text-gray-500 text-sm">New users vs total users</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={generateUserGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="newUsers" 
                    name="New Users" 
                    fill="#93C5FD" 
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalUsers" 
                    name="Total Users"
                    stroke="#3B82F6" 
                    strokeWidth={3}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 p-4 rounded-2xl">
                <div className="text-xl font-bold text-blue-600">
                  {generateUserGrowthData[generateUserGrowthData.length - 1]?.newUsers || 0}
                </div>
                <div className="text-sm text-gray-600">New Users This Month</div>
              </div>
              <div className="bg-green-50 p-4 rounded-2xl">
                <div className="text-xl font-bold text-green-600">
                  {stats.totalUsers > 0 ? 
                    `${Math.round((stats.completedBookings / stats.totalUsers) * 100)}%` : 
                    '0%'
                  }
                </div>
                <div className="text-sm text-gray-600">Booking Rate per User</div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Top Performing Vehicles */}
        <AnimatedCard delay={0.5}>
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-5 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Award className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Top Performing Vehicles</h3>
                  <p className="text-gray-500 text-sm">Most rented vehicles by revenue</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/admin/vehicles')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
              >
                View All
                <ChevronUp className="rotate-90" size={16} />
              </button>
            </div>
            
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {getTopVehicles.map((vehicle, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl flex items-center justify-center">
                      <Car className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {vehicle.manufacturer} {vehicle.model}
                      </p>
                      <p className="text-sm text-gray-500">{formatCurrency(vehicle.daily_rate)}/day</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-gray-900">{vehicle.rental_count} rentals</p>
                        <p className="text-sm text-green-600">
                          {formatCurrency(vehicle.revenue)}
                        </p>
                      </div>
                      {/* Progress bar for popularity */}
                      <div className="w-24">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Popularity</span>
                          <span>{Math.round((vehicle.rental_count / Math.max(...getTopVehicles.map(v => v.rental_count))) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-full h-2 transition-all duration-500"
                            style={{ 
                              width: `${(vehicle.rental_count / Math.max(...getTopVehicles.map(v => v.rental_count))) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Performance Metrics */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {stats.totalVehicles > 0 ? 
                      `${Math.round((stats.availableVehicles / stats.totalVehicles) * 100)}%` : 
                      '0%'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Availability</div>
                </div>
                <div className="bg-green-50 p-3 rounded-2xl text-center">
                  <div className="text-xl font-bold text-green-600">
                    {stats.totalBookings > 0 ? 
                      `${Math.round((stats.completedBookings / stats.totalBookings) * 100)}%` : 
                      '0%'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-2xl text-center">
                  <div className="text-xl font-bold text-purple-600">
                    {getTopVehicles.reduce((sum, v) => sum + v.revenue, 0) > 0 ?
                      `${Math.round((getTopVehicles[0]?.revenue || 0) / getTopVehicles.reduce((sum, v) => sum + v.revenue, 0) * 100)}%` :
                      '0%'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Top Vehicle Share</div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Summary Cards */}
      <AnimatedCard delay={0.6}>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl shadow-xl border border-blue-100 p-5 md:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            {[
              { value: stats.totalBookings, label: 'Total Bookings', color: 'text-blue-600', icon: <Calendar size={20} /> },
              { value: stats.availableVehicles, label: 'Available Vehicles', color: 'text-green-600', icon: <Car size={20} /> },
              { value: stats.todayBookings, label: "Today's Bookings", color: 'text-orange-600', icon: <Clock size={20} /> },
              { value: formatCurrency(stats.todayRevenue), label: "Today's Revenue", color: 'text-purple-600', icon: <DollarSign size={20} /> },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-10 h-10 ${item.color.replace('text', 'bg')}/20 rounded-xl flex items-center justify-center mb-2`}>
                  {item.icon}
                </div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">{item.value}</div>
                <div className="text-gray-600 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-gray-600 text-sm">
                Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleRefresh}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                  Refresh Data
                </button>
                <button 
                  onClick={() => navigate('/admin/reports')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <BarChart3 size={16} />
                  Detailed Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};

export default AdminOverview;