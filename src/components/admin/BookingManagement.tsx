// components/admin/BookingManagement.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { 
  Calendar, Search, Filter, Edit, Eye, 
  CheckCircle, XCircle, Clock, DollarSign,
  MapPin, User, Car, MoreVertical, Download,
  RefreshCw, TrendingUp, AlertTriangle, Mail,
  Phone, Shield, DownloadCloud, Upload,
  ExternalLink, ChevronDown, ChevronUp,
  FileText, Printer, ArrowUpDown,
  BarChart3, CreditCard, CalendarDays,
  Truck, Package, Clock4, FileImage,
  Sparkles, BadgeCheck, Receipt,
  Building, Navigation, Tag
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  useGetAllBookingsQuery,
  useUpdateBookingStatusMutation,
  useVerifyDriverLicenseMutation,
  useCancelBookingMutation,
  useGetBookingStatsQuery,
  useExportBookingsMutation,
  useGetBookingByIdQuery
} from '../../features/api/bookingsApi'
import type { BookingFilters } from '../../features/api/bookingsApi'

// FIXED: Import the correct Booking type from API
import type { BookingResponse } from '../../features/api/bookingsApi'

type Booking = BookingResponse['booking']

// Animated components
const FloatingCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative group"
  >
    {children}
  </motion.div>
)

const GlowingButton = ({ children, onClick, variant = 'primary', className = '', disabled = false }: any) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.05 }}
    whileTap={{ scale: disabled ? 1 : 0.95 }}
    onClick={onClick}
    disabled={disabled}
    className={`relative overflow-hidden rounded-2xl font-bold transition-all duration-300 ${className} ${
      variant === 'primary' 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30' 
        : variant === 'danger'
        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/30'
        : variant === 'success'
        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:shadow-green-500/30'
        : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg hover:shadow-xl hover:shadow-gray-500/30'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    {!disabled && (
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    )}
  </motion.button>
)

// FIXED: Download driver license function
// FIXED: Download driver license function - Node.js compatible
const downloadLicense = async (bookingId: number, side: 'front' | 'back') => {
  try {
    // Get token from localStorage
    const persistAuth = localStorage.getItem('persist:auth');
    if (!persistAuth) {
      toast.error('Authentication required');
      return false;
    }

    const authState = JSON.parse(persistAuth);
    const tokenWithBearer = authState.token;
    
    if (!tokenWithBearer) {
      toast.error('No authentication token found');
      return false;
    }

    // Clean token
    const token = tokenWithBearer.replace(/^"|"$/g, '');
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    console.log(`🔄 Getting ${side} license for booking ${bookingId}`);

    // Make the API call
    const response = await fetch(
      `http://localhost:3000/api/bookings/${bookingId}/license/${side}`,
      {
        headers: {
          'Authorization': authToken,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to fetch license' }));
      console.error('❌ Backend error:', errorData);
      toast.error(errorData.error || `Failed to fetch license ${side}`);
      return false;
    }

    // Check the response type
    const contentType = response.headers.get('content-type');
    console.log(`📦 Response Content-Type: ${contentType}`);
    
    // CASE 1: Direct image file (backend served it directly)
    if (contentType && contentType.includes('image/')) {
      console.log(`✅ Direct image download`);
      
      // Get filename from headers or generate default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = `driver-license-${side}-${bookingId}.jpg`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      
      toast.success(`✅ ${side} license downloaded!`);
      return true;
    }
    
    // CASE 2: JSON response with URL (backend returned URL)
    else if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`📄 JSON response:`, data);
      
      if (!data.success) {
        toast.error(data.error || 'Download failed');
        return false;
      }
      
      if (data.download_url) {
        console.log(`🔗 Opening URL: ${data.download_url}`);
        
        // For image URLs, open in new tab
        window.open(data.download_url, '_blank');
        
        toast.success(`🔗 Opening ${side} license...`);
        return true;
      } else {
        toast.error('No download URL available');
        return false;
      }
    }
    
    // CASE 3: Unknown response
    else {
      console.warn(`⚠️ Unknown response type: ${contentType}`);
      
      // Try to parse as JSON anyway
      try {
        const data = await response.json();
        if (data.download_url) {
          window.open(data.download_url, '_blank');
          toast.success(`🔗 Opening ${side} license...`);
          return true;
        }
      } catch {
        // Not JSON
      }
      
      toast.error('Unexpected response from server');
      return false;
    }
    
  } catch (error: any) {
    console.error('❌ Download error:', error);
    toast.error('Failed to download license: ' + (error.message || 'Unknown error'));
    return false;
  }
};

