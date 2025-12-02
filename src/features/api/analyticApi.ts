// features/api/analyticsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { apiDomain } from '../../apiDomain/apiDomain'

export interface OverviewStats {
  total_bookings: number
  total_revenue: number
  total_users: number
  total_vehicles: number
  active_bookings: number
  pending_bookings: number
  available_vehicles: number
  revenue_today: number
  bookings_today: number
}

export interface RevenueData {
  period: string
  revenue: number
  bookings: number
}

export interface TopVehicle {
  vehicle_id: number
  manufacturer: string
  model: string
  rental_count: number
  total_revenue: number
  avg_rating?: number
}

export interface BookingTrend {
  period: string
  bookings: number
  completed: number
  cancelled: number
}

export interface UserStats {
  total_users: number
  active_users: number
  new_users_today: number
  new_users_this_week: number
  user_growth: number
}

export interface LocationInsight {
  location: string
  booking_count: number
  revenue: number
  popular_vehicle_type: string
}

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: apiDomain,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('Authorization', `${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Dashboard', 'Analytics'],
  endpoints: (builder) => ({
    // Dashboard Overview Stats
    getOverviewStats: builder.query<OverviewStats, void>({
      query: () => 'analytics/overview',
      providesTags: ['Dashboard'],
    }),

    // Revenue Chart Data
    getRevenueChartData: builder.query<RevenueData[], { period?: string }>({
      query: ({ period = 'monthly' }) => `analytics/revenue?period=${period}`,
      providesTags: ['Analytics'],
    }),

    // Top Rented Vehicles
    getTopRentedVehicles: builder.query<TopVehicle[], { limit?: number }>({
      query: ({ limit = 5 }) => `analytics/top-vehicles?limit=${limit}`,
      providesTags: ['Analytics'],
    }),

    // Booking Trends
    getBookingTrends: builder.query<BookingTrend[], { period?: string }>({
      query: ({ period = 'monthly' }) => `analytics/booking-trends?period=${period}`,
      providesTags: ['Analytics'],
    }),

    // User Statistics
    getUserStats: builder.query<UserStats, void>({
      query: () => 'analytics/user-stats',
      providesTags: ['Dashboard'],
    }),

    // Location Insights
    getLocationInsights: builder.query<LocationInsight[], void>({
      query: () => 'analytics/location-insights',
      providesTags: ['Analytics'],
    }),
  }),
})

export const {
  useGetOverviewStatsQuery,
  useGetRevenueChartDataQuery,
  useGetTopRentedVehiclesQuery,
  useGetBookingTrendsQuery,
  useGetUserStatsQuery,
  useGetLocationInsightsQuery,
} = analyticsApi