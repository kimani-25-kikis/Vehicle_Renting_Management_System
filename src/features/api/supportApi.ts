import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface SupportTicketRequest {
  subject: string
  description: string
  type: 'damage_report' | 'general_inquiry' | 'technical_issue' | 'billing' | 'complaint' | 'feedback'
  priority?: 'urgent' | 'high' | 'medium' | 'low'
  booking_id?: number
}

export interface SupportTicketResponse {
  ticket_id: number
  user_id: number
  user_name: string
  user_email: string
  user_phone?: string
  subject: string
  description: string
  type: 'damage_report' | 'general_inquiry' | 'technical_issue' | 'billing' | 'complaint' | 'feedback'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'On Hold'
  assigned_to?: string
  assigned_at?: string
  booking_id: number | null
  vehicle_name?: string
  admin_notes: string | null
  last_response?: string
  last_response_at?: string
  last_response_by?: number
  response_count: number
  attachments?: string[]
  created_at: string
  updated_at: string
  resolved_at?: string
  closed_at?: string
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

export interface UpdateTicketStatusRequest {
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'On Hold'
  admin_notes?: string
}

export interface AssignTicketRequest {
  assigned_to: string
}

export interface AddReplyRequest {
  message: string
  is_admin_reply: boolean
}

export interface UploadAttachmentResponse {
  success: boolean
  url: string
  filename: string
  file_type: string
  file_size: number
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

    // ADMIN: GET ALL TICKETS WITH FILTERS
    getAllTickets: builder.query<SupportTicketsResponse, {
      status?: string;
      priority?: string;
      type?: string;
      search?: string;
    }>({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        return `/tickets/admin/all?${queryParams.toString()}`;
      },
      providesTags: ['SupportTicket'],
    }),

    // ADMIN: UPDATE TICKET STATUS
    updateTicketStatus: builder.mutation<
      { success: boolean; ticket: SupportTicketResponse },
      { ticketId: number; data: UpdateTicketStatusRequest }
    >({
      query: ({ ticketId, data }) => ({
        url: `/tickets/admin/status/${ticketId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    // ADMIN: ADD ADMIN NOTES
    addAdminNotes: builder.mutation<
      { success: boolean; ticket: SupportTicketResponse },
      { ticketId: number;data: {admin_notes: string }}
    >({
      query: ({ ticketId, data }) => ({
        url: `/tickets/admin/notes/${ticketId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    // ADMIN: ASSIGN TICKET
    assignTicket: builder.mutation<
      { success: boolean; ticket: SupportTicketResponse },
      { ticketId: number; data: AssignTicketRequest }
    >({
      query: ({ ticketId, data }) => ({
        url: `/tickets/admin/assign/${ticketId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    // ADD REPLY TO TICKET
    addTicketReply: builder.mutation<
      { success: boolean; ticket: SupportTicketResponse },
      { ticketId: number; data: AddReplyRequest }
    >({
      query: ({ ticketId, data }) => ({
        url: `/tickets/${ticketId}/reply`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    // UPLOAD ATTACHMENT
    uploadAttachment: builder.mutation<
      UploadAttachmentResponse,
      { ticketId: number; formData: FormData }
    >({
      query: ({ ticketId, formData }) => ({
        url: `/tickets/${ticketId}/attachment`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['SupportTicket'],
    }),

    // GET TICKET STATISTICS
    getTicketStats: builder.query<{
      success: boolean;
      stats: {
        total_tickets: number;
        open_tickets: number;
        in_progress_tickets: number;
        resolved_tickets: number;
        urgent_tickets: number;
        avg_response_time: number;
        by_type: Record<string, number>;
        by_priority: Record<string, number>;
      }
    }, void>({
      query: () => '/tickets/admin/stats',
      providesTags: ['SupportTicket'],
    }),

    // Add this endpoint to your supportApi.ts
updateTicketPriority: builder.mutation<
  { success: boolean; ticket: SupportTicketResponse },
  { ticketId: number; data: { priority: string } }
>({
  query: ({ ticketId, data }) => ({
    url: `/tickets/admin/priority/${ticketId}`,
    method: 'PATCH',
    body: data,
  }),
  invalidatesTags: ['SupportTicket'],
}),

  }),
})

export const {
  useCreateSupportTicketMutation,
  useGetMyTicketsQuery,
  useGetTicketByIdQuery,
  useGetAllTicketsQuery,
  useUpdateTicketStatusMutation,
  useAddAdminNotesMutation,
  useAssignTicketMutation,
  useAddTicketReplyMutation,
  useUploadAttachmentMutation,
  useGetTicketStatsQuery,
  useUpdateTicketPriorityMutation,
} = supportApi