// Booking Details Modal Component
const BookingDetailsModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  bookingId: number | null
}> = ({ isOpen, onClose, bookingId }) => {
  const { data: bookingResponse, isLoading, error } = useGetBookingByIdQuery(bookingId!, {
    skip: !bookingId || !isOpen
  })

  // FIXED: Get booking from correct response structure
  const booking = bookingResponse?.booking;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return dateString;
    }
  }

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    try {
      const startDate = new Date(start)
      const endDate = new Date(end)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } catch (e) {
      return 0;
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
      case 'confirmed': return 'bg-gradient-to-r from-blue-500 to-blue-600'
      case 'active': return 'bg-gradient-to-r from-green-500 to-green-600'
      case 'completed': return 'bg-gradient-to-r from-gray-500 to-gray-600'
      case 'cancelled': return 'bg-gradient-to-r from-red-500 to-red-600'
      case 'rejected': return 'bg-gradient-to-r from-orange-500 to-orange-600'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="text-white" size={16} />
      case 'confirmed': return <CheckCircle className="text-white" size={16} />
      case 'active': return <TrendingUp className="text-white" size={16} />
      case 'completed': return <CheckCircle className="text-white" size={16} />
      case 'cancelled': return <XCircle className="text-white" size={16} />
      case 'rejected': return <XCircle className="text-white" size={16} />
      default: return <Calendar className="text-white" size={16} />
    }
  }

  const getPaymentColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-gradient-to-r from-green-500 to-green-600'
      case 'pending': return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
      case 'failed': return 'bg-gradient-to-r from-red-500 to-red-600'
      case 'refunded': return 'bg-gradient-to-r from-blue-500 to-blue-600'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                    <Receipt className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Booking Details</h2>
                    <p className="text-gray-400 text-sm mt-1">
                      {booking ? `Booking #${booking.booking_id}` : 'Loading...'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors"
                >
                  <XCircle className="text-gray-400" size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mb-6"
                  >
                    <Sparkles className="text-blue-400" size={48} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Loading Booking Details</h3>
                  <p className="text-gray-400">Fetching booking data...</p>
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-red-400 mb-2">Error Loading Booking</h3>
                  <p className="text-gray-400 mb-6">Failed to load booking details. Please try again.</p>
                  <button 
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-700 text-gray-300 rounded-2xl font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : booking ? (
                <div className="space-y-8">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-3">
                    <span className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white ${getStatusColor(booking.booking_status)}`}>
                      {getStatusIcon(booking.booking_status)}
                      {booking.booking_status}
                    </span>
                    {booking.payment_status && (
                      <span className={`px-4 py-2 rounded-full font-semibold text-white ${getPaymentColor(booking.payment_status)}`}>
                        {booking.payment_status}
                      </span>
                    )}
                    <span className={`px-4 py-2 rounded-full font-semibold ${booking.verified_by_admin ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'}`}>
                      {booking.verified_by_admin ? 'License Verified' : 'License Not Verified'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Customer Information */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl">
                          <User className="text-blue-400" size={20} />
                        </div>
                        Customer Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">Name</span>
                          <span className="font-semibold text-white">{booking.user_name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">Email</span>
                          <span className="font-semibold text-white">{booking.user_email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-400">Customer ID</span>
                          <span className="font-semibold text-white">#{booking.user_id}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Information */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl">
                          <Car className="text-green-400" size={20} />
                        </div>
                        Vehicle Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">Vehicle</span>
                          <span className="font-semibold text-white">{booking.vehicle_manufacturer || 'Unknown'} {booking.vehicle_model || ''}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">Vehicle ID</span>
                          <span className="font-semibold text-white">#{booking.vehicle_id}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-400">Rental Rate</span>
                          <span className="font-semibold text-white">${booking.rental_rate || 'N/A'}/day</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl">
                          <CalendarDays className="text-purple-400" size={20} />
                        </div>
                        Booking Details
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">Duration</span>
                          <span className="font-semibold text-white">{calculateDuration(booking.pickup_date, booking.return_date)} days</span>
                        </div>
                        <div className="py-3 border-b border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Pickup Date & Time</span>
                            <span className="font-semibold text-white">{formatDate(booking.pickup_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <MapPin size={14} />
                            {booking.pickup_location}
                          </div>
                        </div>
                        <div className="py-3 border-b border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Return Date & Time</span>
                            <span className="font-semibold text-white">{formatDate(booking.return_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <MapPin size={14} />
                            {booking.return_location}
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-400">Total Amount</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            ${booking.total_amount?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information */}
                    {booking.payment_status && (
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-pink-500/20 to-pink-600/20 rounded-xl">
                            <CreditCard className="text-pink-400" size={20} />
                          </div>
                          Payment Information
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between py-3 border-b border-gray-700">
                            <span className="text-gray-400">Payment Method</span>
                            <span className="font-semibold text-white">{booking.payment_method || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-400">Transaction ID</span>
                            <span className="font-semibold text-white text-sm truncate max-w-[200px]">
                              {booking.transaction_id || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Driver License and Insurance */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Driver License Info */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl">
                          <Shield className="text-orange-400" size={20} />
                        </div>
                        Driver License
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">License Number</span>
                          <span className="font-semibold text-white">{booking.driver_license_number || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">Expiry Date</span>
                          <span className="font-semibold text-white">{booking.driver_license_expiry ? formatDate(booking.driver_license_expiry) : 'N/A'}</span>
                        </div>
                        <div className="flex gap-3">
                          {booking.driver_license_front_url && (
                            <GlowingButton
                              onClick={() => downloadLicense(booking.booking_id, 'front')}
                              className="px-4 py-2 text-sm"
                            >
                              <FileImage size={14} />
                              Download Front
                            </GlowingButton>
                          )}
                          {booking.driver_license_back_url && (
                            <GlowingButton
                              onClick={() => downloadLicense(booking.booking_id, 'back')}
                              className="px-4 py-2 text-sm"
                            >
                              <FileImage size={14} />
                              Download Back
                            </GlowingButton>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Insurance Info */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl">
                          <Shield className="text-emerald-400" size={20} />
                        </div>
                        Insurance & Protection
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-700">
                          <span className="text-gray-400">Insurance Type</span>
                          <span className="font-semibold text-white">{booking.insurance_type || 'N/A'}</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Additional Protection</span>
                            <div className={`w-3 h-3 rounded-full ${booking.additional_protection ? 'bg-green-500' : 'bg-red-500'}`} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Roadside Assistance</span>
                            <div className={`w-3 h-3 rounded-full ${booking.roadside_assistance ? 'bg-green-500' : 'bg-red-500'}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {booking.admin_notes && (
                    <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-3xl p-6 border border-yellow-700/30">
                      <h4 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                        <AlertTriangle size={18} />
                        Admin Notes
                      </h4>
                      <p className="text-yellow-300">{booking.admin_notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Booking Not Found</h3>
                  <p className="text-gray-400">The requested booking could not be found.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 p-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  {booking && `Created on ${formatDate(booking.created_at)}`}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-700 text-gray-300 rounded-2xl font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                  <GlowingButton className="px-6 py-3">
                    <Printer size={16} />
                    Print Receipt
                  </GlowingButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const BookingManagement: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<BookingFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled' | 'Rejected'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'Pending' | 'Completed' | 'Failed' | 'Refunded'>('all')
  const [selectedBookings, setSelectedBookings] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  // API Hooks
  const { 
    data: bookingsResponse, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetAllBookingsQuery(filters)

  // FIXED: Handle stats endpoint gracefully
  const { 
    data: statsResponse,
    isLoading: isLoadingStats,
    isError: isStatsError 
  } = useGetBookingStatsQuery()
  
  const [updateBookingStatus, { isLoading: isUpdatingStatus }] = useUpdateBookingStatusMutation()
  const [verifyDriverLicense, { isLoading: isVerifying }] = useVerifyDriverLicenseMutation()
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation()
  const [exportBookings, { isLoading: isExporting }] = useExportBookingsMutation()

  // FIXED: Handle API response structure correctly
  const bookings: Booking[] = bookingsResponse?.data || []
  const stats = statsResponse?.stats

  // Apply frontend filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchTerm === '' || 
      booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle_manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.driver_license_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_id.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter
    const matchesPayment = paymentFilter === 'all' || booking.payment_status === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  // FIXED: Check for duplicate keys
  const duplicateKeys = new Map<number, number>();
  bookings.forEach(booking => {
    duplicateKeys.set(booking.booking_id, (duplicateKeys.get(booking.booking_id) || 0) + 1);
  });

  const hasDuplicates = Array.from(duplicateKeys.values()).some(count => count > 1);
  
  if (hasDuplicates) {
    console.warn('Duplicate booking IDs found:', 
      Array.from(duplicateKeys.entries())
        .filter(([_, count]) => count > 1)
        .map(([id]) => id)
    );
  }

  // Handlers
  const handleUpdateStatus = async (bookingId: number, newStatus: Booking['booking_status'], adminNotes?: string) => {
    try {
      await updateBookingStatus({
        booking_id: bookingId,
        data: { 
          booking_status: newStatus,
          admin_notes: adminNotes || ''
        }
      }).unwrap()
      toast.success(`Booking #${bookingId} status updated to ${newStatus}`)
      setActionMenu(null)
      refetch()
    } catch (error: any) {
      console.error('Update status error:', error)
      toast.error(error?.data?.error || error?.data?.message || 'Failed to update booking status')
      setActionMenu(null)
    }
  }

  // FIXED: License verification handler
  const handleVerifyLicense = async (bookingId: number, verified: boolean) => {
    try {
      await verifyDriverLicense({
        booking_id: bookingId,
        data: { 
          verified,
          admin_notes: `Driver license ${verified ? 'verified' : 'unverified'} by admin`
        }
      }).unwrap()
      
      toast.success(`Driver license ${verified ? 'verified' : 'unverified'} for booking #${bookingId}`)
      setActionMenu(null)
      refetch()
    } catch (error: any) {
      console.error('Verify license error:', error)
      toast.error(error?.data?.error || error?.data?.message || 'Failed to verify driver license')
      setActionMenu(null)
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    
    try {
      await cancelBooking(bookingId).unwrap()
      toast.success(`Booking #${bookingId} cancelled successfully`)
      setActionMenu(null)
      refetch()
    } catch (error: any) {
      console.error('Cancel booking error:', error)
      toast.error(error?.data?.error || error?.data?.message || 'Failed to cancel booking')
      setActionMenu(null)
    }
  }

  const handleExportBookings = async () => {
    try {
      const exportFilters = {
        ...filters,
        format: 'csv' as const
      }
      
      const blob = await exportBookings(exportFilters).unwrap()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Bookings exported successfully')
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error('Failed to export bookings')
    }
  }

  const handleApplyFilters = useCallback(() => {
    const newFilters: BookingFilters = {}
    
    if (statusFilter !== 'all') newFilters.status = statusFilter
    if (paymentFilter !== 'all') newFilters.payment_status = paymentFilter
    if (dateRange.from) newFilters.date_from = dateRange.from
    if (dateRange.to) newFilters.date_to = dateRange.to
    if (searchTerm) newFilters.search = searchTerm
    
    setFilters(newFilters)
  }, [statusFilter, paymentFilter, dateRange, searchTerm])

  const handleClearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setDateRange({ from: '', to: '' })
    setShowFilters(false)
  }

  const handleViewDetails = (bookingId: number) => {
    setSelectedBookingId(bookingId)
    setShowDetailsModal(true)
    setActionMenu(null)
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-gradient-to-r from-yellow-500 to-yellow-600'
      case 'confirmed': return 'bg-gradient-to-r from-blue-500 to-blue-600'
      case 'active': return 'bg-gradient-to-r from-green-500 to-green-600'
      case 'completed': return 'bg-gradient-to-r from-gray-500 to-gray-600'
      case 'cancelled': return 'bg-gradient-to-r from-red-500 to-red-600'
      case 'rejected': return 'bg-gradient-to-r from-orange-500 to-orange-600'
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="text-white" size={16} />
      case 'confirmed': return <CheckCircle className="text-white" size={16} />
      case 'active': return <TrendingUp className="text-white" size={16} />
      case 'completed': return <CheckCircle className="text-white" size={16} />
      case 'cancelled': return <XCircle className="text-white" size={16} />
      case 'rejected': return <XCircle className="text-white" size={16} />
      default: return <Calendar className="text-white" size={16} />
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return dateString;
    }
  }

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    try {
      const startDate = new Date(start)
      const endDate = new Date(end)
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    } catch (e) {
      return 0;
    }
  }

  // Apply filters when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleApplyFilters()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, handleApplyFilters])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6"
          >
            <Sparkles className="text-blue-400" size={48} />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading Bookings</h3>
          <p className="text-gray-400">Fetching booking data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 border border-red-700/30 shadow-2xl max-w-md"
        >
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-red-400 mb-2 text-center">Connection Error</h3>
          <p className="text-gray-400 text-center mb-6">
            Failed to connect to the server. Please check your connection.
          </p>
          <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-800/50 rounded-lg">
            Error: {error?.toString()}
          </div>
          <div className="flex flex-col gap-3">
            <GlowingButton onClick={() => refetch()} className="py-4">
              <RefreshCw size={20} />
              Retry Connection
            </GlowingButton>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-800 text-gray-300 rounded-2xl font-semibold hover:bg-gray-700 transition-colors border border-gray-700"
            >
              Reload Page
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="relative space-y-6">
        {/* Header with Stats */}
        <FloatingCard delay={0.1}>
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                    <Calendar className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Booking Management
                    </h1>
                    <p className="text-gray-400 mt-1">Manage all bookings in the system</p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Bookings</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{bookings.length}</h3>
                      </div>
                      <Calendar className="text-blue-400" size={20} />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Active Rentals</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{bookings.filter(b => b.booking_status === 'Active').length}</h3>
                      </div>
                      <TrendingUp className="text-green-400" size={20} />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 border border-yellow-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-400 text-sm">Pending</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{bookings.filter(b => b.booking_status === 'Pending').length}</h3>
                      </div>
                      <Clock className="text-yellow-400" size={20} />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-4 border border-green-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-400 text-sm">Revenue</p>
                        <h3 className="text-2xl font-bold text-white mt-1">
                          ${bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0).toFixed(0)}
                        </h3>
                      </div>
                      <DollarSign className="text-green-400" size={20} />
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <GlowingButton 
                  onClick={handleExportBookings}
                  disabled={bookings.length === 0 || isExporting}
                  className="px-6 py-4 flex items-center gap-2"
                >
                  <DownloadCloud size={20} />
                  {isExporting ? 'Exporting...' : 'Export Bookings'}
                </GlowingButton>
                
                <GlowingButton 
                  onClick={() => refetch()}
                  variant="secondary"
                  className="px-6 py-4 flex items-center gap-2"
                >
                  <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                  Refresh Data
                </GlowingButton>
              </div>
            </div>
          </div>
        </FloatingCard>

        {/* Filters Bar */}
        <FloatingCard delay={0.2}>
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700 shadow-2xl">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between text-left mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl">
                  <Filter className="text-blue-400" size={20} />
                </div>
                <span className="font-semibold text-white">Advanced Filters</span>
              </div>
              {showFilters ? <ChevronUp className="text-gray-400" size={20} /> : <ChevronDown className="text-gray-400" size={20} />}
            </button>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search bookings by customer, vehicle, license number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Booking Status</label>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value as any)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all" className="bg-gray-800">All Status</option>
                          <option value="Pending" className="bg-gray-800">Pending</option>
                          <option value="Confirmed" className="bg-gray-800">Confirmed</option>
                          <option value="Active" className="bg-gray-800">Active</option>
                          <option value="Completed" className="bg-gray-800">Completed</option>
                          <option value="Cancelled" className="bg-gray-800">Cancelled</option>
                          <option value="Rejected" className="bg-gray-800">Rejected</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Payment Status</label>
                        <select
                          value={paymentFilter}
                          onChange={(e) => setPaymentFilter(e.target.value as any)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all" className="bg-gray-800">All Payments</option>
                          <option value="Pending" className="bg-gray-800">Pending</option>
                          <option value="Completed" className="bg-gray-800">Completed</option>
                          <option value="Failed" className="bg-gray-800">Failed</option>
                          <option value="Refunded" className="bg-gray-800">Refunded</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Date Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <GlowingButton
                        onClick={handleApplyFilters}
                        className="px-6 py-3"
                      >
                        <Filter size={16} />
                        Apply Filters
                      </GlowingButton>
                      <button
                        onClick={handleClearFilters}
                        className="px-6 py-3 bg-gray-800 text-gray-300 rounded-2xl font-semibold hover:bg-gray-700 transition-colors border border-gray-700"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FloatingCard>

        {/* Bookings List */}
        <div className="space-y-4">
          {/* FIXED: Show warning if duplicates found */}
          {hasDuplicates && (
            <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-3xl p-4 border border-orange-700/30">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-orange-400" size={20} />
                <p className="text-orange-300 text-sm">
                  Warning: Duplicate booking IDs detected. This may cause display issues.
                </p>
              </div>
            </div>
          )}

          {/* FIXED: Ensure unique keys */}
          {filteredBookings.map((booking, index) => (
            <FloatingCard key={`${booking.booking_id}-${index}`}>
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700 shadow-2xl group hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Column - Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          Booking #{booking.booking_id}
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                          {formatDateTime(booking.created_at)} • {calculateDuration(booking.pickup_date, booking.return_date)} days
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold text-white ${getStatusColor(booking.booking_status)}`}>
                          {getStatusIcon(booking.booking_status)}
                          {booking.booking_status}
                        </span>
                      </div>
                    </div>

                    {/* Customer and Vehicle Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                          <User className="text-blue-400" size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{booking.user_name || 'Unknown Customer'}</div>
                          <div className="text-gray-400 text-sm">{booking.user_email || 'No email'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-xl">
                          <Car className="text-green-400" size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{booking.vehicle_manufacturer || 'Unknown'} {booking.vehicle_model || ''}</div>
                          <div className="text-gray-400 text-sm">Vehicle #{booking.vehicle_id}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                          <DollarSign className="text-purple-400" size={20} />
                        </div>
                        <div>
                          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            ${booking.total_amount?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-gray-400 text-sm">Total amount</div>
                        </div>
                      </div>
                    </div>

                    {/* Dates and Locations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-orange-400" size={16} />
                        <div>
                          <div className="text-white text-sm">Pickup: {formatDateTime(booking.pickup_date)}</div>
                          <div className="text-gray-400 text-xs">{booking.pickup_location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="text-green-400" size={16} />
                        <div>
                          <div className="text-white text-sm">Return: {formatDateTime(booking.return_date)}</div>
                          <div className="text-gray-400 text-xs">{booking.return_location}</div>
                        </div>
                      </div>
                    </div>

                    {/* License and Insurance Status */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className={booking.verified_by_admin ? "text-green-400" : "text-orange-400"} />
                        <span className={`text-sm ${booking.verified_by_admin ? 'text-green-400' : 'text-orange-400'}`}>
                          License {booking.verified_by_admin ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <span className="text-gray-400 text-sm">License #: {booking.driver_license_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Actions */}
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <GlowingButton
                      onClick={() => handleViewDetails(booking.booking_id)}
                      className="py-3"
                    >
                      <Eye size={16} />
                      View Details
                    </GlowingButton>

                    {/* License Actions */}
                    <div className="relative">
                      <GlowingButton
                        onClick={() => setActionMenu(actionMenu === booking.booking_id ? null : booking.booking_id)}
                        variant="secondary"
                        className="py-3"
                      >
                        <Shield size={16} />
                        License Actions
                      </GlowingButton>

                      <AnimatePresence>
                        {actionMenu === booking.booking_id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-12 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-10 min-w-[250px] overflow-hidden"
                          >
                            {!booking.verified_by_admin ? (
                              <>
                                <button 
                                  onClick={() => handleVerifyLicense(booking.booking_id, true)}
                                  className="w-full text-left px-4 py-3 hover:bg-blue-500/10 flex items-center gap-2 text-white border-b border-gray-700"
                                >
                                  <CheckCircle size={16} />
                                  Verify License
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleVerifyLicense(booking.booking_id, false)}
                                className="w-full text-left px-4 py-3 hover:bg-orange-500/10 flex items-center gap-2 text-white border-b border-gray-700"
                                >
                                  <XCircle size={16} />
                                  Unverify License
                                </button>
                              )}
                              
                              {booking.driver_license_front_url && (
                                <button 
                                  onClick={() => downloadLicense(booking.booking_id, 'front')}
                                  className="w-full text-left px-4 py-3 hover:bg-blue-500/10 flex items-center gap-2 text-white border-b border-gray-700"
                                >
                                  <FileImage size={16} />
                                  Download Front License
                                </button>
                              )}
                              
                              {booking.driver_license_back_url && (
                                <button 
                                  onClick={() => downloadLicense(booking.booking_id, 'back')}
                                  className="w-full text-left px-4 py-3 hover:bg-blue-500/10 flex items-center gap-2 text-white"
                                >
                                  <FileImage size={16} />
                                  Download Back License
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Booking Status Actions */}
                      <div className="flex flex-col gap-2">
                        {booking.booking_status === 'Pending' && (
                          <>
                            <GlowingButton
                              onClick={() => handleUpdateStatus(booking.booking_id, 'Confirmed')}
                              variant="success"
                              className="py-2 text-sm"
                              disabled={isUpdatingStatus}
                            >
                              <CheckCircle size={14} />
                              Confirm Booking
                            </GlowingButton>
                            <GlowingButton
                              onClick={() => handleUpdateStatus(booking.booking_id, 'Rejected', 'Booking rejected by admin')}
                              variant="danger"
                              className="py-2 text-sm"
                              disabled={isUpdatingStatus}
                            >
                              <XCircle size={14} />
                              Reject Booking
                            </GlowingButton>
                          </>
                        )}
                        {booking.booking_status === 'Confirmed' && (
                          <GlowingButton
                            onClick={() => handleUpdateStatus(booking.booking_id, 'Active')}
                            variant="success"
                            className="py-2 text-sm"
                            disabled={isUpdatingStatus}
                          >
                            <TrendingUp size={14} />
                            Mark as Active
                          </GlowingButton>
                        )}
                        {booking.booking_status === 'Active' && (
                          <GlowingButton
                            onClick={() => handleUpdateStatus(booking.booking_id, 'Completed')}
                            variant="success"
                            className="py-2 text-sm"
                            disabled={isUpdatingStatus}
                          >
                            <CheckCircle size={14} />
                            Complete Rental
                          </GlowingButton>
                        )}
                        {(booking.booking_status === 'Pending' || booking.booking_status === 'Confirmed') && (
                          <GlowingButton
                            onClick={() => handleCancelBooking(booking.booking_id)}
                            variant="danger"
                            className="py-2 text-sm"
                            disabled={isCancelling}
                          >
                            <XCircle size={14} />
                            {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                          </GlowingButton>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </FloatingCard>
            ))}

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <FloatingCard>
            <div className="text-center py-16">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
              >
                <Calendar className="text-white" size={40} />
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-3">
                {bookings.length === 0 ? 'No Bookings Found' : 'No Matching Bookings'}
              </h3>
              <p className="text-gray-400 mb-8">
                {bookings.length === 0 
                  ? 'There are no bookings in the system yet.' 
                  : 'Try adjusting your search filters to find bookings.'}
              </p>
              {bookings.length > 0 && (
                <GlowingButton
                  onClick={handleClearFilters}
                  className="px-8 py-4 text-lg"
                >
                  <Filter size={20} className="mr-2" />
                  Reset All Filters
                </GlowingButton>
              )}
            </div>
          </FloatingCard>
        )}
      </div>

      {/* Booking Details Modal */}
      <BookingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedBookingId(null)
        }}
        bookingId={selectedBookingId}
      />
    </div>
  </div>
  )
}


export default BookingManagement;