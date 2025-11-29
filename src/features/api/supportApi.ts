import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface SupportTicketRequest {
  subject: string
  description: string
  type: 'damage_report' | 'general_inquiry' | 'technical_issue'
  booking_id?: number
}

export interface SupportTicketResponse {
  ticket_id: number
  user_id: number
  subject: string
  description: string
  type: 'damage_report' | 'general_inquiry' | 'technical_issue'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  booking_id: number | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface SupportTicketsResponse {
  success: boolean
  tickets: SupportTicketResponse[]
}

export interface CreateTicketResponse {
  success: boolean
  message: string
  ticket: SupportTicketResponse
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

export const supportApi = createApi({
  reducerPath: 'supportApi',
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
  tagTypes: ['SupportTicket'],
  endpoints: (builder) => ({

    // CREATE SUPPORT TICKET
    createSupportTicket: builder.mutation<CreateTicketResponse, SupportTicketRequest>({
      query: (ticketData) => ({
        url: '/tickets',
        method: 'POST',
        body: ticketData,
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    // GET USER'S TICKETS
    getMyTickets: builder.query<SupportTicketsResponse, void>({
      query: () => '/tickets/my-tickets',
      providesTags: ['SupportTicket'],
    }),

    // GET TICKET BY ID
    getTicketById: builder.query<{ success: boolean; ticket: SupportTicketResponse }, number>({
      query: (ticketId) => `/tickets/${ticketId}`,
      providesTags: ['SupportTicket'],
    }),

  }),
})

export const {
  useCreateSupportTicketMutation,
  useGetMyTicketsQuery,
  useGetTicketByIdQuery,
} = supportApi