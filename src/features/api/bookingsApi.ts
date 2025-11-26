import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface BookingRequest {
  vehicle_id: number
  pickup_location: string
  return_location: string
  pickup_date: string
  return_date: string
  total_amount: number
  driver_license: {
    number: string
    expiryDate: string
    frontImage: File | null
    backImage: File | null
  }
  insurance_type: string
  additional_protection: boolean
  roadside_assistance: boolean
}

export interface BookingResponse {
  booking_id: number
  user_id: number
  vehicle_id: number
  pickup_location: string
  return_location: string
  booking_date: string
  return_date: string
  total_amount: number
  booking_status: string
  created_at: string
}

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Bookings'],
  endpoints: (builder) => ({
    createBooking: builder.mutation<BookingResponse, BookingRequest>({
      query: (bookingData) => ({
        url: '/bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Bookings'],
    }),
    getMyBookings: builder.query<BookingResponse[], void>({
      query: () => '/bookings/my-bookings',
      providesTags: ['Bookings'],
    }),
    getBookingById: builder.query<BookingResponse, number>({
      query: (id) => `/bookings/${id}`,
      providesTags: ['Bookings'],
    }),
  }),
})

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
} = bookingsApi