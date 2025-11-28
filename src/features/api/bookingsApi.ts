import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface BookingRequest {
  user_id: number
  vehicle_id: number
  pickup_location: string
  return_location: string
  pickup_date: string
  return_date: string
  booking_date: string
  total_amount: number

  // Driver License
  driver_license_number: string
  driver_license_expiry: string
  driver_license_front_url: string
  driver_license_back_url: string

  // Insurance
  insurance_type: string
  additional_protection: boolean
  roadside_assistance: boolean

  // Status
  booking_status: string
}

export interface BookingResponse {
  success: boolean
  booking :{
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
  }
  

export interface BookingWithDetails extends BookingResponse {
  user_name: string
  user_email: string
  vehicle_manufacturer: string
  vehicle_model: string
  rental_rate: number
}

// Helper function to get token from Redux persist storage
const getAuthToken = (): string | null => {
  try {
    const persistAuth = localStorage.getItem('persist:auth')
    if (!persistAuth) return null

    const authState = JSON.parse(persistAuth)
    const tokenWithBearer = authState.token
    if (!tokenWithBearer) return null

    return tokenWithBearer.replace(/^"Bearer /, '').replace(/"$/, '')
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api',
    prepareHeaders: (headers) => {
      const token = getAuthToken()
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Bookings'],
  endpoints: (builder) => ({

    // CREATE BOOKING
    createBooking: builder.mutation<BookingResponse, BookingRequest>({
      query: (bookingData) => ({
        url: '/bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Bookings'],
    }),

    // GET LOGGED-IN USER BOOKINGS
    getMyBookings: builder.query<BookingResponse, void>({
      query: () => '/bookings/my-bookings',
      providesTags: ['Bookings'],
    }),

    // GET BOOKING BY ID
    getBookingById: builder.query<BookingResponse, number>({
      query: (id) => `/bookings/${id}`,
      providesTags: ['Bookings'],
    }),

    // CANCEL BOOKING
    cancelBooking: builder.mutation<{ message: string }, number>({
      query: (bookingId) => ({
        url: `/bookings/${bookingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bookings'],
    }),

    // EXTEND BOOKING
    extendBooking: builder.mutation<
      BookingResponse,
      { bookingId: number; newReturnDate: string }
    >({
      query: ({ bookingId, newReturnDate }) => ({
        url: `/bookings/${bookingId}/extend`,
        method: 'PUT',
        body: { new_return_date: newReturnDate },
      }),
      invalidatesTags: ['Bookings'],
    }),

  }),
})

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useCancelBookingMutation,
  useExtendBookingMutation,   // ✅ Export extendBooking
} = bookingsApi
