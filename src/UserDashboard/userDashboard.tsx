import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router'
import { 
  useGetMyBookingsQuery, 
  useCancelBookingMutation,
} from '../features/api/bookingsApi'

import { 
  useGetMyPaymentsQuery, 
  useGetMySpendingStatsQuery,
  type UserPayment
} from '../features/api/PaymentApi'

import { useGetMyReviewsQuery, useSubmitReviewMutation, type Review } from '../features/api/reviewApi'
import { useGetVehicleByIdQuery } from '../features/api/vehiclesApi'
import { useUpdateUsersDetailsMutation ,useChangePasswordMutation } from '../features/api/UserApi'
import { useCreateSupportTicketMutation } from '../features/api/supportApi'
import PaymentSuccessModal from '../UserDashboard/PaymentSuccessModal'
import { 
  Calendar, MapPin, Car, Clock, CheckCircle, 
  XCircle, Loader, ArrowLeft, Eye, Trash2,
  User, Star, Settings, Shield, AlertTriangle,
  CreditCard, Smartphone, Home, BarChart3,
  MessageSquare, Heart, LogOut, Edit3,RefreshCw,
  Phone, Mail, Map, Save, DollarSign, TrendingUp,
  Filter, Download, PieChart,
  AlertCircle, X, HelpCircle, InfoIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { loadStripe } from "@stripe/stripe-js"
import axios from 'axios'
import Navbar from '../components/Navbar'
import { apiDomain } from '../apiDomain/apiDomain'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'

import { useEffect } from 'react'



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

interface User {
  user_id: number
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  address?: string
}

interface SpendingStats {
  total_spent: number
  this_month_spent: number
  stripe_payments: number
  mpesa_payments: number
  completed_payments: number
  pending_payments: number
  failed_payments: number
  total_payments: number
  // Add these new fields
  total_bookings?: number
  completed_bookings?: number
  pending_bookings?: number
  month?: string
}


interface SpendingStats {
  total_spent: number
  this_month_spent: number
  stripe_payments: number
  mpesa_payments: number
  completed_payments: number
  pending_payments: number
  failed_payments: number
  total_payments: number
  month?: string
}



// Profile Tab Component
  const ProfileTab: React.FC<{ user: User }> = ({ user }) => {
  const [updateUser, { isLoading: isUpdating }] = useUpdateUsersDetailsMutation()
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation() 
  const [activeSection, setActiveSection] = useState<'personal' | 'security'>('personal')
  const [toastId, setToastId] = useState<string | number | null>(null)
  const { token } = useSelector((state: RootState) => state.authSlice)

  const [showMpesaPhoneModal, setShowMpesaPhoneModal] = useState(false);
  const [selectedBookingForMpesa, setSelectedBookingForMpesa] = useState<BookingData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false);

  

  // Personal Info Form
  const [personalInfo, setPersonalInfo] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
    phone_number: user.phone_number || '',
    address: user.address || ''
  })

  // Security Form
  const [securityInfo, setSecurityInfo] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

const [searchParams, setSearchParams] = useSearchParams()
const [showSuccessModal, setShowSuccessModal] = useState(false)
const [paymentSuccessData, setPaymentSuccessData] = useState<{
  paymentId?: number
  bookingId?: number
  amount?: number
  transactionId?: string
}>({})

useEffect(() => {
  const paymentSuccess = searchParams.get('payment_success')
  const paymentId = searchParams.get('payment_id')
  const bookingId = searchParams.get('booking_id')
  const amount = searchParams.get('amount')
  const transactionId = searchParams.get('transaction_id')

  if (paymentSuccess === 'true') {
    setPaymentSuccessData({
      paymentId: paymentId ? parseInt(paymentId) : undefined,
      bookingId: bookingId ? parseInt(bookingId) : undefined,
      amount: amount ? parseFloat(amount) : undefined,
      transactionId: transactionId || undefined
    })
    setShowSuccessModal(true)
    
    // Clean up URL params
    searchParams.delete('payment_success')
    searchParams.delete('payment_id')
    searchParams.delete('booking_id')
    searchParams.delete('amount')
    searchParams.delete('transaction_id')
    setSearchParams(searchParams, { replace: true })
  }
}, [searchParams, setSearchParams])

// Update your handlePayment function to redirect with success params

