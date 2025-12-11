// MyBookings.tsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  useGetMyBookingsQuery, 
  useCancelBookingMutation 
} from '../features/api/bookingsApi'
import { useGetVehicleByIdQuery } from '../features/api/vehiclesApi'
import { 
  Calendar, MapPin, Car, Clock, CheckCircle, 
  XCircle, Loader, ArrowLeft, Eye, Trash2, AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import {loadStripe} from "@stripe/stripe-js"
const stripePromise = loadStripe('pk_test_51SYBIfE5TRP3rh7FeOjNUDed6nQ2v8OAVQEgn1g6YrYxSKIm7gKoiBJlieusfAfSl1DOWPdaWHNHQIkQ6P5B0kT800IDfFLtsu');

export interface BookingData {
  booking_id: number
  user_id: number
  vehicle_id: number
  pickup_location: string
  return_location: string
  pickup_date: string
  return_date: string
  booking_date: string
  total_amount: number
  driver_license_number: string
  driver_license_expiry: string
  driver_license_front_url: string
  driver_license_back_url: string
  insurance_type: string
  additional_protection: boolean
  roadside_assistance: boolean
  booking_status: string
  verified_by_admin: boolean
  verified_at: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}
  
import Navbar from '../components/Navbar'
import { apiDomain } from '../apiDomain/apiDomain'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'

const VehicleName: React.FC<{ vehicleId: number }> = ({ vehicleId }) => {
  const { data: vehicle, isLoading } = useGetVehicleByIdQuery(vehicleId)
  if (isLoading) return <span className="text-gray-500">Loading...</span>
  if (!vehicle) return <span className="text-red-500">Unknown Vehicle</span>
  return (
    <span className="font-bold text-gray-900">
      {vehicle.specification.manufacturer} {vehicle.specification.model}
    </span>
  )
}

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="relative">
            <Loader className="mx-auto text-blue-600 animate-spin" size={60} />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-20 rounded-full"></div>
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading your bookings...</p>
          <p className="mt-2 text-gray-500 text-sm">Please wait while we fetch your reservation details</p>
        </div>
      </div>
    </div>
  )
}

const ErrorScreen: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md border border-gray-200">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="text-red-600" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Bookings</h2>
          <p className="text-gray-600 mb-6">We couldn't load your bookings. Please try again.</p>
          <button 
            onClick={onRetry}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

const MyBookings: React.FC = () => {
  const { data: bookings, isLoading, error, refetch } = useGetMyBookingsQuery()
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation()

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled'>('all')
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const { token } = useSelector((state: RootState) => state.authSlice)
  const navigate = useNavigate()

  console.log("🚀 ~ MyBookings ~ bookings:", bookings)

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'approved' || s === 'completed') return <CheckCircle size={16} />
    if (s === 'cancelled' || s === 'rejected') return <XCircle size={16} />
    return <Clock size={16} />
  }

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  const handleCancelClick = (id: number) => setShowCancelModal(id)

  const handleCancelCheckout = async (booking: any) => {
    console.log("🚀 ~ handleCancelCheckout ~ booking:", booking)
    
    try {
      await stripePromise;
      const header = { 'Content-Type': 'application/json' };
      const checkoutResponse = await axios.post(`${apiDomain}payments/create-intent`, JSON.stringify(booking), {
        headers: { ...header, Authorization: `${token}`},
      });

      const { session } = checkoutResponse.data;
      console.log("🚀 ~ handleCancelCheckout ~ session:", session)
      
      if (session?.url) {
        window.location.href = session.url
      } else {
        toast.error('Invalid checkout response', {
          description: 'Could not retrieve checkout URL. Please try again.',
        })
      }
    } catch (error: any) {
      console.error('Error checking out booking:', error);
      toast.error('Checkout failed', {
        description: error?.response?.data?.message || 'Please try again later.',
      })
    }
  }

  const confirmCancel = async () => {
    if (!showCancelModal) return
    setCancellingId(showCancelModal)

    try {
      await cancelBooking(showCancelModal).unwrap()
      toast.success('Booking cancelled successfully!', {
        description: 'Your booking has been removed.',
        duration: 5000,
      })
      setShowCancelModal(null)
    } catch (err: any) {
      toast.error('Failed to cancel booking', {
        description: err?.data?.message || 'Please try again later.',
      })
    } finally {
      setCancellingId(null)
    }
  }

  const bookingData: BookingData[] = Array.isArray(bookings?.booking)
    ? bookings.booking
    : bookings?.booking
    ? [bookings.booking] 
    : []

  console.log("📊 Raw bookings response:", bookings)
  console.log("📈 Processed bookingData:", bookingData)

  const filteredBookings = bookingData.filter(b =>
    filter === 'all' || b.booking_status.toLowerCase() === filter
  )

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />
  }

  // Show error screen
  if (error) {
    return <ErrorScreen onRetry={() => refetch()} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Main content starts right under navbar – no extra padding */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-blue-100">
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
                  <p className="text-gray-600">Manage all your vehicle rentals</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{bookingData?.length || 0}</div>
                <div className="text-gray-600">Total Bookings</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Filter Tabs */}
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 mb-8">
            <div className="flex flex-wrap gap-3">
              {(['all', 'pending', 'approved', 'active', 'completed', 'cancelled'] as const).map(key => {
                const label = key.charAt(0).toUpperCase() + key.slice(1)
                const count = bookingData.filter(b => key === 'all' || b.booking_status.toLowerCase() === key).length
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                      filter === key
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {label}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${filter === key ? 'bg-white/30' : 'bg-gray-300'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-6 pb-10">
            {filteredBookings.length === 0 ? (
              <div className="text-center bg-white rounded-3xl shadow-2xl p-16 border border-blue-100">
                <Calendar className="mx-auto text-gray-300 mb-6" size={80} />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
                </h3>
                <Link to="/vehicles" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-3">
                  <Car size={24} />
                  Browse Vehicles
                </Link>
              </div>
            ) : (
              filteredBookings.map(booking => (
                <div key={booking.booking_id} className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-shadow">
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
                          <>
                            <button
                              onClick={() => handleCancelClick(booking.booking_id)}
                              disabled={isCancelling}
                              className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                            >
                              <Trash2 size={18} />
                              Cancel Booking
                            </button>
                            <button
                              onClick={() => handleCancelCheckout(booking)}
                              className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                            >
                              <CheckCircle size={18} />
                              Complete Payment
                            </button>
                          </>
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

        {/* Cancel Modal – Ultra Smooth + Real Blur */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with real blur */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setShowCancelModal(null)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <XCircle className="text-red-600" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Cancel Booking?</h3>
                <p className="text-gray-600 mb-8 max-w-xs mx-auto">
                  This action cannot be undone. Your booking will be permanently cancelled.
                </p>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowCancelModal(null)}
                    className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
                  >
                    No, Keep Booking
                  </button>
                  <button
                    onClick={confirmCancel}
                    disabled={cancellingId === showCancelModal}
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all disabled:opacity-70 flex items-center gap-2"
                  >
                    {cancellingId === showCancelModal ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      <>Yes, Cancel Booking</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookings