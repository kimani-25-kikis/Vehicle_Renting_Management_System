// components/admin/ReviewManagement.tsx
import React, { useState, useEffect } from 'react'
import { 
  Star, Search, Filter, CheckCircle, XCircle, 
  Eye, MessageSquare, User, Car, Calendar,
  MoreVertical, RefreshCw, TrendingUp, AlertTriangle,
  ThumbsUp, ThumbsDown, Shield, Download, Home, Globe,
  BarChart3, FilterX, Mail, Clock, Loader
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetAllReviewsQuery,
  useApproveReviewMutation,
  useRejectReviewMutation,
  useDeleteReviewMutation,
  useAddAdminResponseMutation,
  useFlagReviewMutation,
  useGetReviewCountsQuery,
  useMarkForHomepageMutation,
  useUnmarkFromHomepageMutation,
  type Review
} from '../../features/api/reviewApi'

interface ReviewWithDetails extends Review {
  vehicle_name: string
  user_name: string
  user_email: string
  is_flagged: boolean
  helpful_count: number
  show_on_homepage?: boolean
  created_at: string 
}

const ReviewManagement: React.FC = () => {
  // RTK Query hooks
  const { 
    data: reviewsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetAllReviewsQuery()
  
  const { data: countsData } = useGetReviewCountsQuery()
  const [approveReview] = useApproveReviewMutation()
  const [rejectReview] = useRejectReviewMutation()
  const [deleteReview] = useDeleteReviewMutation()
  const [addAdminResponse] = useAddAdminResponseMutation()
  const [flagReview] = useFlagReviewMutation()
  const [markForHomepage] = useMarkForHomepageMutation()
  const [unmarkFromHomepage] = useUnmarkFromHomepageMutation()

  // Local state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'flagged' | 'on_homepage'>('all')
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all')
  const [selectedReviews, setSelectedReviews] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)
  const [responseText, setResponseText] = useState('')
  const [rejectNotes, setRejectNotes] = useState('')
  const [rejectModalOpen, setRejectModalOpen] = useState<number | null>(null)
  const [homepageModalOpen, setHomepageModalOpen] = useState<number | null>(null)
  const [selectedForHomepage, setSelectedForHomepage] = useState<number[]>([])

  // Transform API data to match component interface
  // In ReviewManagement.tsx - Update the transform function
const reviews: ReviewWithDetails[] = React.useMemo(() => {
  if (!reviewsResponse?.reviews) return []
  
  return reviewsResponse.reviews.map(review => {
    const vehicleName = `${review.manufacturer || 'Unknown'} ${review.model || ''} ${review.year ? `(${review.year})` : ''}`.trim()
    const userName = `${review.first_name || ''} ${review.last_name || ''}`.trim() || 'Anonymous'
    const userEmail = review.email || ''
    const showOnHomepage = (review as any).show_on_homepage || false
    
    return {
      ...review,
      review_id: review.review_id,
      booking_id: review.booking_id,
      user_id: review.user_id,
      user_name: userName,
      user_email: userEmail,
      vehicle_id: review.vehicle_id,
      vehicle_name: vehicleName,
      rating: review.rating,
      comment: review.comment,
      is_approved: review.is_approved,
      is_flagged: !review.is_approved && !!review.admin_notes,
      show_on_homepage: showOnHomepage,
      created_at: review.created_at,
      admin_notes: review.admin_notes,
      helpful_count: 0,
    }
  })
}, [reviewsResponse])

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.booking_id?.toString().includes(searchTerm) ||
      review.review_id?.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'approved' && review.is_approved) ||
      (statusFilter === 'pending' && !review.is_approved && !review.admin_notes) ||
      (statusFilter === 'flagged' && !review.is_approved && !!review.admin_notes) ||
      (statusFilter === 'on_homepage' && review.show_on_homepage)
    
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter
    
    return matchesSearch && matchesStatus && matchesRating
  })

  // Handle approve review
  const handleApproveReview = async (reviewId: number) => {
    try {
      await approveReview(reviewId).unwrap()
      toast.success(`Review #${reviewId} approved successfully`)
      
      // Show option to post to homepage
      setHomepageModalOpen(reviewId)
    } catch (error: any) {
      toast.error('Failed to approve review', {
        description: error?.data?.error || 'Please try again'
      })
    } finally {
      setActionMenu(null)
    }
  }

  // Handle mark for homepage
  const handleMarkForHomepage = async (reviewId: number) => {
    try {
      await markForHomepage(reviewId).unwrap()
      toast.success(`Review #${reviewId} posted to homepage`)
      setHomepageModalOpen(null)
    } catch (error: any) {
      toast.error('Failed to post to homepage', {
        description: error?.data?.error || 'Please try again'
      })
    }
  }

  // Handle unmark from homepage
  const handleUnmarkFromHomepage = async (reviewId: number) => {
    try {
      await unmarkFromHomepage(reviewId).unwrap()
      toast.success(`Review #${reviewId} removed from homepage`)
    } catch (error: any) {
      toast.error('Failed to remove from homepage', {
        description: error?.data?.error || 'Please try again'
      })
    }
  }

  // Handle reject review
  const handleRejectReview = async (reviewId: number) => {
    if (!rejectNotes.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    try {
      await rejectReview({ 
        review_id: reviewId, 
        admin_notes: rejectNotes 
      }).unwrap()
      
      toast.success(`Review #${reviewId} rejected`)
      setRejectNotes('')
      setRejectModalOpen(null)
    } catch (error: any) {
      toast.error('Failed to reject review', {
        description: error?.data?.error || 'Please try again'
      })
    }
  }

  // Handle add response
  const handleAddResponse = async (reviewId: number) => {
    if (!responseText.trim()) {
      toast.error('Please enter a response')
      return
    }

    try {
      await addAdminResponse({ 
        review_id: reviewId, 
        admin_notes: responseText 
      }).unwrap()
      
      toast.success('Response added to review')
      setResponseText('')
      setActionMenu(null)
    } catch (error: any) {
      toast.error('Failed to add response', {
        description: error?.data?.error || 'Please try again'
      })
    }
  }

  // Handle delete review
  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview(reviewId).unwrap()
      toast.success(`Review #${reviewId} deleted`)
    } catch (error: any) {
      toast.error('Failed to delete review', {
        description: error?.data?.error || 'Please try again'
      })
    }
  }

  // Status helpers
  const getStatusColor = (review: ReviewWithDetails) => {
    if (review.show_on_homepage) return 'bg-purple-100 text-purple-800 border-purple-200'
    if (review.is_approved) return 'bg-green-100 text-green-800 border-green-200'
    if (review.admin_notes) return 'bg-red-100 text-red-800 border-red-200'
    return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }

  const getStatusText = (review: ReviewWithDetails) => {
    if (review.show_on_homepage) return 'On Homepage'
    if (review.is_approved) return 'Approved'
    if (review.admin_notes) return 'Rejected'
    return 'Pending'
  }

  const getStatusIcon = (review: ReviewWithDetails) => {
    if (review.show_on_homepage) return <Globe size={16} />
    if (review.is_approved) return <CheckCircle size={16} />
    if (review.admin_notes) return <AlertTriangle size={16} />
    return <Clock size={16} />
  }

  // Render stars
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

  // Format date
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate statistics
  const calculateStats = () => {
    if (!reviews.length) return null

    const totalReviews = reviews.length
    const approvedCount = reviews.filter(r => r.is_approved).length
    const pendingCount = reviews.filter(r => !r.is_approved && !r.admin_notes).length
    const flaggedCount = reviews.filter(r => !r.is_approved && !!r.admin_notes).length
    const homepageCount = reviews.filter(r => r.show_on_homepage).length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews

    return {
      totalReviews,
      approvedCount,
      pendingCount,
      flaggedCount,
      homepageCount,
      averageRating
    }
  }

  const stats = calculateStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-gray-600">Loading reviews...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Failed to load reviews</h3>
        <p className="text-gray-600 mb-4">Please check your connection and try again</p>
        <button 
          onClick={() => refetch()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={20} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Review Management
            </h1>
            <p className="text-gray-600 mt-1">Moderate, approve, and feature reviews on homepage</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Reviews</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.totalReviews || 0}</h3>
            </div>
            <MessageSquare size={32} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Approved</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.approvedCount || 0}</h3>
            </div>
            <CheckCircle size={32} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Pending</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.pendingCount || 0}</h3>
            </div>
            <Clock size={32} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">On Homepage</p>
              <h3 className="text-3xl font-bold mt-1">{stats?.homepageCount || 0}</h3>
            </div>
            <Home size={32} className="text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100">Avg Rating</p>
              <h3 className="text-3xl font-bold mt-1">
                {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              </h3>
            </div>
            <Star size={32} className="text-pink-200" />
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
                <option value="flagged">Rejected</option>
                <option value="on_homepage">On Homepage</option>
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
            {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setRatingFilter('all')
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <FilterX size={20} />
                Clear Filters
              </button>
            ) : null}
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
                        {review.show_on_homepage && (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                            <Home size={12} />
                            Featured
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-600">Booking #{review.booking_id} • {formatDateTime(review.created_at)}</p>
                    </div>
                    <div className="text-right">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* User and Vehicle Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold">
                        {review.user_name?.[0] || 'U'}
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

                  {/* Response Section - Only show for approved reviews without admin notes */}
                  {!review.admin_notes && !review.show_on_homepage && (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write admin notes or response..."
                        className="w-full h-20 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={() => handleAddResponse(review.review_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  {!review.is_approved && !review.admin_notes ? (
                    <>
                      <button 
                        onClick={() => handleApproveReview(review.review_id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button 
                        onClick={() => setRejectModalOpen(review.review_id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        <AlertTriangle size={16} />
                        Reject
                      </button>
                    </>
                  ) : review.is_approved ? (
                    <div className="flex flex-col gap-2">
                      {!review.show_on_homepage ? (
                        <button 
                          onClick={() => handleMarkForHomepage(review.review_id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <Home size={16} />
                          Post to Homepage
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleUnmarkFromHomepage(review.review_id)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <Home size={16} />
                          Remove from Homepage
                        </button>
                      )}
                      
                      {review.admin_notes && !review.is_approved && (
                        <button 
                          onClick={() => handleApproveReview(review.review_id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Approve Anyway
                        </button>
                      )}
                    </div>
                  ) : null}

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
                        {review.show_on_homepage ? (
                          <button 
                            onClick={() => handleUnmarkFromHomepage(review.review_id)}
                            className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-2 text-purple-700"
                          >
                            <Home size={16} />
                            Remove from Homepage
                          </button>
                        ) : review.is_approved ? (
                          <button 
                            onClick={() => handleMarkForHomepage(review.review_id)}
                            className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-center gap-2 text-purple-700"
                          >
                            <Home size={16} />
                            Post to Homepage
                          </button>
                        ) : null}
                        <button 
                          onClick={() => handleDeleteReview(review.review_id)}
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
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
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

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRejectModalOpen(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Reject Review?</h3>
              <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full h-32 border border-gray-300 rounded-xl p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setRejectModalOpen(null)}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectReview(rejectModalOpen)}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Homepage Modal */}
      {homepageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setHomepageModalOpen(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <Home className="mx-auto text-purple-500 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Post to Homepage?</h3>
              <p className="text-gray-600 mb-4">
                Do you want to feature this review on the homepage? This will make it visible to all visitors.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setHomepageModalOpen(null)}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
                >
                  Skip for Now
                </button>
                <button
                  onClick={() => handleMarkForHomepage(homepageModalOpen)}
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all flex items-center gap-2"
                >
                  <Home size={16} />
                  Yes, Post to Homepage
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                You can always feature this review later from the actions menu.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewManagement