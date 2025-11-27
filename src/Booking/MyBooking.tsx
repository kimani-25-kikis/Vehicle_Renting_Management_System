// MyBookings.tsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'               // ← Fixed: react-router-dom
import { 
  useGetMyBookingsQuery, 
  useCancelBookingMutation 
} from '../features/api/bookingsApi'
import { useGetVehicleByIdQuery } from '../features/api/vehiclesApi'
import { 
  Calendar, MapPin, Car, Clock, CheckCircle, 
  XCircle, AlertCircle, Loader, ArrowLeft, Eye, Trash2
} from 'lucide-react'
import Navbar from '../components/Navbar'

// Small component to fetch and show vehicle name
const VehicleName: React.FC<{ vehicleId: number }> = ({ vehicleId }) => {
  const { data: vehicle, isLoading } = useGetVehicleByIdQuery(vehicleId)

  if (isLoading) return <span className="text-gray-500">Loading vehicle...</span>
  if (!vehicle) return <span className="text-red-500">Unknown Vehicle</span>

  return (
    <span className="font-bold text-gray-900">
      {vehicle.specification.manufacturer} {vehicle.specification.model}
    </span>
  )
}

const MyBookings: React.FC = () => {
  const { 
    data: bookings = [], 
    isLoading, 
    error
  } = useGetMyBookingsQuery()

  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation()
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled'>('all')

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (s === 'approved') return 'bg-green-100 text-green-800 border-green-200'
    if (s === 'active') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (s === 'completed') return 'bg-gray-100 text-gray-800 border-gray-200'
    if (s === 'cancelled' || s === 'rejected') return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'approved' || s === 'completed') return <CheckCircle size={16} />
    if (s === 'cancelled' || s === 'rejected') return <XCircle size={16} />
    return <Clock size={16} />
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

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) return

    try {
      await cancelBooking(bookingId).unwrap()
      alert('Booking cancelled successfully!')
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to cancel booking.')
    }
  }

  const filteredBookings = bookings.filter(booking => 
    filter === 'all' || booking.booking_status.toLowerCase() === filter
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader className="mx-auto text-blue-600 animate-spin" size={48} />
          <p className="mt-4 text-gray-600 text-lg">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold mb-4">Error Loading Bookings</h2>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-20">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                  <ArrowLeft size={28} />
                </Link>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    My Bookings
                  </h1>
                  <p className="text-gray-600">Manage all your vehicle rentals in one place</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{bookings.length}</div>
                <div className="text-gray-600">Total Bookings</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Filter Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 mb-8">
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'approved', label: 'Approved' },
                { key: 'active', label: 'Active' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map(tab => {
                const count = bookings.filter(b => 
                  tab.key === 'all' ? true : b.booking_status.toLowerCase() === tab.key
                ).length

                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as any)}
                    className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                      filter === tab.key
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                      filter === tab.key ? 'bg-white/30' : 'bg-gray-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center bg-white rounded-3xl shadow-2xl p-16 border border-blue-100">
                <Calendar className="mx-auto text-gray-300 mb-6" size={80} />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {filter === 'all' ? "No bookings yet" : `No ${filter} bookings`}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {filter === 'all' 
                    ? "You haven't booked any vehicles yet. Start exploring!"
                    : "You don't have any bookings with this status."
                  }
                </p>
                <Link 
                  to="/vehicles" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-shadow inline-flex items-center gap-3"
                >
                  <Car size={24} />
                  Browse Vehicles
                </Link>
              </div>
            ) : (
              filteredBookings.map(booking => (
                <div 
                  key={booking.booking_id} 
                  className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-shadow"
                >
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                              <VehicleName vehicleId={booking.vehicle_id} />
                            </h3>
                            <p className="text-gray-500 mt-1">Booking ID: #{booking.booking_id}</p>
                          </div>
                          <div className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 ${getStatusColor(booking.booking_status)}`}>
                            {getStatusIcon(booking.booking_status)}
                            {booking.booking_status}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                          <div className="flex items-center gap-3">
                            <Calendar className="text-blue-600" size={20} />
                            <div>
                              <div className="font-semibold text-gray-700">Pickup</div>
                              <div className="text-gray-600">{formatDateTime(booking.pickup_date)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="text-green-600" size={20} />
                            <div>
                              <div className="font-semibold text-gray-700">Return</div>
                              <div className="text-gray-600">{formatDateTime(booking.return_date)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="text-orange-600" size={20} />
                            <div>
                              <div className="font-semibold text-gray-700">Location</div>
                              <div className="text-gray-600">{booking.pickup_location}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Car className="text-purple-600" size={20} />
                            <div>
                              <div className="font-semibold text-gray-700">Total Paid</div>
                              <div className="text-xl font-bold text-blue-600">${booking.total_amount}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Link
                          to={`/booking-confirmation/${booking.booking_id}`}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                        >
                          <Eye size={18} />
                          View Details
                        </Link>

                        {['pending', 'approved'].includes(booking.booking_status.toLowerCase()) && (
                          <button
                            onClick={() => handleCancel(booking.booking_id)}
                            disabled={isCancelling}
                            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                              isCancelling
                                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                            }`}
                          >
                            {isCancelling ? (
                              'Cancelling...'
                            ) : (
                              <>
                                <Trash2 size={18} />
                                Cancel Booking
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><span className="font-semibold">Insurance:</span> {booking.insurance_type}</div>
                      <div><span className="font-semibold">Roadside:</span> {booking.roadside_assistance ? 'Yes' : 'No'}</div>
                      <div><span className="font-semibold">Booked on:</span> {formatDate(booking.created_at)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default MyBookings