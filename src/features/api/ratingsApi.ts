// Create a new ratingsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface Rating {
  rating_id: number
  booking_id: number
  user_id: number
  rating: number
  comment: string
  created_at: string
}

export const ratingsApi = createApi({
  reducerPath: 'ratingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api' }),
  tagTypes: ['Ratings'],
  endpoints: (builder) => ({
    submitRating: builder.mutation<Rating, { bookingId: number; rating: number; comment: string }>({
      query: (ratingData) => ({
        url: '/ratings',
        method: 'POST',
        body: ratingData,
      }),
      invalidatesTags: ['Ratings'],
    }),
    getBookingRating: builder.query<Rating, number>({
      query: (bookingId) => `/ratings/booking/${bookingId}`,
      providesTags: ['Ratings'],
    }),
  }),
})

export const { useSubmitRatingMutation, useGetBookingRatingQuery } = ratingsApi