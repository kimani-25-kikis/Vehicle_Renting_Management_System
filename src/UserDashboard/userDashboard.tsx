import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { 
  useGetMyBookingsQuery, 
  useCancelBookingMutation 
} from '../features/api/bookingsApi'
import { useGetVehicleByIdQuery } from '../features/api/vehiclesApi'
import { useUpdateUsersDetailsMutation } from '../features/api/UserApi'
import { useCreateSupportTicketMutation } from '../features/api/supportApi'
import { 
  Calendar, MapPin, Car, Clock, CheckCircle, 
  XCircle, Loader, ArrowLeft, Eye, Trash2,
  User, Star, Settings, Shield, AlertTriangle,
  CreditCard, Smartphone, Home, BarChart3,
  MessageSquare, Heart, LogOut, Edit3,
  Phone, Mail, Map, Save
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

// Profile Tab Component
const ProfileTab: React.FC<{ user: User }> = ({ user }) => {
  const [updateUser, { isLoading: isUpdating }] = useUpdateUsersDetailsMutation()
  const [activeSection, setActiveSection] = useState<'personal' | 'security'>('personal')
  const [toastId, setToastId] = useState<string | number | null>(null)

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
      await axios.put(`${apiDomain}users/change-password`, {
        current_password: securityInfo.current_password,
        new_password: securityInfo.new_password
      }, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      })

      toast.success('Password updated successfully!', { 
        id: toastId,
        duration: 3000 
      })
      setSecurityInfo({ current_password: '', new_password: '', confirm_password: '' })
    } catch (error: any) {
      toast.error('Failed to update password', { 
        id: toastId,
        description: error?.response?.data?.message || 'Please try again' 
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

// Reviews Tab Component
const ReviewsTab: React.FC<{ bookings: BookingData[] }> = ({ bookings }) => {
  const [reviews, setReviews] = useState<any[]>([])
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [currentReview, setCurrentReview] = useState({ 
    bookingId: 0, 
    vehicleId: 0,
    rating: 5, 
    comment: '' 
  })

  const completedBookings = bookings.filter(b => b.booking_status.toLowerCase() === 'completed')

  const handleSubmitReview = async () => {
    if (!currentReview.comment.trim()) {
      toast.error('Please write a review')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(`${apiDomain}reviews`, {
        booking_id: currentReview.bookingId,
        vehicle_id: currentReview.vehicleId,
        rating: currentReview.rating,
        comment: currentReview.comment
      }, {
        headers: { Authorization: `${token}` }
      })

      toast.success('Review submitted successfully! It will appear after admin approval.')
      setShowReviewModal(false)
      setCurrentReview({ bookingId: 0, vehicleId: 0, rating: 5, comment: '' })
      // Refresh reviews list
      fetchReviews()
    } catch (error: any) {
      toast.error('Failed to submit review', {
        description: error?.response?.data?.message || 'Please try again'
      })
    }
  }

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${apiDomain}reviews/my-reviews`, {
        headers: { Authorization: `${token}` }
      })
      setReviews(response.data.reviews || [])
    } catch (error) {
      console.error('Failed to fetch reviews')
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-orange-900 to-orange-800 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-white to-orange-200 rounded-2xl flex items-center justify-center">
            <Star size={40} className="text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Reviews</h1>
            <p className="text-orange-200">Share your experience and help other renters</p>
          </div>
        </div>
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Reviews</h2>
        {completedBookings.length === 0 ? (
          <div className="text-center py-8">
            <Star className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">No completed bookings to review yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {completedBookings.map(booking => (
              <div key={booking.booking_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                <div>
                  <h3 className="font-semibold text-gray-900">Booking #{booking.booking_id}</h3>
                  <p className="text-gray-600 text-sm">Completed on {new Date(booking.return_date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentReview(prev => ({ 
                      ...prev, 
                      bookingId: booking.booking_id,
                      vehicleId: booking.vehicle_id 
                    }))
                    setShowReviewModal(true)
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <Star size={16} />
                  Write Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Reviews */}
      <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600">You haven't written any reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.review_id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < review.rating ? "text-orange-500 fill-orange-500" : "text-gray-300"}
                      />
                    ))}
                    <span className="ml-2 text-lg font-bold text-orange-600">{review.rating}.0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      review.is_approved 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.is_approved ? 'Approved' : 'Pending Approval'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    Vehicle: {review.manufacturer} {review.model} • Booking #{review.booking_id}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
                    onClick={() => setCurrentReview(prev => ({ ...prev, rating: star }))}
                    className="text-3xl mx-1 transition-transform hover:scale-110"
                  >
                    {star <= currentReview.rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              <textarea
                value={currentReview.comment}
                onChange={(e) => setCurrentReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this vehicle... How was the condition? Was it clean? How was the pickup/drop-off process?"
                className="w-full h-32 border border-gray-300 rounded-xl p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all flex items-center gap-2"
                >
                  <Star size={16} />
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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

    // For damage reports, booking_id is required
    if (supportForm.type === 'damage_report' && supportForm.booking_id === 0) {
      toast.error('Please select a booking for damage report')
      return
    }

    try {
      const payload = {
        subject: supportForm.subject,
        description: supportForm.description,
        type: supportForm.type,
        // Only include booking_id for damage reports
        ...(supportForm.type === 'damage_report' && { booking_id: supportForm.booking_id })
      }

      console.log("📤 Sending support ticket:", payload)

      // Use RTK Query instead of axios
      await createSupportTicket(payload).unwrap()

      toast.success('Support ticket submitted successfully!')
      
      // Reset form after successful submission
      setSupportForm({ 
        subject: '', 
        description: '', 
        type: activeSupportTab === 'damage' ? 'damage_report' : 
               activeSupportTab === 'general' ? 'general_inquiry' : 'technical_issue',
        booking_id: 0 
      })
    } catch (error: any) {
      console.log("🔴 RTK QUERY ERROR:", error)
      console.log("🔴 ERROR DATA:", error.data)
      
      // Show the actual error message from backend
      const errorMessage = error?.data?.error || 
                          error?.data?.message || 
                          error?.message || 
                          'Please try again'
      
      toast.error(`Failed to submit ticket: ${errorMessage}`)
    }
  }

  const completedBookings = bookings.filter(b => b.booking_status.toLowerCase() === 'completed')

  return (
    <div className="space-y-8">
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

      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
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

        <form onSubmit={handleSupportSubmit} className="mt-6 space-y-6">
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

          {/* Show booking selection for ALL ticket types but make it optional for non-damage reports */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Booking {activeSupportTab === 'damage' && '(Required)'}
            </label>
            <select
              value={supportForm.booking_id}
              onChange={(e) => setSupportForm(prev => ({ ...prev, booking_id: parseInt(e.target.value) }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required={activeSupportTab === 'damage'}
            >
              <option value={0}>
                {activeSupportTab === 'damage' 
                  ? 'Select a completed booking' 
                  : 'Select a booking (optional)'}
              </option>
              {completedBookings.map(booking => (
                <option key={booking.booking_id} value={booking.booking_id}>
                  Booking #{booking.booking_id} - Vehicle ID: {booking.vehicle_id}
                </option>
              ))}
            </select>
          </div>

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
          </div>

          {activeSupportTab === 'damage' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-red-600" size={20} />
                <h4 className="font-semibold text-red-800">Important Notice</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Please report damage within 24 hours of vehicle return</li>
                <li>• Include photos if possible (attach via email after submission)</li>
                <li>• Our team will contact you within 2 business hours</li>
                <li>• False damage reports may result in account suspension</li>
              </ul>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center gap-2"
            >
              <MessageSquare size={20} />
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <button
              type="button"
              onClick={() => setSupportForm({ 
                subject: '', 
                description: '', 
                type: activeSupportTab === 'damage' ? 'damage_report' : 
                       activeSupportTab === 'general' ? 'general_inquiry' : 'technical_issue',
                booking_id: 0 
              })}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Contact Information remains the same */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Phone className="text-purple-600" size={24} />
          </div>
          <div className="text-lg font-bold text-purple-600">+1 (555) 123-4567</div>
          <div className="text-gray-600 text-sm">24/7 Support Line</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Mail className="text-purple-600" size={24} />
          </div>
          <div className="text-lg font-bold text-purple-600">support@carrental.com</div>
          <div className="text-gray-600 text-sm">Email Support</div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Map className="text-purple-600" size={24} />
          </div>
          <div className="text-lg font-bold text-purple-600">Response Time</div>
          <div className="text-gray-600 text-sm">Within 2 hours</div>
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
  const { data: bookings, isLoading, error } = useGetMyBookingsQuery()
  const [cancelBooking, { isLoading: isCancelling }] = useCancelBookingMutation()
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'reviews' | 'support'>('bookings')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'active' | 'completed' | 'cancelled'>('all')
  const [showCancelModal, setShowCancelModal] = useState<number | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [damageReport, setDamageReport] = useState({ bookingId: 0, description: '' })
  const [review, setReview] = useState({ bookingId: 0, rating: 5, comment: '' })
  const [showDamageModal, setShowDamageModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const { token, user } = useSelector((state: RootState) => state.authSlice)
  const navigate = useNavigate()

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
      await stripePromise;
      const header = { 'Content-Type': 'application/json' };
      
      if (method === 'card') {
        const checkoutResponse = await axios.post(`${apiDomain}payments/create-intent`, JSON.stringify(booking), {
          headers: { ...header, Authorization: `${token}` },
        });

        const { session } = checkoutResponse.data;
        
        if (session?.url) {
          window.location.href = session.url;
        } else {
          toast.error('Invalid checkout response');
        }
      } else {
        // M-Pesa payment logic
        const mpesaResponse = await axios.post(`${apiDomain}payments/mpesa-payment`, {
          booking_id: booking.booking_id,
          amount: booking.total_amount,
        }, {
          headers: { ...header, Authorization: `${token}` },
        });

        if (mpesaResponse.data.success) {
          toast.success('M-Pesa payment initiated! Check your phone.');
        } else {
          toast.error('M-Pesa payment failed');
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed', {
        description: error?.response?.data?.message || 'Please try again later.',
      });
    }
  }

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

      await axios.post(`${apiDomain}reviews`, {
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

  useEffect(() => {
    console.log("🔍 UserDashboard - Bookings data:", bookings)
    console.log("🔍 UserDashboard - Token:", token)
    console.log("🔍 UserDashboard - Error:", error)
  }, [bookings, token, error])

  const bookingData: BookingData[] = Array.isArray(bookings?.booking)
    ? bookings.booking
    : bookings?.booking
    ? [bookings.booking]
    : [];

  const filteredBookings = bookingData.filter(b =>
    filter === 'all' || b.booking_status.toLowerCase() === filter
  );

  const completedBookings = bookingData.filter(b => b.booking_status.toLowerCase() === 'completed');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <Loader className="mx-auto text-blue-600 animate-spin" size={48} />
          <p className="mt-4 text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Navbar />
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
          <XCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
                    ) : (
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