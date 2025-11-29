// components/admin/BookingManagement.tsx
import React, { useState, useEffect } from 'react'
import { 
  Calendar, Search, Filter, Edit, Eye, 
  CheckCircle, XCircle, Clock, DollarSign,
  MapPin, User, Car, MoreVertical, Download,
  RefreshCw, TrendingUp, AlertTriangle, Mail,
  Phone, Shield, DownloadCloud, Upload
} from 'lucide-react'
import { toast } from 'sonner'

interface Booking {
  booking_id: number
  user_id: number
  vehicle_id: number
  user_name: string
  user_email: string
  vehicle_name: string
  pickup_location: string
  return_location: string
  pickup_date: string
  return_date: string
  total_amount: number
  booking_status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
  driver_license_verified: boolean
  special_requests?: string
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all')
  const [selectedBookings, setSelectedBookings] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        booking_id: 1,
        user_id: 1,
        vehicle_id: 1,
        user_name: 'John Doe',
        user_email: 'john.doe@example.com',
        vehicle_name: 'Toyota Camry 2023',
        pickup_location: 'Nairobi CBD',
        return_location: 'Nairobi CBD',
        pickup_date: '2024-03-25T10:00:00',
        return_date: '2024-03-28T10:00:00',
        total_amount: 135,
        booking_status: 'confirmed',
        payment_status: 'paid',
        created_at: '2024-03-20',
        driver_license_verified: true
      },
      {
        booking_id: 2,
        user_id: 2,
        vehicle_id: 2,
        user_name: 'Sarah Wilson',
        user_email: 'sarah.wilson@example.com',
        vehicle_name: 'Mercedes E-Class 2024',
        pickup_location: 'Westlands',
        return_location: 'JKIA',
        pickup_date: '2024-03-22T14:00:00',
        return_date: '2024-03-24T14:00:00',
        total_amount: 240,
        booking_status: 'active',
        payment_status: 'paid',
        created_at: '2024-03-18',
        driver_license_verified: true
      },
      {
        booking_id: 3,
        user_id: 3,
        vehicle_id: 3,
        user_name: 'Mike Johnson',
        user_email: 'mike.johnson@example.com',
        vehicle_name: 'Land Rover Range Rover',
        pickup_location: 'Karen',
        return_location: 'Karen',
        pickup_date: '2024-03-30T09:00:00',
        return_date: '2024-04-02T09:00:00',
        total_amount: 450,
        booking_status: 'pending',
        payment_status: 'pending',
        created_at: '2024-03-21',
        driver_license_verified: false,
        special_requests: 'Child seat required'
      },
      {
        booking_id: 4,
        user_id: 4,
        vehicle_id: 1,
        user_name: 'Emily Davis',
        user_email: 'emily.davis@example.com',
        vehicle_name: 'Toyota Camry 2023',
        pickup_location: 'JKIA',
        return_location: 'Westlands',
        pickup_date: '2024-03-19T08:00:00',
        return_date: '2024-03-21T08:00:00',
        total_amount: 90,
        booking_status: 'completed',
        payment_status: 'paid',
        created_at: '2024-03-15',
        driver_license_verified: true
      }
    ]
    setBookings(mockBookings)
    setLoading(false)
  }, [])

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_id.toString().includes(searchTerm) ||
      booking.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter
    const matchesPayment = paymentFilter === 'all' || booking.payment_status === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  const handleUpdateStatus = (bookingId: number, newStatus: Booking['booking_status']) => {
    toast.success(`Booking #${bookingId} ${newStatus}`)
    setBookings(prev => prev.map(booking => 
      booking.booking_id === bookingId ? { ...booking, booking_status: newStatus } : booking
    ))
    setActionMenu(null)
  }

  const handleVerifyLicense = (bookingId: number) => {
    toast.success(`Driver license verified for booking #${bookingId}`)
    setBookings(prev => prev.map(booking => 
      booking.booking_id === bookingId ? { ...booking, driver_license_verified: true } : booking
    ))
    setActionMenu(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />
      case 'confirmed': return <CheckCircle size={16} />
      case 'active': return <TrendingUp size={16} />
      case 'completed': return <CheckCircle size={16} />
      case 'cancelled': return <XCircle size={16} />
      default: return <Calendar size={16} />
    }
  }

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Booking Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all bookings and rental schedules</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              <DownloadCloud size={20} />
              Export Report
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Bookings</p>
              <h3 className="text-3xl font-bold mt-1">{bookings.length}</h3>
            </div>
            <Calendar size={32} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Active Rentals</p>
              <h3 className="text-3xl font-bold mt-1">{bookings.filter(b => b.booking_status === 'active').length}</h3>
            </div>
            <TrendingUp size={32} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Revenue Today</p>
              <h3 className="text-3xl font-bold mt-1">$1,240</h3>
            </div>
            <DollarSign size={32} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Pending Approval</p>
              <h3 className="text-3xl font-bold mt-1">{bookings.filter(b => b.booking_status === 'pending').length}</h3>
            </div>
            <Clock size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search bookings by user, vehicle, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              <Download size={20} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking.booking_id} className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Booking #{booking.booking_id}
                      </h3>
                      <p className="text-gray-600">Created {formatDateTime(booking.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(booking.booking_status)} flex items-center gap-1`}>
                        {getStatusIcon(booking.booking_status)}
                        {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentColor(booking.payment_status)}`}>
                        {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                    <div className="flex items-center gap-3">
                      <User className="text-blue-600" size={20} />
                      <div>
                        <div className="font-semibold text-gray-900">{booking.user_name}</div>
                        <div className="text-gray-600 text-sm">{booking.user_email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Car className="text-green-600" size={20} />
                      <div>
                        <div className="font-semibold text-gray-900">{booking.vehicle_name}</div>
                        <div className="text-gray-600 text-sm">
                          {calculateDuration(booking.pickup_date, booking.return_date)} days
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="text-orange-600" size={20} />
                      <div>
                        <div className="font-semibold text-gray-900">Pickup</div>
                        <div className="text-gray-600 text-sm">{formatDateTime(booking.pickup_date)}</div>
                        <div className="text-gray-500 text-xs">{booking.pickup_location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="text-purple-600" size={20} />
                      <div>
                        <div className="font-semibold text-gray-900">Total</div>
                        <div className="text-2xl font-bold text-blue-600">${booking.total_amount}</div>
                      </div>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-600" />
                        <span className="font-semibold text-yellow-800">Special Request:</span>
                        <span className="text-yellow-700">{booking.special_requests}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                    <Eye size={16} />
                    View Details
                  </button>
                  
                  {!booking.driver_license_verified && booking.booking_status === 'pending' && (
                    <button 
                      onClick={() => handleVerifyLicense(booking.booking_id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Shield size={16} />
                      Verify License
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setActionMenu(actionMenu === booking.booking_id ? null : booking.booking_id)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <MoreVertical size={16} />
                      Actions
                    </button>
                    
                    {actionMenu === booking.booking_id && (
                      <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 min-w-[200px]">
                        {booking.booking_status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(booking.booking_id, 'confirmed')}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-t-xl"
                            >
                              <CheckCircle size={16} />
                              Confirm Booking
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(booking.booking_id, 'cancelled')}
                              className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600"
                            >
                              <XCircle size={16} />
                              Cancel Booking
                            </button>
                          </>
                        )}
                        {booking.booking_status === 'confirmed' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.booking_id, 'active')}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-t-xl"
                          >
                            <TrendingUp size={16} />
                            Mark as Active
                          </button>
                        )}
                        {booking.booking_status === 'active' && (
                          <button 
                            onClick={() => handleUpdateStatus(booking.booking_id, 'completed')}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-t-xl"
                          >
                            <CheckCircle size={16} />
                            Complete Rental
                          </button>
                        )}
                        <button className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
                          <Mail size={16} />
                          Contact Customer
                        </button>
                        <button className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-b-xl">
                          <Edit size={16} />
                          Edit Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-blue-100">
          <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No bookings found</p>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div className="text-gray-600">
            Showing 1-{filteredBookings.length} of {bookings.length} bookings
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingManagement