// api/paymentApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface Payment {
  payment_id: number
  booking_id: number
  user_id: number
  user_name: string
  user_email: string
  amount: number
  payment_status: 'Pending' | 'Completed' | 'Failed' | 'Refunded'
  payment_method: string
  transaction_id?: string
  created_at: string
  updated_at: string
  booking_status?: string
  vehicle_model?: string
}

export interface PaymentFilters {
  payment_status?: 'Pending' | 'Completed' | 'Failed' | 'Refunded'
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
}

export interface RefundPaymentRequest {
  payment_id: number
  refund_reason?: string
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
  tagTypes: ['Payments', 'PaymentStats'],
  endpoints: (builder) => ({

    // GET ALL PAYMENTS (Admin only)
    getAllPayments: builder.query<{ success: boolean; data: Payment[] }, PaymentFilters>({
      query: (filters) => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString())
          }
        })
        return `/?${params.toString()}`
      },
      providesTags: ['Payments'],
    }),

    // GET PAYMENT BY BOOKING ID
    getPaymentByBookingId: builder.query<{ success: boolean; data: Payment }, number>({
      query: (booking_id) => `/booking/${booking_id}`,
      providesTags: ['Payments'],
    }),

    // GET PAYMENT STATISTICS (Admin only)
    getPaymentStats: builder.query<{ success: boolean; stats: PaymentStats }, void>({
      query: () => '/stats',
      providesTags: ['PaymentStats'],
    }),

    // REFUND PAYMENT (Admin only)
    refundPayment: builder.mutation<{ success: boolean; message: string; data: Payment }, RefundPaymentRequest>({
      query: ({ payment_id, refund_reason }) => ({
        url: '/refund',
        method: 'POST',
        body: { payment_id, refund_reason },
      }),
      invalidatesTags: ['Payments', 'PaymentStats'],
    }),

    // UPDATE PAYMENT STATUS (Admin only)
    updatePaymentStatus: builder.mutation<{ success: boolean; message: string; data: Payment }, {
      payment_id: number
      payment_status: 'Pending' | 'Completed' | 'Failed' | 'Refunded'
    }>({
      query: ({ payment_id, payment_status }) => ({
        url: `/${payment_id}/status`,
        method: 'PUT',
        body: { payment_status },
      }),
      invalidatesTags: ['Payments', 'PaymentStats'],
    }),

    // EXPORT PAYMENTS (Admin only)
    exportPayments: builder.mutation<Blob, PaymentFilters & { format: 'csv' | 'excel' }>({
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
  useGetAllPaymentsQuery,
  useGetPaymentByBookingIdQuery,
  useGetPaymentStatsQuery,
  useRefundPaymentMutation,
  useUpdatePaymentStatusMutation,
  useExportPaymentsMutation,
} = paymentApi