const handlePayment = async (booking: any, method: 'card' | 'mpesa') => {
  try {
    if (method === 'card') {
      // Existing Stripe code
      await stripePromise;
      const header = { 'Content-Type': 'application/json' };
      
      const checkoutResponse = await axios.post(
        `${apiDomain}/payments/create-intent`, 
        JSON.stringify(booking), 
        {
          headers: { ...header, Authorization: `${token}` },
        }
      );

      const { session } = checkoutResponse.data;
      
      if (session?.url) {
        // Store booking info in localStorage for when user returns
        localStorage.setItem('pendingPayment', JSON.stringify({
          bookingId: booking.booking_id,
          amount: booking.total_amount
        }));
        
        window.location.href = session.url;
      } else {
        toast.error('Invalid checkout response');
      }
    } else if (method === 'mpesa') {
      // M-Pesa payment via Paystack Hosted Checkout
      const toastId = toast.loading('Initializing M-Pesa payment...');
      
      try {
        const response = await axios.post(
          `${apiDomain}/payments/mpesa/initialize`,
          {
            booking_id: booking.booking_id,
            amount: booking.total_amount
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );

        toast.dismiss(toastId);
        
        if (response.data.success) {
          const paymentData = response.data.data;
          
          console.log('✅ M-Pesa payment initialized:', paymentData);
          
          toast.success('Redirecting to Paystack...');
          
          // Store payment info in localStorage for callback
          localStorage.setItem('pendingMpesaPayment', JSON.stringify({
            bookingId: booking.booking_id,
            paymentId: paymentData.payment_id,
            reference: paymentData.reference,
            amount: booking.total_amount
          }));
          
          // Redirect to Paystack's hosted checkout page
          setTimeout(() => {
            window.location.href = paymentData.checkout_url;
          }, 1500);
          
        } else {
          toast.error('Failed to initialize M-Pesa payment', {
            description: response.data.error || 'Please try again'
          });
        }
      } catch (error: any) {
        toast.dismiss(toastId);
        throw error;
      }
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    toast.error('Payment failed', {
      description: error?.response?.data?.message || 'Please try again later.',
    });
  }
};

// Add the modal at the end of your UserDashboard return statement
{/* Payment Success Modal */}
<PaymentSuccessModal
  isOpen={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  paymentData={paymentSuccessData}
/>

  const handlePersonalInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const toastId = toast.loading('Updating profile...')
    setToastId(toastId)

    try {
      // Only send fields that have changed, don't send password unless changing it
      const updateData = {
        first_name: personalInfo.first_name,
        last_name: personalInfo.last_name,
        email: personalInfo.email,
        phone_number: personalInfo.phone_number,
        address: personalInfo.address
      }

      await updateUser({
        user_id: user.user_id,
        ...updateData
      }).unwrap()

      toast.success('Profile updated successfully!', { 
        id: toastId,
        duration: 3000 
      })
    } catch (error: any) {
      toast.error('Failed to update profile', { 
        id: toastId,
        description: error?.data?.message || 'Please try again' 
      })
    } finally {
      setToastId(null)
    }
  }

const handleSecurityUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (securityInfo.new_password !== securityInfo.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    if (securityInfo.new_password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    const toastId = toast.loading('Updating password...')
    setToastId(toastId)

    try {
      // ✅ Use RTK Query mutation
      await changePassword({
        current_password: securityInfo.current_password,
        new_password: securityInfo.new_password
      }).unwrap()

      toast.success('Password updated successfully!', { 
        id: toastId,
        duration: 3000 
      })
      
      // Clear form
      setSecurityInfo({ 
        current_password: '', 
        new_password: '', 
        confirm_password: '' 
      })
    } catch (error: any) {
      console.error('Password update error:', error)
      
      // RTK Query error format
      const errorMessage = error?.data?.error || 
                          error?.data?.details || 
                          'Please try again'
      
      toast.error('Failed to update password', { 
        id: toastId,
        description: errorMessage 
      })
    } finally {
      setToastId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.first_name} {user.last_name}</h1>
            <p className="text-blue-200">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-blue-200">Active Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <div className="flex gap-4 border-b border-gray-200 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveSection('personal')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'personal'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <User size={20} />
            Personal Info
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSection === 'security'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Shield size={20} />
            Security
          </button>
        </div>

        {/* Personal Info Section */}
        {activeSection === 'personal' && (
          <div className="mt-6">
            <form onSubmit={handlePersonalInfoUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={personalInfo.first_name}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={personalInfo.last_name}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={personalInfo.phone_number}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone_number: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your address"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isUpdating || !!toastId}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPersonalInfo({
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    email: user.email || '',
                    phone_number: user.phone_number || '',
                    address: user.address || ''
                  })}
                  className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Security Section */}
        {activeSection === 'security' && (
          <div className="mt-6">
            <form onSubmit={handleSecurityUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={securityInfo.current_password}
                  onChange={(e) => setSecurityInfo(prev => ({ ...prev, current_password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={securityInfo.new_password}
                    onChange={(e) => setSecurityInfo(prev => ({ ...prev, new_password: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={securityInfo.confirm_password}
                    onChange={(e) => setSecurityInfo(prev => ({ ...prev, confirm_password: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="text-orange-600" size={20} />
                  <h4 className="font-semibold text-orange-800">Password Requirements</h4>
                </div>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• At least 6 characters long</li>
                  <li>• Include uppercase and lowercase letters</li>
                  <li>• Include at least one number</li>
                </ul>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={!!toastId}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center gap-2"
                >
                  <Shield size={20} />
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setSecurityInfo({ current_password: '', new_password: '', confirm_password: '' })}
                  className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

const SpendingTab: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')
  const [dateRange, setDateRange] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('all')
  
  // Fetch user's payments - TypeScript knows this returns UserPayment[]
  const { 
    data: paymentsData, 
    isLoading: paymentsLoading, 
    refetch: refetchPayments 
  } = useGetMyPaymentsQuery()
  
  // Fetch spending stats
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    refetch: refetchStats 
  } = useGetMySpendingStatsQuery()

  // Now TypeScript knows payments is UserPayment[]
  const payments:UserPayment[] = paymentsData?.data || []
  
  const stats: SpendingStats = statsData?.stats || {
    total_spent: 0,
    this_month_spent: 0,
    stripe_payments: 0,
    mpesa_payments: 0,
    completed_payments: 0,
    pending_payments: 0,
    failed_payments: 0,
    total_payments: 0
  }

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true
    return payment.payment_status.toLowerCase() === filter.toLowerCase()
  })

  // Format date - FIXED: Use string parameter
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Get status color and icon
  const getPaymentStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle size={14} />,
          label: 'Completed'
        }
      case 'pending':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock size={14} />,
          label: 'Pending'
        }
      case 'failed':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle size={14} />,
          label: 'Failed'
        }
      case 'refunded':
        return { 
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: <RefreshCw size={14} />,
          label: 'Refunded'
        }
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle size={14} />,
          label: status
        }
    }
  }

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'stripe':
        return <CreditCard className="text-blue-600" size={16} />
      case 'mpesa':
        return <Smartphone className="text-green-600" size={16} />
      default:
        return <CreditCard className="text-gray-600" size={16} />
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    refetchPayments()
    refetchStats()
    toast.success('Spending data refreshed!')
  }

  // Handle export
  const handleExport = () => {
    toast.info('Export feature coming soon!')
  }

  if (paymentsLoading || statsLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader className="mx-auto text-blue-600 animate-spin mb-4" size={40} />
          <p className="text-gray-600">Loading your spending data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-white to-blue-200 rounded-2xl flex items-center justify-center">
              <DollarSign size={40} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Spending</h1>
              <p className="text-blue-200">Track your payments and spending history</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Total Spent - Now from COMPLETED bookings */}
  <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
        <DollarSign className="text-white" size={24} />
      </div>
      <TrendingUp className="text-green-600" size={24} />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">
      {formatCurrency(stats.total_spent || 0)}
    </h3>
    <p className="text-gray-600 text-sm">Total Spent</p>
    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
      <CheckCircle size={12} />
      {stats.completed_bookings || 0} completed bookings
    </div>
  </div>

  {/* This Month */}
  <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
        <Calendar className="text-white" size={24} />
      </div>
      <BarChart3 className="text-blue-600" size={24} />
    </div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">
      {formatCurrency(stats.this_month_spent || 0)}
    </h3>
    <p className="text-gray-600 text-sm">This Month</p>
  </div>

  {/* Booking Status */}
  <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
        <CheckCircle className="text-white" size={24} />
      </div>
      <PieChart className="text-purple-600" size={24} />
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">Completed</span>
        <span className="font-bold text-green-600">{stats.completed_bookings || 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Pending</span>
        <span className="font-bold text-yellow-600">{stats.pending_bookings || 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Total</span>
        <span className="font-bold text-blue-600">{stats.total_bookings || 0}</span>
      </div>
    </div>
  </div>

  {/* Payment Methods */}
  <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
        <CreditCard className="text-white" size={24} />
      </div>
      <Smartphone className="text-orange-600" size={24} />
    </div>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-gray-600">Card</span>
        <span className="font-bold text-blue-600">{stats.stripe_payments || 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">M-Pesa</span>
        <span className="font-bold text-green-600">{stats.mpesa_payments || 0}</span>
      </div>
    </div>
  </div>
</div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All Payments
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold bg-white/30">
                {payments.length}
              </span>
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                filter === 'completed'
                  ? 'bg-gradient-to-r from-green-600 to-green-800 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Completed
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold bg-white/30">
                {stats.completed_payments}
              </span>
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                filter === 'pending'
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-800 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Pending
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold bg-white/30">
                {stats.pending_payments}
              </span>
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-5 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                filter === 'failed'
                  ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Failed
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-bold bg-white/30">
                {stats.failed_payments}
              </span>
            </button>
          </div>
          
          <button
            onClick={handleExport}
            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <CreditCard className="text-blue-600" size={24} />
          Payment History
        </h2>
        
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No payments found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You haven't made any payments yet." 
                : `No ${filter} payments found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => {
              const statusInfo = getPaymentStatusInfo(payment.payment_status)
              return (
                <div 
                  key={payment.payment_id} 
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-blue-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Payment #{payment.payment_id}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Booking #{payment.booking_id} • {payment.manufacturer} {payment.model} ({payment.year})
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-bold border flex items-center gap-2 ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-3">
                          {getPaymentMethodIcon(payment.payment_method)}
                          <div>
                            <div className="font-semibold text-gray-700">Payment Method</div>
                            <div className="text-gray-600 capitalize">
                              {payment.payment_method || 'Not specified'}
                              {payment.transaction_id && (
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                  ID: {payment.transaction_id}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Calendar className="text-blue-600" size={16} />
                          <div>
                            <div className="font-semibold text-gray-700">Payment Date</div>
                            <div className="text-gray-600">{formatDate(payment.created_at)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <DollarSign className="text-green-600" size={16} />
                          <div>
                            <div className="font-semibold text-gray-700">Amount</div>
                            <div className="text-xl font-bold text-blue-600">
                              {formatCurrency(payment.amount)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Booking Dates */}
                      <div className="mt-4 pt-4 border-t border-gray-100 text-sm">
                        <div className="flex items-center gap-4">
                          <div>
                            <span className="font-semibold text-gray-700">Pickup:</span>{' '}
                            <span className="text-gray-600">{formatDate(payment.pickup_date)}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Return:</span>{' '}
                            <span className="text-gray-600">{formatDate(payment.return_date)}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Booking Status:</span>{' '}
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          (payment.booking_status || 'unknown').toLowerCase() === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : (payment.booking_status || 'unknown').toLowerCase() === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.booking_status || 'Unknown'}
                        </span>
                              
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Help Text */}
      {stats.pending_payments > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-yellow-600 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-yellow-800 mb-2">Pending Payments Notice</h4>
              <p className="text-yellow-700">
                You have {stats.pending_payments} pending payment(s). These payments are being processed 
                and will be updated once confirmed by our system. If a payment remains pending for more than 
                24 hours, please contact support.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ReviewModal = ({
  currentReview,
  setCurrentReview,
  onClose,
  onSubmit,
  isSubmitting
}: {
  currentReview: any
  setCurrentReview: any
  onClose: () => void
  onSubmit: () => void
  isSubmitting: boolean
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center">
          <Star className="mx-auto text-orange-500 mb-4" size={48} />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Write a Review</h3>
          <p className="text-gray-600 mb-4 text-sm">
            Booking #{currentReview.bookingId} • Vehicle #{currentReview.vehicleId}
          </p>

          {/* Rating */}
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setCurrentReview((prev: any) => ({ ...prev, rating: star }))}
                className="text-3xl mx-1 transition-transform hover:scale-110"
              >
                {star <= currentReview.rating ? "⭐" : "☆"}
              </button>
            ))}
          </div>

          {/* FIXED TEXTAREA (keeps focus) */}
          <textarea
            value={currentReview.comment}
            onChange={(e) =>
              setCurrentReview((prev: any) => ({
                ...prev,
                comment: e.target.value
              }))
            }
            placeholder="Share your experience with this vehicle..."
            className="w-full h-32 border border-gray-300 rounded-xl p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
            >
              Cancel
            </button>

            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star size={16} />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ReviewsTab: React.FC<{ bookings: BookingData[] }> = ({ bookings }) => {
  const { data: reviewsData, isLoading, refetch } = useGetMyReviewsQuery()
  const [submitReview, { isLoading: isSubmitting }] = useSubmitReviewMutation()

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [currentReview, setCurrentReview] = useState({
    bookingId: 0,
    vehicleId: 0,
    rating: 5,
    comment: ""
  })

  const reviews: Review[] = reviewsData?.reviews || []

  const completedBookings = bookings.filter(
    (b) => b.booking_status.toLowerCase() === "completed"
  )

  const handleSubmitReview = async () => {
    if (!currentReview.comment.trim()) {
      toast.error("Please write a review")
      return
    }

    try {
      await submitReview({
        booking_id: currentReview.bookingId,
        vehicle_id: currentReview.vehicleId,
        rating: currentReview.rating,
        comment: currentReview.comment
      }).unwrap()

      toast.success("Review submitted successfully! It will appear after admin approval.")

      setShowReviewModal(false)
      setCurrentReview({ bookingId: 0, vehicleId: 0, rating: 5, comment: "" })

      refetch()
    } catch (error: any) {
      toast.error("Failed to submit review", {
        description:
          error?.data?.error || error?.data?.message || "Please try again"
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-900 to-orange-800 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-white to-orange-200 rounded-2xl flex items-center justify-center">
              <Star size={40} className="text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">My Reviews</h1>
              <p className="text-orange-200">Share your experience and help other renters</p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw size={20} />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* PENDING REVIEWS */}
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pending Reviews</h2>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
            {completedBookings.length} available
          </span>
        </div>

        {completedBookings.length === 0 ? (
          <div className="text-center py-8">
            <Star className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">No completed bookings to review yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {completedBookings.map((booking) => {
              const alreadyReviewed = reviews.some(
                (r: Review) => r.booking_id === booking.booking_id
              )

              return (
                <div
                  key={booking.booking_id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-orange-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">Booking #{booking.booking_id}</h3>
                    <p className="text-gray-600 text-sm">
                      Completed on{" "}
                      {new Date(booking.return_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>

                    {alreadyReviewed && (
                      <span className="inline-flex items-center gap-1 mt-1 text-green-600 text-sm">
                        <CheckCircle size={14} />
                        Already reviewed
                      </span>
                    )}
                  </div>

                  {!alreadyReviewed && (
                    <button
                      onClick={() => {
                        setCurrentReview({
                          bookingId: booking.booking_id,
                          vehicleId: booking.vehicle_id,
                          rating: 5,
                          comment: ""
                        })
                        setShowReviewModal(true)
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      <Star size={16} />
                      Write Review
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MY REVIEWS */}
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {reviews.length} total
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader className="mx-auto text-orange-500 animate-spin mb-4" size={32} />
            <p className="text-gray-600">Loading your reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">You haven't written any reviews yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Complete a booking to write your first review!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: Review) => (
              <div
                key={review.review_id}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i < review.rating
                            ? "text-orange-500 fill-orange-500"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    <span className="ml-2 text-lg font-bold text-orange-600">
                      {review.rating}.0
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        review.is_approved
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      }`}
                    >
                      {review.is_approved ? (
                        <>
                          <CheckCircle size={12} className="inline mr-1" />
                          Approved
                        </>
                      ) : (
                        <>
                          <Clock size={12} className="inline mr-1" />
                          Pending
                        </>
                      )}
                    </span>

                    <span className="text-sm text-gray-500">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : "No date"}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{review.comment}</p>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Vehicle:{" "}
                    {review.vehicle_name ||
                      `${review.manufacturer || ""} ${review.model || ""}`.trim() ||
                      `Vehicle #${review.vehicle_id}`}{" "}
                    • Booking #{review.booking_id}
                  </span>

                  {review.admin_notes && !review.is_approved && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                      <strong>Admin Note:</strong> {review.admin_notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL FIXED */}
      {showReviewModal && (
        <ReviewModal
          currentReview={currentReview}
          setCurrentReview={setCurrentReview}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleSubmitReview}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}



// // Reviews Tab Component
// const ReviewsTab: React.FC<{ bookings: BookingData[] }> = ({ bookings }) => {
//   // RTK Query hooks
//   const { data: reviewsData, isLoading, refetch } = useGetMyReviewsQuery()
//   const [submitReview, { isLoading: isSubmitting }] = useSubmitReviewMutation()
  
//   // Fix: Use useState for currentReview
//   const [showReviewModal, setShowReviewModal] = useState(false)
//   const [currentReview, setCurrentReview] = useState({ 
//     bookingId: 0, 
//     vehicleId: 0,
//     rating: 5, 
//     comment: '' 
//   })

//   // Fix: Remove duplicate declaration - only declare once
//   const reviews: Review[] = reviewsData?.reviews || []

//   const completedBookings = bookings.filter(b => 
//     b.booking_status.toLowerCase() === 'completed'
//   )

//   const handleSubmitReview = async () => {
//     if (!currentReview.comment.trim()) {
//       toast.error('Please write a review')
//       return
//     }

//     try {
//       await submitReview({
//         booking_id: currentReview.bookingId,
//         vehicle_id: currentReview.vehicleId,
//         rating: currentReview.rating,
//         comment: currentReview.comment
//       }).unwrap()

//       toast.success('Review submitted successfully! It will appear after admin approval.')
//       setShowReviewModal(false)
//       setCurrentReview({ bookingId: 0, vehicleId: 0, rating: 5, comment: '' })
      
//       // RTK Query will automatically refetch due to invalidatesTags
//       refetch()
//     } catch (error: any) {
//       console.error('❌ Review submission error:', error)
      
//       toast.error('Failed to submit review', {
//         description: error?.data?.error || error?.data?.message || 'Please try again'
//       })
//     }
//   }

//   const handleRefreshReviews = () => {
//     refetch()
//   }

//   // Review Modal Component (included for completeness)
  

//   return (
//     <div className="space-y-8">
//       {/* Header with refresh button */}
//       <div className="bg-gradient-to-r from-orange-900 to-orange-800 rounded-2xl p-8 text-white">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-6">
//             <div className="w-24 h-24 bg-gradient-to-br from-white to-orange-200 rounded-2xl flex items-center justify-center">
//               <Star size={40} className="text-orange-600" />
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold">My Reviews</h1>
//               <p className="text-orange-200">Share your experience and help other renters</p>
//             </div>
//           </div>
//           <button
//             onClick={handleRefreshReviews}
//             disabled={isLoading}
//             className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
//           >
//             {isLoading ? (
//               <>
//                 <Loader size={20} className="animate-spin" />
//                 Loading...
//               </>
//             ) : (
//               <>
//                 <RefreshCw size={20} />
//                 Refresh
//               </>
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Pending Reviews Section */}
//       <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold text-gray-900">Pending Reviews</h2>
//           <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
//             {completedBookings.length} available
//           </span>
//         </div>
        
//         {completedBookings.length === 0 ? (
//           <div className="text-center py-8">
//             <Star className="mx-auto text-gray-300 mb-4" size={48} />
//             <p className="text-gray-600">No completed bookings to review yet</p>
//           </div>
//         ) : (
//           <div className="grid gap-4">
//             {completedBookings.map(booking => {
//               // Check if user already reviewed this booking
//               const alreadyReviewed = reviews.some((r: Review) => r.booking_id === booking.booking_id)
              
//               return (
//                 <div key={booking.booking_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-orange-50 transition-colors">
//                   <div>
//                     <h3 className="font-semibold text-gray-900">Booking #{booking.booking_id}</h3>
//                     <p className="text-gray-600 text-sm">
//                       Completed on {new Date(booking.return_date).toLocaleDateString('en-US', {
//                         month: 'short',
//                         day: 'numeric',
//                         year: 'numeric'
//                       })}
//                     </p>
//                     {alreadyReviewed && (
//                       <span className="inline-flex items-center gap-1 mt-1 text-green-600 text-sm">
//                         <CheckCircle size={14} />
//                         Already reviewed
//                       </span>
//                     )}
//                   </div>
//                   {!alreadyReviewed && (
//                     <button
//                       onClick={() => {
//                         setCurrentReview({ 
//                           bookingId: booking.booking_id,
//                           vehicleId: booking.vehicle_id,
//                           rating: 5, 
//                           comment: '' 
//                         })
//                         setShowReviewModal(true)
//                       }}
//                       className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
//                     >
//                       <Star size={16} />
//                       Write Review
//                     </button>
//                   )}
//                 </div>
//               )
//             })}
//           </div>
//         )}
//       </div>

//       {/* My Reviews Section */}
//       <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
//           <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
//             {reviews.length} total
//           </span>
//         </div>
        
//         {isLoading ? (
//           <div className="text-center py-8">
//             <Loader className="mx-auto text-orange-500 animate-spin mb-4" size={32} />
//             <p className="text-gray-600">Loading your reviews...</p>
//           </div>
//         ) : reviews.length === 0 ? (
//           <div className="text-center py-8">
//             <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
//             <p className="text-gray-600">You haven't written any reviews yet</p>
//             <p className="text-gray-500 text-sm mt-2">Complete a booking to write your first review!</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {reviews.map((review: Review) => (
//               <div key={review.review_id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center gap-2">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         size={20}
//                         className={i < review.rating ? "text-orange-500 fill-orange-500" : "text-gray-300"}
//                       />
//                     ))}
//                     <span className="ml-2 text-lg font-bold text-orange-600">{review.rating}.0</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className={`px-2 py-1 rounded-full text-xs font-bold ${
//                       review.is_approved 
//                         ? 'bg-green-100 text-green-800 border border-green-200' 
//                         : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
//                     }`}>
//                       {review.is_approved ? (
//                         <>
//                           <CheckCircle size={12} className="inline mr-1" />
//                           Approved
//                         </>
//                       ) : (
//                         <>
//                           <Clock size={12} className="inline mr-1" />
//                           Pending
//                         </>
//                       )}
//                     </span>
//                     <span className="text-sm text-gray-500">
//                       {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'No date'}
//                     </span>
//                   </div>
//                 </div>
//                 <p className="text-gray-700 mb-3">{review.comment}</p>
//                 <div className="mt-3 pt-3 border-t border-gray-100">
//                   <span className="text-sm text-gray-500">
//                     Vehicle: {review.vehicle_name || 
//                               `${review.manufacturer || ''} ${review.model || ''}`.trim() || 
//                               `Vehicle #${review.vehicle_id}`} • 
//                     Booking #{review.booking_id}
//                   </span>
//                   {review.admin_notes && !review.is_approved && (
//                     <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
//                       <strong>Admin Note:</strong> {review.admin_notes}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Review Modal */}
//       {showReviewModal && <ReviewModal />}
//     </div>
//   )
// }

// Support Tab Component
const SupportTab: React.FC<{ bookings: BookingData[] }> = ({ bookings }) => {
  const [activeSupportTab, setActiveSupportTab] = useState<'damage' | 'general' | 'technical'>('damage')
  const [supportForm, setSupportForm] = useState({
    subject: '',
    description: '',
    type: 'damage_report' as 'damage_report' | 'general_inquiry' | 'technical_issue',
    booking_id: 0
  })

  // Use RTK Query mutation
  const [createSupportTicket, { isLoading: isSubmitting }] = useCreateSupportTicketMutation()

  // Get vehicle details for bookings
  const { data: vehicleDetails } = useGetVehicleByIdQuery(
    supportForm.booking_id > 0 
      ? bookings.find(b => b.booking_id === supportForm.booking_id)?.vehicle_id || 0
      : 0,
    { skip: supportForm.booking_id === 0 }
  )

  // Helper function to get available bookings based on ticket type
  const getAvailableBookings = (ticketType: string) => {
    if (!bookings || bookings.length === 0) return [];
    
    switch (ticketType) {
      case 'damage_report':
        // Damage reports: Only ACTIVE bookings (not completed)
        return bookings.filter(b => 
          b.booking_status.toLowerCase() === 'active'
        );
      
      case 'technical_issue':
        // Technical issues: Only ACTIVE bookings
        return bookings.filter(b => 
          b.booking_status.toLowerCase() === 'active'
        );
      
      case 'general_inquiry':
      default:
        // General inquiries: ALL bookings
        return bookings;
    }
  };

  // Get available bookings based on current type
  const availableBookings = getAvailableBookings(supportForm.type);

  // Get vehicle name for selected booking
  const getSelectedVehicleName = () => {
    if (supportForm.booking_id === 0) return null;
    
    const selectedBooking = bookings.find(b => b.booking_id === supportForm.booking_id);
    if (!selectedBooking) return null;
    
    // If we have vehicle details from the query, use them
    if (vehicleDetails && vehicleDetails.specification) {
      return `${vehicleDetails.specification.manufacturer} ${vehicleDetails.specification.model}`;
    }
    
    // Fallback: show vehicle ID if name not available
    return `Vehicle #${selectedBooking.vehicle_id}`;
  };

  // Reset form when tab changes
  const handleTabChange = (tab: 'damage' | 'general' | 'technical') => {
    setActiveSupportTab(tab)
    
    // Reset form with appropriate type
    setSupportForm({
      subject: '',
      description: '',
      type: tab === 'damage' ? 'damage_report' : 
             tab === 'general' ? 'general_inquiry' : 'technical_issue',
      booking_id: 0
    })
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supportForm.description.trim()) {
      toast.error('Please provide a description')
      return
    }

    if (!supportForm.subject.trim()) {
      toast.error('Please provide a subject')
      return
    }

    // For damage reports AND technical issues, booking_id is required
    if (['damage_report', 'technical_issue'].includes(supportForm.type) && supportForm.booking_id === 0) {
      const typeName = supportForm.type === 'damage_report' ? 'damage report' : 'technical issue';
      toast.error(`Please select an active booking for ${typeName}`)
      return
    }

    try {
      // Create payload
      const payload = {
        subject: supportForm.subject.trim(),
        description: supportForm.description.trim(),
        type: supportForm.type,
        priority: 'medium' as const,
        // Include booking_id for damage reports AND technical issues
        ...((supportForm.type === 'damage_report' || supportForm.type === 'technical_issue') && { 
          booking_id: supportForm.booking_id 
        })
      }

      console.log("📤 Sending support ticket payload:", payload)

      // Use RTK Query
      const result = await createSupportTicket(payload).unwrap();
      
      console.log("✅ Ticket created successfully:", result)

      toast.success('Support ticket submitted successfully!')
      
      // Reset form after successful submission
      setSupportForm({ 
        subject: '', 
        description: '', 
        type: supportForm.type, // Keep the same type
        booking_id: 0 
      })
    } catch (error: any) {
      console.log("🔴 RTK QUERY ERROR:", error)
      console.log("🔴 ERROR DATA:", error.data)
      
      const errorMessage = error?.data?.error || 
                          error?.data?.message || 
                          error?.message || 
                          'Please try again'
      
      toast.error(`Failed to submit ticket: ${errorMessage}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-white to-purple-200 rounded-2xl flex items-center justify-center">
            <MessageSquare size={40} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Support Center</h1>
            <p className="text-purple-200">We're here to help you with any issues</p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200 pb-4 overflow-x-auto">
          <button
            onClick={() => handleTabChange('damage')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSupportTab === 'damage'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle size={20} />
            Report Damage
          </button>
          <button
            onClick={() => handleTabChange('general')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSupportTab === 'general'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={20} />
            General Inquiry
          </button>
          <button
            onClick={() => handleTabChange('technical')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeSupportTab === 'technical'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings size={20} />
            Technical Issue
          </button>
        </div>

        {/* Ticket Type Info */}
        <div className="mt-4 mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <InfoIcon size={18} className="text-purple-600" />
            <span className="font-semibold text-purple-800">Ticket Type Information:</span>
          </div>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• <span className="font-semibold">Damage Reports:</span> For reporting vehicle damage during active rentals only</li>
            <li>• <span className="font-semibold">Technical Issues:</span> For platform/website issues during active bookings only</li>
            <li>• <span className="font-semibold">General Inquiries:</span> For any other questions or concerns</li>
          </ul>
        </div>

        <form onSubmit={handleSupportSubmit} className="space-y-6">
          {/* Subject Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={supportForm.subject}
              onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={`Brief description of your ${activeSupportTab === 'damage' ? 'damage report' : activeSupportTab === 'technical' ? 'technical issue' : 'inquiry'}`}
              required
            />
          </div>

          {/* Booking Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Booking 
              {['damage_report', 'technical_issue'].includes(supportForm.type) && ' (Required)'}
            </label>
            <select
              value={supportForm.booking_id}
              onChange={(e) => setSupportForm(prev => ({ 
                ...prev, 
                booking_id: parseInt(e.target.value) || 0 
              }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required={['damage_report', 'technical_issue'].includes(supportForm.type)}
            >
              <option value={0}>
                {['damage_report', 'technical_issue'].includes(supportForm.type)
                  ? 'Select an active booking' 
                  : 'Select a booking (optional)'}
              </option>
              {availableBookings.map(booking => {
                // Find vehicle name for each booking
                const vehicleName = `Vehicle #${booking.vehicle_id}`; // Default
                
                return (
                  <option key={booking.booking_id} value={booking.booking_id}>
                    Booking #{booking.booking_id} • {booking.booking_status} • {vehicleName}
                  </option>
                )
              })}
            </select>
            
            {/* No Active Bookings Warning */}
            {['damage_report', 'technical_issue'].includes(supportForm.type) && availableBookings.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-yellow-600" size={16} />
                  <span className="text-yellow-700 text-sm">
                    No active bookings found. {supportForm.type === 'damage_report' 
                      ? 'Damage reports can only be submitted for active rentals.' 
                      : 'Technical issues can only be reported for active bookings.'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Selected Booking Info */}
          {supportForm.booking_id > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-600" size={16} />
                    <span className="font-semibold text-blue-800">Selected Booking:</span>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>Booking #{supportForm.booking_id}</div>
                    {getSelectedVehicleName() && (
                      <div>Vehicle: {getSelectedVehicleName()}</div>
                    )}
                    <div>
                      Status: {
                        bookings.find(b => b.booking_id === supportForm.booking_id)?.booking_status || 'Unknown'
                      }
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSupportForm(prev => ({ ...prev, booking_id: 0 }))}
                  className="text-sm text-red-600 hover:text-red-800 font-semibold"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Booking Required Warning */}
          {['damage_report', 'technical_issue'].includes(supportForm.type) && supportForm.booking_id === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-600" size={16} />
                <span className="text-red-700 text-sm">
                  ⚠️ {supportForm.type === 'damage_report' ? 'Damage reports' : 'Technical issues'} require an active booking selection
                </span>
              </div>
            </div>
          )}

          {/* Description Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              value={supportForm.description}
              onChange={(e) => setSupportForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full h-32 border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder={`Please describe the ${activeSupportTab === 'damage' ? 'damage in detail, including location and severity' : activeSupportTab === 'technical' ? 'technical issue you are experiencing' : 'inquiry or issue you need help with'}...`}
              required
            />
            <div className="text-xs text-gray-500 mt-1">
              Please provide as much detail as possible. For urgent matters, call our support line.
            </div>
          </div>

          {/* Important Notices */}
          {activeSupportTab === 'damage' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-600" size={20} />
                <h4 className="font-semibold text-red-800">Important Damage Report Guidelines</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Report damage immediately upon discovery during active rental</li>
                <li>• Take clear photos of the damage from multiple angles</li>
                <li>• Do not attempt repairs yourself - contact us first</li>
                <li>• Our team will contact you within 2 business hours</li>
                <li>• False damage reports may result in account suspension</li>
                <li>• You may be responsible for repair costs if negligence is found</li>
              </ul>
            </div>
          )}

          {activeSupportTab === 'technical' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="text-blue-600" size={20} />
                <h4 className="font-semibold text-blue-800">Technical Issue Reporting</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Report technical issues immediately when encountered</li>
                <li>• Include screenshots or screen recordings if possible</li>
                <li>• Note the exact time and steps to reproduce the issue</li>
                <li>• Our technical team will respond within 4 business hours</li>
                <li>• For urgent platform outages, call our support line</li>
                <li>• Check our status page for known issues</li>
              </ul>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquare size={20} />
                  Submit Ticket
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSupportForm({ 
                subject: '', 
                description: '', 
                type: supportForm.type,
                booking_id: 0 
              })}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <X size={18} />
              Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 text-center hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Phone className="text-purple-600" size={24} />
          </div>
          <div className="text-lg font-bold text-purple-600">+1 (555) 123-4567</div>
          <div className="text-gray-600 text-sm">24/7 Support Line</div>
          <div className="text-xs text-gray-500 mt-2">For urgent matters only</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 text-center hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Mail className="text-purple-600" size={24} />
          </div>
          <div className="text-lg font-bold text-purple-600">support@carrental.com</div>
          <div className="text-gray-600 text-sm">Email Support</div>
          <div className="text-xs text-gray-500 mt-2">Response within 24 hours</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 text-center hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Clock className="text-purple-600" size={24} />
          </div>
          <div className="text-lg font-bold text-purple-600">Response Time</div>
          <div className="text-gray-600 text-sm">
            {activeSupportTab === 'damage' ? 'Within 2 hours' : 
             activeSupportTab === 'technical' ? 'Within 4 hours' : 
             'Within 24 hours'}
          </div>
          <div className="text-xs text-gray-500 mt-2">During business hours</div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <HelpCircle className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold text-gray-900">Need Help?</h3>
        </div>
        <div className="text-gray-700 space-y-2">
          <p>• Check our <a href="/faq" className="text-blue-600 hover:underline">FAQ page</a> for common questions</p>
          <p>• Visit our <a href="/knowledge-base" className="text-blue-600 hover:underline">Knowledge Base</a> for guides and tutorials</p>
          <p>• Review our <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> for policies</p>
          <p className="text-sm text-gray-600 mt-4">
            Your ticket will be assigned a unique ID and you'll receive email updates.
          </p>
        </div>
      </div>
    </div>
  )
}



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

const UserDashboard: React.FC = () => {
  const [createSupportTicket] = useCreateSupportTicketMutation()
  const { data: bookings, isLoading, } = useGetMyBookingsQuery()
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation()
  const [activeTab, setActiveTab] = useState<'bookings' | 'spending' | 'profile' | 'reviews' | 'support'>('bookings')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled'>('all')
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [damageReport, setDamageReport] = useState({ bookingId: 0, description: '' })
  const [review, setReview] = useState({ bookingId: 0, rating: 5, comment: '' })
  const [showDamageModal, setShowDamageModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const location = useLocation() // Use useLocation instead of useSearchParams
  const navigate = useNavigate()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successBookingId, setSuccessBookingId] = useState<number | null>(null)

  const [showMpesaPhoneModal, setShowMpesaPhoneModal] = useState(false);
  const [selectedBookingForMpesa, setSelectedBookingForMpesa] = useState<BookingData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingMpesa, setIsProcessingMpesa] = useState(false);

  const { token, user } = useSelector((state: RootState) => state.authSlice)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const paymentSuccess = searchParams.get('payment_success')
    const bookingId = searchParams.get('booking_id')

    if (paymentSuccess === 'true' && bookingId) {
      setSuccessBookingId(parseInt(bookingId))
      setShowSuccessModal(true)
      
      // Clear the URL parameters (optional)
      window.history.replaceState({}, '', '/my-bookings')
    }
  }, [location])

  // Simple Payment Success Modal
  const SimplePaymentModal = () => {
    if (!showSuccessModal) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Received!
            </h2>
            <p className="text-gray-600 mb-6">
              Your payment has been successfully processed.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <Clock className="text-yellow-600 mt-1" size={20} />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-1">Next Step:</h3>
                  <p className="text-yellow-700 text-sm">
                    Your booking is now pending admin approval. 
                    You'll receive a confirmation email within 24 hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  if (successBookingId) {
                    navigate(`/booking-confirmation/${successBookingId}`)
                  }
                  setShowSuccessModal(false)
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
              >
                View Booking Details
              </button>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const MpesaPhoneModal = ({ token }: { token: string }) => {
    if (!showMpesaPhoneModal || !selectedBookingForMpesa) return null;

    const handleSubmit = async () => {
      if (!phoneNumber.trim()) {
        toast.error('Please enter your M-Pesa phone number');
        return;
      }

      // Validate phone number format
      const phoneRegex = /^(07|2547)\d{8}$/;
      const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');
      
      if (!phoneRegex.test(cleanPhone)) {
        toast.error('Invalid phone number format. Use: 07XXXXXXXX or 2547XXXXXXXX');
        return;
      }

      // Check if token exists
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      setIsProcessingMpesa(true);
      
      try {
        const toastId = toast.loading('Initializing M-Pesa payment...');
        
        const response = await axios.post(
          `${apiDomain}/payments/mpesa/initialize`,
          {
            booking_id: selectedBookingForMpesa.booking_id,
            amount: selectedBookingForMpesa.total_amount,
            phone_number: cleanPhone
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`  // Use Bearer token
            }
          }
        );

        toast.dismiss(toastId);
        
        if (response.data.success) {
          const paymentData = response.data.data;
          
          console.log('✅ M-Pesa payment initialized:', paymentData);
          
          if (paymentData.requires_otp) {
            toast.info(paymentData.display_text || 'Please check your phone for OTP');
          } else {
            toast.success(paymentData.display_text || 'Check your phone for STK Push');
          }
          
          // Store payment info in localStorage
          localStorage.setItem('pendingMpesaPayment', JSON.stringify({
            bookingId: selectedBookingForMpesa.booking_id,
            paymentId: paymentData.payment_id,
            reference: paymentData.reference,
            amount: selectedBookingForMpesa.total_amount
          }));
          
          // Close modal
          setShowMpesaPhoneModal(false);
          setSelectedBookingForMpesa(null);
          setPhoneNumber('');
          
        } else {
          toast.error('Failed to initialize M-Pesa payment', {
            description: response.data.error || 'Please try again'
          });
        }
      } catch (error: any) {
        console.error('M-Pesa error:', error);
        
        let errorMessage = 'Please try again later.';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.details) {
          errorMessage = error.response.data.details;
        }
        
        toast.error('M-Pesa payment failed', {
          description: errorMessage
        });
      } finally {
        setIsProcessingMpesa(false);
      }
    };

    const handleClose = () => {
      setShowMpesaPhoneModal(false);
      setSelectedBookingForMpesa(null);
      setPhoneNumber('');
      setIsProcessingMpesa(false);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Smartphone className="text-green-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pay with M-Pesa</h2>
                <p className="text-sm text-gray-600">Booking #{selectedBookingForMpesa.booking_id}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Enter your M-Pesa phone number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07XXXXXXXX or 2547XXXXXXXX"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                You will receive an STK Push on this number
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-yellow-600" size={16} />
                <span className="font-semibold text-yellow-800">Important:</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Ensure your phone is ON and has network signal</li>
                <li>• You have sufficient M-Pesa balance</li>
                <li>• Transaction limit is KES 150,000 per day</li>
                <li>• Enter your M-Pesa PIN when prompted</li>
                <li>• Keep your phone nearby - STK Push expires in 2 minutes</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isProcessingMpesa}
                className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isProcessingMpesa || !phoneNumber.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingMpesa ? 'Processing...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
// In UserDashboard.tsx - After payment, update the booking card
useEffect(() => {
  const searchParams = new URLSearchParams(location.search)
  const paymentSuccess = searchParams.get('payment_success')
  const bookingId = searchParams.get('booking_id')

  if (paymentSuccess === 'true' && bookingId) {
    // Update the specific booking card in the UI
    toast.success('Payment processed! Booking is now pending approval.')
    
    // Optionally refetch bookings to update status
    refetchBookings()
    
    // Clear URL
    window.history.replaceState({}, '', '/dashboard')
  }
}, [location])

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

const handlePayment = async (booking: any, method: 'card' | 'mpesa') => {
  try {
    if (method === 'card') {
      // Existing Stripe code
      await stripePromise;
      const header = { 'Content-Type': 'application/json' };
      
      const checkoutResponse = await axios.post(`${apiDomain}/payments/create-intent`, JSON.stringify(booking), {
        headers: { ...header, Authorization: `${token}` },
      });

      const { session } = checkoutResponse.data;
      
      if (session?.url) {
        window.location.href = session.url;
      } else {
        toast.error('Invalid checkout response');
      }
    } else if (method === 'mpesa') {
      // Show M-Pesa phone modal
      setSelectedBookingForMpesa(booking);
      setShowMpesaPhoneModal(true);
      setPhoneNumber('');
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    toast.error('Payment failed', {
      description: error?.response?.data?.message || 'Please try again later.',
    });
  }
};

  const handleDamageReport = async () => {
    if (!damageReport.description.trim()) {
      toast.error('Please describe the damage');
      return;
    }

    try {
      await createSupportTicket({
        subject: `Damage Report - Booking #${damageReport.bookingId}`,
        description: damageReport.description,
        type: 'damage_report',
        booking_id: damageReport.bookingId
      }).unwrap();

      toast.success('Damage reported successfully!');
      setShowDamageModal(false);
      setDamageReport({ bookingId: 0, description: '' });
    } catch (error: any) {
      console.log("🔴 Damage Report Error:", error)
      toast.error('Failed to report damage', {
        description: error?.data?.message || 'Please try again'
      });
    }
  }

  const handleReviewSubmit = async () => {
    if (!review.comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    try {
      const token = localStorage.getItem('token')
      // We need to get vehicle_id from the booking
      const booking = bookingData.find(b => b.booking_id === review.bookingId);
      if (!booking) {
        toast.error('Booking not found');
        return;
      }

      await axios.post(`${apiDomain}/reviews`, {
        booking_id: review.bookingId,
        vehicle_id: booking.vehicle_id,
        rating: review.rating,
        comment: review.comment
      }, {
        headers: { Authorization: `${token}` }
      });

      toast.success('Review submitted successfully! It will appear after admin approval.');
      setShowReviewModal(false);
      setReview({ bookingId: 0, rating: 5, comment: '' });
    } catch (error: any) {
      toast.error('Failed to submit review', {
        description: error?.response?.data?.message || 'Please try again'
      });
    }
  }

  const confirmCancel = async () => {
    if (!showCancelModal) return;
    setCancellingId(showCancelModal);

    try {
      await cancelBooking(showCancelModal).unwrap();
      toast.success('Booking cancelled successfully!');
      setShowCancelModal(null);
    } catch (err: any) {
      toast.error('Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  }

  // useEffect(() => {
  //   console.log("🔍 UserDashboard - Bookings data:", bookings)
  //   console.log("🔍 UserDashboard - Token:", token)
  //   console.log("🔍 UserDashboard - Error:", error)
  // }, [bookings, token, error])

  const bookingData: BookingData[] = Array.isArray(bookings?.booking)
    ? bookings.booking
    : bookings?.booking
    ? [bookings.booking]
    : [];

  const filteredBookings = bookingData.filter(b =>
    filter === 'all' || b.booking_status.toLowerCase() === filter
  );

  const completedBookings = bookingData.filter(b => b.booking_status.toLowerCase() === 'completed');


  return (
    <>
      <Navbar />
      {/* Remove extra spacing by using pt-0 and adjusting header padding */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-0">
        {/* Header - Adjusted padding to reduce space */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center">
                  <User className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                    Welcome back, {user?.first_name}!
                  </h1>
                  <p className="text-gray-600">Manage your rentals and account</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">{bookingData.length}</div>
                  <div className="text-gray-600 text-sm">Total Bookings</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-100">
                  <div className="text-2xl font-bold text-green-600">
                    {bookingData.filter(b => b.booking_status.toLowerCase() === 'active').length}
                  </div>
                  <div className="text-gray-600 text-sm">Active</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-100">
                  <div className="text-2xl font-bold text-orange-600">
                    {completedBookings.length}
                  </div>
                  <div className="text-gray-600 text-sm">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 sticky top-24">
                <nav className="space-y-2">
                  {[
                    { id: 'bookings', label: 'My Bookings', icon: <Calendar size={20} /> },
                     { id: 'spending', label: 'My Spending', icon: <DollarSign size={20} /> },
                    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
                    { id: 'reviews', label: 'Reviews', icon: <Star size={20} /> },
                    { id: 'support', label: 'Support', icon: <MessageSquare size={20} /> },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === item.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Link
                    to="/vehicles"
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Car size={20} />
                    Rent Another Vehicle
                  </Link>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* My Bookings Tab */}
              {activeTab === 'bookings' && (
                <div className="space-y-6">
                  {/* Filter Tabs */}
                  <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
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
                                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg'
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
                  <div className="space-y-6">
                    {filteredBookings.length === 0 ? (
                      <div className="text-center bg-white rounded-3xl shadow-2xl p-16 border border-blue-100">
                        <Calendar className="mx-auto text-gray-300 mb-6" size={80} />
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">
                          {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
                        </h3>
                        <Link to="/vehicles" className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-3">
                          <Car size={24} />
                          Browse Vehicles
                        </Link>
                      </div>
                    ) :
                    isLoading ?(
                      <>
                      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">                          
                          <div className="text-center">
                            <Loader className="mx-auto text-blue-600 animate-spin" size={48} />
                            <p className="mt-4 text-gray-600 text-lg">Loading your dashboard...</p>
                          </div>
                        </div>
                      </>
                    ) : bookingData.length === 0 ?(
                      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        
                      <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
                        <XCircle className="mx-auto text-red-500 mb-4" size={64} />
                        <h2 className="text-2xl font-bold mb-4">No Bookings found</h2>
                        <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
                          Try Again
                        </button>
                      </div>
                    </div>
                    ): (
                      filteredBookings.map(booking => (
                        <div key={booking.booking_id} className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
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
                                      <div className="font-semibold text-gray-700">Total</div>
                                      <div className="text-xl font-bold text-blue-600">${booking.total_amount}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-3">
                                <Link
                                  to={`/booking-confirmation/${booking.booking_id}`}
                                  className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                >
                                  <Eye size={18} />
                                  View Details
                                </Link>

                                {['pending', 'approved'].includes(booking.booking_status.toLowerCase()) && (
                                  <>
                                    {/* Payment Buttons */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        onClick={() => handlePayment(booking, 'card')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                      >
                                        <CreditCard size={16} />
                                        Pay with Card
                                      </button>
                                      <button
                                        onClick={() => handlePayment(booking, 'mpesa')}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                      >
                                        <Smartphone size={16} />
                                        Pay with Mpesa
                                      </button>
                                    </div>

                                    <button
                                      onClick={() => handleCancelClick(booking.booking_id)}
                                      disabled={isCancelling}
                                      className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                                    >
                                      <Trash2 size={18} />
                                      Cancel Booking
                                    </button>
                                  </>
                                )}

                                {booking.booking_status.toLowerCase() === 'completed' && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      onClick={() => {
                                        setReview({ ...review, bookingId: booking.booking_id })
                                        setShowReviewModal(true)
                                      }}
                                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                    >
                                      <Star size={16} />
                                      Write Review
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDamageReport({ ...damageReport, bookingId: booking.booking_id })
                                        setShowDamageModal(true)
                                      }}
                                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                    >
                                      <AlertTriangle size={16} />
                                      Report Damage
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && user && (
                <ProfileTab user={user} />
              )}

              {activeTab === 'spending' && (
                <SpendingTab />
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <ReviewsTab bookings={bookingData} />
              )}

              {/* Support Tab */}
              {activeTab === 'support' && (
                <SupportTab bookings={bookingData} />
              )}
            </div>
          </div>
        </div>
      </div>

        <MpesaPhoneModal token={token || ''} />

      {/* Damage Report Modal */}
      {showDamageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDamageModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Report Damage</h3>
              <textarea
                value={damageReport.description}
                onChange={(e) => setDamageReport(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please describe the damage in detail..."
                className="w-full h-32 border border-gray-300 rounded-xl p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowDamageModal(false)}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDamageReport}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <Star className="mx-auto text-orange-500 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Write a Review</h3>
              <div className="flex justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReview(prev => ({ ...prev, rating: star }))}
                    className="text-2xl mx-1"
                  >
                    {star <= review.rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              <textarea
                value={review.comment}
                onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this vehicle..."
                className="w-full h-32 border border-gray-300 rounded-xl p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCancelModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <XCircle className="mx-auto text-red-500 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Cancel Booking?</h3>
              <p className="text-gray-600 mb-8">This action cannot be undone.</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowCancelModal(null)}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={cancellingId === showCancelModal}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all disabled:opacity-70"
                >
                  {cancellingId === showCancelModal ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UserDashboard

function refetchBookings() {
  throw new Error('Function not implemented.')
}
