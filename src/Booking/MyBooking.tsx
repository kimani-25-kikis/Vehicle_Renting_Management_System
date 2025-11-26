// MyBookings.tsx
import React, { useState } from 'react'
import { Link } from 'react-router'
import { useGetMyBookingsQuery } from '../features/api/bookingsApi'
import { 
  Calendar, MapPin, Car, Clock, CheckCircle, 
  XCircle, AlertCircle, Loader, ArrowLeft, Eye
} from 'lucide-react'
import Navbar from '../components/Navbar'

const MyBookings: React.FC = () => {
  const { data: bookings, isLoading, error } = useGetMyBookingsQuery()
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled'>('all')

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle size={16} />
      case 'completed': return <CheckCircle size={16} />
      case 'cancelled': return <XCircle size={16} />
      case 'rejected': return <XCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredBookings = bookings?.filter(booking => 
    filter === 'all' || booking.booking_status.toLowerCase() === filter
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Loader className="mx-auto text-blue-600 mb-4 animate-spin" size={32} />
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Bookings</h2>
            <p className="text-gray-600 mb-6">We couldn't load your bookings. Please try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:text-orange-500"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">
                  My Bookings
                </h1>
                <p className="text-gray-600">
                  Manage and track your vehicle rentals
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {bookings?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Bookings', count: bookings?.length || 0 },
              { key: 'pending', label: 'Pending', count: bookings?.filter(b => b.booking_status.toLowerCase() === 'pending').length || 0 },
              { key: 'approved', label: 'Approved', count: bookings?.filter(b => b.booking_status.toLowerCase() === 'approved').length || 0 },
              { key: 'active', label: 'Active', count: bookings?.filter(b => b.booking_status.toLowerCase() === 'active').length || 0 },
              { key: 'completed', label: 'Completed', count: bookings?.filter(b => b.booking_status.toLowerCase() === 'completed').length || 0 },
              { key: 'cancelled', label: 'Cancelled', count: bookings?.filter(b => ['cancelled', 'rejected'].includes(b.booking_status.toLowerCase())).length || 0 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-1 rounded-full text-xs ${
                  filter === tab.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings?.length === 0 ? (
            <div className="text-center bg-white rounded-2xl shadow-lg border border-blue-100 p-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Bookings Found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't made any bookings yet."
                  : `No ${filter} bookings found.`
                }
              </p>
              <Link
                to="/vehicles"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
              >
                <Car size={20} />
                Browse Vehicles
              </Link>
            </div>
          ) : (
            filteredBookings?.map((booking) => (
              <div key={booking.booking_id} className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {booking.vehicle_manufacturer} {booking.vehicle_model}
                          </h3>
                          <p className="text-gray-600">Booking #{booking.booking_id}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-2 ${getStatusColor(booking.booking_status)}`}>
                          {getStatusIcon(booking.booking_status)}
                          {booking.booking_status}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-blue-600" size={16} />
                          <div>
                            <div className="font-semibold">Pickup</div>
                            <div className="text-gray-600">{formatDateTime(booking.pickup_date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="text-green-600" size={16} />
                          <div>
                            <div className="font-semibold">Return</div>
                            <div className="text-gray-600">{formatDateTime(booking.return_date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="text-orange-600" size={16} />
                          <div>
                            <div className="font-semibold">Location</div>
                            <div className="text-gray-600">{booking.pickup_location}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="text-purple-600" size={16} />
                          <div>
                            <div className="font-semibold">Total</div>
                            <div className="text-gray-600">${booking.total_amount}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/booking-confirmation/${booking.booking_id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-2 justify-center"
                      >
                        <Eye size={16} />
                        View Details
                      </Link>
                      {booking.booking_status === 'Pending' && (
                        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors">
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Insurance:</span>
                        <span className="text-gray-600 ml-2 capitalize">{booking.insurance_type}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Roadside Assistance:</span>
                        <span className="text-gray-600 ml-2">{booking.roadside_assistance ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Booked on:</span>
                        <span className="text-gray-600 ml-2">{formatDate(booking.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default MyBookings