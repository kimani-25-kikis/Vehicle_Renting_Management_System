// api/paymentApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded'

export interface Payment {
  payment_id: number
  booking_id: number
  user_id: number
  user_name?: string
  user_email?: string
  amount: number
  payment_status: PaymentStatus  
  payment_method: string
  transaction_id?: string
  created_at: string
  updated_at: string
  booking_status?: string
  vehicle_model?: string
  
}

export interface UserPayment extends Payment {
  pickup_date: string
  return_date: string
  manufacturer: string
  model: string
  year: string
  booking_total: number
}

export interface PaymentFilters {
  payment_status?: "Pending" | "Completed" | "Confirmed" | "Active" | "Cancelled" | "Rejected"
  payment_method?: string
  date_from?: string
  date_to?: string
  search?: string
  user_id?: number
  booking_id?: number
}

export interface PaymentStats {
  total_revenue: number
  completed_payments: number
  pending_payments: number
  failed_payments: number
  refunded_amount: number
  today_revenue: number
  monthly_revenue: number
  total_payments:number
  refunded_payments:number
}

export interface RefundPaymentRequest {
  payment_id: number
  refund_reason?: string
}

export interface BookingPaymentResponse {
  success: boolean
  data: {
    payment: Payment
    booking: {
      booking_id: number
      booking_status: string
      verified_by_admin: boolean
      driver_license_front_url: string | null
      driver_license_back_url: string | null
    }
  }
}

export interface VerifyPaymentRequest {
  payment_id: number
  verified: boolean
  admin_notes?: string
}

// Helper function to get token
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

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
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
  tagTypes: ['Payments', 'PaymentStats', 'BookingPayment', 'MyPayments', 'SpendingStats'],
  endpoints: (builder) => ({

    

    // GET PAYMENT BY BOOKING ID (NEW)
    getPaymentByBookingId: builder.query<BookingPaymentResponse, number>({
      query: (booking_id) => `/payments/booking/${booking_id}`,
      providesTags: ['BookingPayment'],
    }),

    getMyPayments: builder.query<{ success: boolean; data: UserPayment[] }, void>({
  query: () => '/payments/my-payments',
  providesTags: ['MyPayments'],
}),

// Get user's spending statistics
getMySpendingStats: builder.query<{ success: boolean; stats: any }, void>({
  query: () => '/payments/my-spending-stats',
  providesTags: ['SpendingStats'],
}),

    // VERIFY PAYMENT (NEW - Admin only)
    verifyPayment: builder.mutation<{ success: boolean; message: string; data: Payment }, VerifyPaymentRequest>({
      query: ({ payment_id, verified, admin_notes }) => ({
        url: `/payments/${payment_id}/verify`,
        method: 'POST',
        body: { verified, admin_notes },
      }),
      invalidatesTags: ['Payments', 'BookingPayment'],
    }),

    // GET ALL PAYMENTS (Admin only)
    getAllPayments: builder.query<{ success: boolean; data: Payment[] }, PaymentFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
        return `/payments?${params.toString()}`
      },
      providesTags: ['Payments'],
    }),

    // GET PAYMENT STATISTICS (Admin only)
    getPaymentStats: builder.query<{ success: boolean; stats: PaymentStats }, void>({
      query: () => '/payments/stats',
      providesTags: ['PaymentStats'],
    }),

    // REFUND PAYMENT (Admin only)
    refundPayment: builder.mutation<{ success: boolean; message: string; data: Payment }, RefundPaymentRequest>({
      query: ({ payment_id, refund_reason }) => ({
        url: '/payments/refund',
        method: 'POST',
        body: { payment_id, refund_reason },
      }),
      invalidatesTags: ['Payments', 'PaymentStats', 'BookingPayment'],
    }),

    // UPDATE PAYMENT STATUS (Admin only)
    updatePaymentStatus: builder.mutation<{ success: boolean; message: string; data: Payment }, {
      payment_id: number
      payment_status: 'Pending' | 'Completed' | 'Failed' | 'Refunded'
    }>({
      query: ({ payment_id, payment_status }) => ({
        url: `/payments/${payment_id}/status`,
        method: 'PUT',
        body: { payment_status },
      }),
      invalidatesTags: ['Payments', 'PaymentStats', 'BookingPayment'],
    }),

    // EXPORT PAYMENTS (Admin only)
    exportPayments: builder.mutation<Blob, PaymentFilters & { format: 'csv' | 'excel' }>({
      query: (params) => ({
        url: '/payments/export',
        method: 'GET',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // GET PAYMENT FOR SPECIFIC BOOKING (NEW - for workflow)
    getBookingPaymentDetails: builder.query<BookingPaymentResponse, number>({
      query: (booking_id) => `/payments/booking/${booking_id}/details`,
      providesTags: ['BookingPayment'],
    }),

  }),

  
})

export const {
  useGetPaymentByBookingIdQuery,
  useVerifyPaymentMutation,
  useGetAllPaymentsQuery,
  useGetPaymentStatsQuery,
  useRefundPaymentMutation,
  useUpdatePaymentStatusMutation,
  useExportPaymentsMutation,
  useGetBookingPaymentDetailsQuery,
  useGetMyPaymentsQuery, 
  useGetMySpendingStatsQuery
} = paymentApi