
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '../../store/store';

export interface Review {
    review_id: number;
    user_id: number;
    vehicle_id: number;
    booking_id: number;
    rating: number;
    comment: string;
    is_approved: boolean;
    admin_notes?: string;
    created_at: string;
    updated_at: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    manufacturer?: string;
    model?: string;
    year?: number;
    vehicle_type?: string;
    show_on_homepage?: boolean;
    vehicle_name?: string;
    user_name?: string;
}
interface ReviewResponse {
  reviews: Review[]
}

// interface HomepageReview {
//   review_id: number
//   user_id: number
//   first_name: string
//   last_name: string
//   rating: number
//   comment: string
//   manufacturer?: string
//   model?: string
//   vehicle_name?: string
//   created_at: string
// }

interface ReviewStats {
  totalReviews: number
  approvedCount: number
  pendingCount: number
  averageRating: number
  ratingDistribution: {
    rating: number
    count: number
    percentage: number
  }[]
}

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
        const token = (getState() as RootState).authSlice.token;
        if (token) {
          headers.set('Authorization', `${token}`);
        }
        headers.set('Content-Type', 'application/json');
        return headers;
      }
  }),
  tagTypes: ['Reviews', 'ReviewStats'],
  endpoints: (builder) => ({
   
    // Get homepage reviews (public - no auth)
    getHomepageReviews: builder.query<ReviewResponse, void>({
      query: () => 'reviews/homepage',
     
    }),

    // Get approved reviews for homepage (public - no auth)
    getApprovedReviews: builder.query<ReviewResponse, void>({
      query: () => 'reviews/approved',
    }),

    // ================== ADMIN ENDPOINTS (Auth Required) ==================
    
    // Get all reviews for admin
    getAllReviews: builder.query<ReviewResponse, void>({
      query: () => 'reviews/admin/all',
      providesTags: ['Reviews'],
    }),

    // Get review by ID (admin)
    getReviewById: builder.query<Review, number>({
      query: (review_id) => `reviews/admin/${review_id}`,
      providesTags: (_result, _error, review_id) => [{ type: 'Reviews', id: review_id }],
    }),

    // Approve review
    approveReview: builder.mutation<{ message: string; review: Review }, number>({
      query: (review_id) => ({
        url: `reviews/admin/approve/${review_id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Reviews', 'ReviewStats'],
    }),

    // Reject review
    rejectReview: builder.mutation<{ message: string; review: Review }, { review_id: number; admin_notes: string }>({
      query: ({ review_id, admin_notes }) => ({
        url: `reviews/admin/reject/${review_id}`,
        method: 'PATCH',
        body: { admin_notes },
      }),
      invalidatesTags: ['Reviews', 'ReviewStats'],
    }),

    // Add admin response (admin_notes)
    addAdminResponse: builder.mutation<Review, { review_id: number; admin_notes: string }>({
      query: ({ review_id, admin_notes }) => ({
        url: `reviews/admin/notes/${review_id}`,
        method: 'PUT',
        body: { admin_notes },
      }),
      invalidatesTags: ['Reviews'],
    }),

    // Flag review (mark as inappropriate)
    flagReview: builder.mutation<Review, { review_id: number; admin_notes: string }>({
      query: ({ review_id, admin_notes }) => ({
        url: `reviews/admin/flag/${review_id}`,
        method: 'PATCH',
        body: { admin_notes },
      }),
      invalidatesTags: ['Reviews', 'ReviewStats'],
    }),

    // Get review statistics
    getReviewStats: builder.query<ReviewStats, void>({
      query: () => 'reviews/admin/stats',
      providesTags: ['ReviewStats'],
    }),

    // Search reviews
    searchReviews: builder.query<ReviewResponse, { 
      search?: string; 
      status?: 'all' | 'approved' | 'pending' | 'flagged';
      rating?: number;
      dateFrom?: string;
      dateTo?: string;
    }>({
      query: (params) => ({
        url: 'reviews/admin/search',
        method: 'GET',
        params,
      }),
      providesTags: ['Reviews'],
    }),

    // Delete review
    deleteReview: builder.mutation<{ message: string }, number>({
      query: (review_id) => ({
        url: `reviews/admin/${review_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews', 'ReviewStats'],
    }),
    // Mark for homepage
markForHomepage: builder.mutation<{ message: string; review: Review }, number>({
  query: (review_id) => ({
    url: `reviews/admin/homepage/mark/${review_id}`,
    method: 'PATCH',
  }),
  invalidatesTags: ['Reviews'],
}),

// Unmark from homepage
unmarkFromHomepage: builder.mutation<{ message: string; review: Review }, number>({
  query: (review_id) => ({
    url: `reviews/admin/homepage/unmark/${review_id}`,
    method: 'PATCH',
  }),
  invalidatesTags: ['Reviews'],
}),

getMyReviews: builder.query<ReviewResponse, void>({
  query: () => 'reviews/my-reviews',
  providesTags: ['Reviews'],
}),

// Submit a new review
submitReview: builder.mutation<Review, {
  booking_id: number;
  vehicle_id: number;
  rating: number;
  comment: string;
}>({
  query: (reviewData) => ({
    url: 'reviews',
    method: 'POST',
    body: reviewData,
  }),
  invalidatesTags: ['Reviews'],
}),

getVehicleReviews: builder.query<ReviewResponse, number>({
  query: (vehicle_id) => `reviews/vehicle/${vehicle_id}`,
}),

// Check if user can review a booking
canReviewBooking: builder.query<{ canReview: boolean; message?: string }, number>({
  query: (booking_id) => `reviews/can-review/${booking_id}`,
}),

    // Get review counts by status
    getReviewCounts: builder.query<{
      total: number
      approved: number
      pending: number
      flagged: number
    }, void>({
      query: () => 'reviews/admin-counts',
      providesTags: ['ReviewStats'],
    }),
  }),
})

export const {

  useGetMyReviewsQuery,
  useSubmitReviewMutation,
  useCanReviewBookingQuery,
  useGetVehicleReviewsQuery,

  useGetAllReviewsQuery,
  useGetReviewByIdQuery,
  useGetHomepageReviewsQuery,
  useGetApprovedReviewsQuery, 
  useApproveReviewMutation,
  useRejectReviewMutation,
  useAddAdminResponseMutation,
  useFlagReviewMutation,
  useGetReviewStatsQuery,
  useSearchReviewsQuery,
  useDeleteReviewMutation,
  useGetReviewCountsQuery,
  useMarkForHomepageMutation,
  useUnmarkFromHomepageMutation
} = reviewApi