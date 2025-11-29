// components/admin/ReviewManagement.tsx
import React, { useState, useEffect } from 'react'
import { 
  Star, Search, Filter, CheckCircle, XCircle, 
  Eye, MessageSquare, User, Car, Calendar,
  MoreVertical, RefreshCw, TrendingUp, AlertTriangle,
  ThumbsUp, ThumbsDown, Shield, Download,
  BarChart3, FilterX, Mail
} from 'lucide-react'
import { toast } from 'sonner'

interface Review {
  review_id: number
  booking_id: number
  user_id: number
  user_name: string
  user_email: string
  vehicle_id: number
  vehicle_name: string
  rating: number
  comment: string
  is_approved: boolean
  is_flagged: boolean
  created_at: string
  admin_notes?: string
  response?: string
  helpful_count: number
}

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'flagged'>('all')
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all')
  const [selectedReviews, setSelectedReviews] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)
  const [responseText, setResponseText] = useState('')

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockReviews: Review[] = [
      {
        review_id: 1,
        booking_id: 1,
        user_id: 1,
        user_name: 'John Doe',
        user_email: 'john.doe@example.com',
        vehicle_id: 1,
        vehicle_name: 'Toyota Camry 2023',
        rating: 5,
        comment: 'Excellent service! The car was clean, fuel full, and the pickup process was smooth. Will definitely rent again.',
        is_approved: true,
        is_flagged: false,
        created_at: '2024-03-20T14:30:00',
        helpful_count: 12
      },
      {
        review_id: 2,
        booking_id: 2,
        user_id: 2,
        user_name: 'Sarah Wilson',
        user_email: 'sarah.wilson@example.com',
        vehicle_id: 2,
        vehicle_name: 'Mercedes E-Class 2024',
        rating: 4,
        comment: 'Great vehicle and good service. The car had a small scratch that wasn\'t mentioned, but otherwise perfect.',
        is_approved: true,
        is_flagged: false,
        created_at: '2024-03-18T10:15:00',
        helpful_count: 8
      },
      {
        review_id: 3,
        booking_id: 3,
        user_id: 3,
        user_name: 'Mike Johnson',
        user_email: 'mike.johnson@example.com',
        vehicle_id: 3,
        vehicle_name: 'Land Rover Range Rover',
        rating: 1,
        comment: 'Terrible experience! Car was dirty and had mechanical issues. Staff was unhelpful. Never renting from here again!!!',
        is_approved: false,
        is_flagged: true,
        created_at: '2024-03-21T09:45:00',
        admin_notes: 'Customer reported issues - needs investigation',
        helpful_count: 2
      },
      {
        review_id: 4,
        booking_id: 4,
        user_id: 4,
        user_name: 'Emily Davis',
        user_email: 'emily.davis@example.com',
        vehicle_id: 1,
        vehicle_name: 'Toyota Camry 2023',
        rating: 5,
        comment: 'Perfect rental experience from start to finish. The online booking was easy, and the vehicle exceeded expectations.',
        is_approved: false,
        is_flagged: false,
        created_at: '2024-03-22T16:20:00',
        helpful_count: 5
      },
      {
        review_id: 5,
        booking_id: 5,
        user_id: 5,
        user_name: 'David Brown',
        user_email: 'david.brown@example.com',
        vehicle_id: 2,
        vehicle_name: 'Mercedes E-Class 2024',
        rating: 3,
        comment: 'Average experience. Car was okay but pickup took longer than expected. Could improve the waiting process.',
        is_approved: false,
        is_flagged: false,
        created_at: '2024-03-19T11:30:00',
        helpful_count: 3
      }
    ]
    setReviews(mockReviews)
    setLoading(false)
  }, [])

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.booking_id.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'approved' && review.is_approved) ||
      (statusFilter === 'pending' && !review.is_approved && !review.is_flagged) ||
      (statusFilter === 'flagged' && review.is_flagged)
    
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter
    
    return matchesSearch && matchesStatus && matchesRating
  })

  const handleApproveReview = (reviewId: number) => {
    toast.success(`Review #${reviewId} approved`)
    setReviews(prev => prev.map(review => 
      review.review_id === reviewId ? { ...review, is_approved: true, is_flagged: false } : review
    ))
    setActionMenu(null)
  }

  const handleRejectReview = (reviewId: number) => {
    toast.success(`Review #${reviewId} rejected`)
    setReviews(prev => prev.filter(review => review.review_id !== reviewId))
    setActionMenu(null)
  }

  const handleFlagReview = (reviewId: number) => {
    toast.success(`Review #${reviewId} flagged for review`)
    setReviews(prev => prev.map(review => 
      review.review_id === reviewId ? { ...review, is_flagged: true, is_approved: false } : review
    ))
    setActionMenu(null)
  }

  const handleAddResponse = (reviewId: number) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response')
      return
    }

    toast.success('Response added to review')
    setReviews(prev => prev.map(review => 
      review.review_id === reviewId ? { ...review, response: responseText } : review
    ))
    setResponseText('')
    setActionMenu(null)
  }

  const getStatusColor = (review: Review) => {
    if (review.is_approved) return 'bg-green-100 text-green-800 border-green-200'
    if (review.is_flagged) return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  const getStatusText = (review: Review) => {
    if (review.is_approved) return 'Approved'
    if (review.is_flagged) return 'Flagged'
    return 'Pending'
  }

  const getStatusIcon = (review: Review) => {
    if (review.is_approved) return <CheckCircle size={16} />
    if (review.is_flagged) return <AlertTriangle size={16} />
    return <Clock size={16} />
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "text-orange-500 fill-orange-500" : "text-gray-300"}
          />
        ))}
        <span className="ml-1 text-sm font-semibold text-gray-700">{rating}.0</span>
      </div>
    )
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
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
              Review Management
            </h1>
            <p className="text-gray-600 mt-1">Moderate and manage customer reviews</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              <BarChart3 size={20} />
              Analytics
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
              <p className="text-blue-100">Total Reviews</p>
              <h3 className="text-3xl font-bold mt-1">{reviews.length}</h3>
            </div>
            <MessageSquare size={32} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Approved</p>
              <h3 className="text-3xl font-bold mt-1">
                {reviews.filter(r => r.is_approved).length}
              </h3>
            </div>
            <CheckCircle size={32} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Pending</p>
              <h3 className="text-3xl font-bold mt-1">
                {reviews.filter(r => !r.is_approved && !r.is_flagged).length}
              </h3>
            </div>
            <Clock size={32} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Average Rating</p>
              <h3 className="text-3xl font-bold mt-1">
                {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)}
              </h3>
            </div>
            <Star size={32} className="text-purple-200" />
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
                placeholder="Search reviews by user, vehicle, or content..."
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
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
              </select>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
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

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div key={review.review_id} className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        Review #{review.review_id}
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(review)}`}>
                          {getStatusIcon(review)}
                          {getStatusText(review)}
                        </span>
                      </h3>
                      <p className="text-gray-600">Booking #{review.booking_id} • {formatDateTime(review.created_at)}</p>
                    </div>
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <ThumbsUp size={14} />
                        {review.helpful_count} found helpful
                      </div>
                    </div>
                  </div>

                  {/* User and Vehicle Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold">
                        {review.user_name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{review.user_name}</div>
                        <div className="text-gray-600 text-sm">{review.user_email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Car className="text-green-600" size={20} />
                      <div>
                        <div className="font-semibold text-gray-900">{review.vehicle_name}</div>
                        <div className="text-gray-600 text-sm">Vehicle #{review.vehicle_id}</div>
                      </div>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>

                  {/* Admin Notes */}
                  {review.admin_notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-600" />
                        <span className="font-semibold text-yellow-800">Admin Notes:</span>
                        <span className="text-yellow-700">{review.admin_notes}</span>
                      </div>
                    </div>
                  )}

                  {/* Response Section */}
                  {review.response ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={16} className="text-blue-600" />
                        <span className="font-semibold text-blue-800">Admin Response</span>
                      </div>
                      <p className="text-blue-700">{review.response}</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write a response to this review..."
                        className="w-full h-20 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={() => handleAddResponse(review.review_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                        >
                          Post Response
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  {!review.is_approved && !review.is_flagged && (
                    <>
                      <button 
                        onClick={() => handleApproveReview(review.review_id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button 
                        onClick={() => handleFlagReview(review.review_id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <AlertTriangle size={16} />
                        Flag
                      </button>
                    </>
                  )}

                  {review.is_flagged && (
                    <button 
                      onClick={() => handleApproveReview(review.review_id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Approve Anyway
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setActionMenu(actionMenu === review.review_id ? null : review.review_id)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <MoreVertical size={16} />
                      More Actions
                    </button>
                    
                    {actionMenu === review.review_id && (
                      <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 min-w-[200px]">
                        <button className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-t-xl">
                          <Eye size={16} />
                          View Details
                        </button>
                        <button className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
                          <Mail size={16} />
                          Contact User
                        </button>
                        <button 
                          onClick={() => handleRejectReview(review.review_id)}
                          className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600 rounded-b-xl"
                        >
                          <XCircle size={16} />
                          Delete Review
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

      {filteredReviews.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-blue-100">
          <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No reviews found</p>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Rating Distribution */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = reviews.filter(r => r.rating === rating).length
            const percentage = (count / reviews.length) * 100
            return (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-20">
                  {renderStars(rating)}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-right text-sm text-gray-600">
                  {count} ({percentage.toFixed(0)}%)
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div className="text-gray-600">
            Showing 1-{filteredReviews.length} of {reviews.length} reviews
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

// Add missing Clock icon import
const Clock = ({ size, className }: { size: number; className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

export default ReviewManagement