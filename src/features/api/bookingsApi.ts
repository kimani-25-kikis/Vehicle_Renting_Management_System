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
  driver_license_number: string
  driver_license_expiry: string
  driver_license_front_url: string
  driver_license_back_url: string
  insurance_type: string
  additional_protection: boolean
  roadside_assistance: boolean
  booking_status: string
}

// Updated BookingResponse with payment_status
export interface BookingResponse {
  success: boolean
  booking: {
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
    
    // User and vehicle details
    user_name?: string
    user_email?: string
    vehicle_manufacturer?: string
    vehicle_model?: string
    rental_rate?: number
    
    // Payment info
    payment_status?: 'Pending' | 'Completed' | 'Failed' | 'Refunded'
    payment_method?: string
    transaction_id?: string
  }
}

// Booking statistics interface
export interface BookingStats {
  total_bookings: number
  active_rentals: number
  pending_approvals: number
  total_revenue: number
  today_revenue: number
  completed_bookings: number
  cancelled_bookings: number
}

// Booking filters interface
export interface BookingFilters {
  status?: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled' | 'Rejected'
  payment_status?: 'Pending' | 'Completed' | 'Failed' | 'Refunded'
  date_from?: string
  date_to?: string
  search?: string
  user_id?: number
  vehicle_id?: number
}

// Booking status update interface
export interface UpdateBookingStatusRequest {
  booking_status: 'Pending' | 'Confirmed' | 'Active' | 'Completed' | 'Cancelled' |'Rejected'
  admin_notes?: string
}

// License verification interface
export interface VerifyLicenseRequest {
  verified: boolean
  admin_notes?: string
  download_license?: boolean 
}
export interface LicenseDownloadResponse {
  success: boolean
  front_url?: string
  back_url?: string
  front_filename?: string
  back_filename?: string
  error?: string
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
    baseUrl: 'http://localhost:3000/api/bookings',
    prepareHeaders: (headers) => {
      const token = getAuthToken()
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Bookings', 'BookingStats'],
  endpoints: (builder) => ({

    // CREATE BOOKING
    createBooking: builder.mutation<BookingResponse, BookingRequest>({
      query: (bookingData) => ({
        url: '',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Bookings', 'BookingStats'],
    }),

    // GET ALL BOOKINGS (Admin only - with optional filters)
    getAllBookings: builder.query<{ success: boolean; data: BookingResponse['booking'][] }, BookingFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
        return `?${params.toString()}`
      },
      providesTags: ['Bookings'],
    }),

    // GET LOGGED-IN USER BOOKINGS
    getMyBookings: builder.query<BookingResponse, void>({
      query: () => '/my-bookings',
      providesTags: ['Bookings'],
    }),

    // GET BOOKING BY ID
    getBookingById: builder.query<BookingResponse, number>({
      query: (id) => `/${id}`,
      providesTags: ['Bookings'],
    }),

    // UPDATE BOOKING STATUS (Admin only)
    updateBookingStatus: builder.mutation<BookingResponse, {
      booking_id: number
      data: UpdateBookingStatusRequest
    }>({
      query: ({ booking_id, data }) => ({
        url: `/${booking_id}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Bookings', 'BookingStats'],
    }),

    // VERIFY DRIVER LICENSE (Admin only)
                verifyDriverLicense: builder.mutation<BookingResponse & { license_download_info?: LicenseDownloadResponse }, {
              booking_id: number
              data: VerifyLicenseRequest
            }>({
              query: ({ booking_id, data }) => ({
                url: `/bookings/${booking_id}/verify-license`,
                method: 'PATCH',
                body: data,
              }),
              invalidatesTags: ['Bookings'],
            }),

    // CANCEL BOOKING
    cancelBooking: builder.mutation<{ message: string }, number>({
      query: (bookingId) => ({
        url: `/${bookingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bookings', 'BookingStats'],
    }),

    // EXTEND BOOKING
    extendBooking: builder.mutation<
      BookingResponse,
      { bookingId: number; newReturnDate: string; additionalAmount?: number }
    >({
      query: ({ bookingId, newReturnDate, additionalAmount }) => ({
        url: `/${bookingId}/extend`,
        method: 'PUT',
        body: { new_return_date: newReturnDate, additional_amount: additionalAmount || 0 },
      }),
      invalidatesTags: ['Bookings'],
    }),

    // CONFIRM BOOKING PAYMENT
    confirmBookingPayment: builder.mutation<BookingResponse, {
      booking_id: number
      payment_intent_id: string
    }>({
      query: ({ booking_id, payment_intent_id }) => ({
        url: `/${booking_id}/confirm-payment`,
        method: 'POST',
        body: { payment_intent_id },
      }),
      invalidatesTags: ['Bookings', 'BookingStats'],
    }),

    // REFUND BOOKING PAYMENT (Admin only)
    refundBookingPayment: builder.mutation<BookingResponse, {
      booking_id: number
      refund_reason: string
    }>({
      query: ({ booking_id, refund_reason }) => ({
        url: `/${booking_id}/refund`,
        method: 'POST',
        body: { refund_reason },
      }),
      invalidatesTags: ['Bookings', 'BookingStats'],
    }),

    // GET BOOKING STATISTICS (Admin only)
    getBookingStats: builder.query<{ success: boolean; stats: BookingStats }, void>({
      query: () => '/stats',
      providesTags: ['BookingStats'],
    }),

    // EXPORT BOOKINGS (Admin only)
    exportBookings: builder.mutation<Blob, BookingFilters & { format: 'csv' | 'excel' }>({
      query: (params) => ({
        url: '/export',
        method: 'GET',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),

  }),
})

export const {
  useCreateBookingMutation,
  useGetAllBookingsQuery,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
  useVerifyDriverLicenseMutation,
  useCancelBookingMutation,
  useExtendBookingMutation,
  useConfirmBookingPaymentMutation,
  useRefundBookingPaymentMutation,
  useGetBookingStatsQuery,
  useExportBookingsMutation,
} = bookingsApi