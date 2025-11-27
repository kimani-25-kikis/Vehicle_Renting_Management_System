// RatingSection.tsx (or inside your file)
import { useState } from 'react'
import { useSubmitRatingMutation, useGetBookingRatingQuery } from '../features/api/ratingsApi'
import { Star } from 'lucide-react'

interface RatingSectionProps {
  bookingId: number
  bookingStatus: string  // ← Add this prop!
}

const RatingSection: React.FC<RatingSectionProps> = ({ bookingId, bookingStatus }) => {
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitRating, { isLoading }] = useSubmitRatingMutation()
  const { data: existingRating } = useGetBookingRatingQuery(bookingId)

  const handleSubmitRating = async () => {
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      await submitRating({
        bookingId,
        rating,
        comment
      }).unwrap()
      
      alert('Thank you for your rating!')
      setShowRatingModal(false)
      setRating(0)
      setComment('')
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert('Failed to submit rating. Please try again.')
    }
  }

  // If user already rated → show their rating
  if (existingRating) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
        <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
          <Star className="fill-yellow-400 text-yellow-400" size={20} />
          Your Rating
        </h4>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={22}
              className={i < existingRating.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
            />
          ))}
          <span className="ml-3 text-green-700 font-medium">{existingRating.rating}/5</span>
        </div>
        {existingRating.comment && (
          <p className="text-green-700 mt-3 italic">"{existingRating.comment}"</p>
        )}
      </div>
    )
  }

  // Show rating button only if booking is Completed and no rating exists
  const canRate = bookingStatus.toLowerCase() === 'completed'

  return (
    <>
      {canRate && !existingRating && (
        <button
          onClick={() => setShowRatingModal(true)}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Star size={24} className="fill-current" />
          Rate Your Experience
        </button>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-200">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              How was your experience?
            </h3>
            
            <div className="space-y-8">
              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transform transition-all hover:scale-125"
                  >
                    <Star
                      size={48}
                      className={`transition-all ${
                        star <= rating 
                          ? 'text-yellow-400 fill-current drop-shadow-lg' 
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">
                  {rating === 0 ? 'Tap a star' : `${rating} Star${rating > 1 ? 's' : ''}`}
                </p>
              </div>
              
              <textarea
                placeholder="Share more about your experience (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 h-32 resize-none focus:outline-none focus:border-yellow-400 transition-colors"
              />
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowRatingModal(false)
                    setRating(0)
                    setComment('')
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={isLoading || rating === 0}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold transition-all disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RatingSection