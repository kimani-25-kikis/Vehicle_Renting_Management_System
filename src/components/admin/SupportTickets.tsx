// components/admin/SupportTickets.tsx
import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, Search, Filter, Eye, Edit, 
  CheckCircle, XCircle, Clock, AlertTriangle,
  User, Mail, Phone, Calendar, Car,
  MoreVertical, RefreshCw, TrendingUp, Download,
  Shield, FileText, ArrowRight, AlertCircle,
  ThumbsUp, ThumbsDown, Reply, Archive,
  Paperclip, File, Image, DownloadCloud,
  Users, BarChart2, FileSpreadsheet, Printer,Upload
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetAllTicketsQuery,
  useUpdateTicketStatusMutation,
  useAddAdminNotesMutation,
  useAssignTicketMutation,
  useAddTicketReplyMutation,
  useUploadAttachmentMutation,
  useGetTicketStatsQuery,
  type SupportTicketResponse
} from '../../features/api/supportApi'

interface SupportTicket extends SupportTicketResponse {}

const SupportTickets: React.FC = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedTickets, setSelectedTickets] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [showReplyModal, setShowReplyModal] = useState<number | null>(null)
  const [showNotesModal, setShowNotesModal] = useState<number | null>(null)
  const [showAssignModal, setShowAssignModal] = useState<number | null>(null)
  const [assignTo, setAssignTo] = useState('')
  const [fileUploads, setFileUploads] = useState<{ [key: number]: File | null }>({})

  // API Hooks
  const { 
    data: ticketsResponse, 
    isLoading, 
    isError,
    refetch 
  } = useGetAllTicketsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchTerm || undefined
  })

  const { data: statsResponse } = useGetTicketStatsQuery()
  
  const [updateTicketStatus, { isLoading: isUpdatingStatus }] = useUpdateTicketStatusMutation()
  const [addAdminNotes, { isLoading: isAddingNotes }] = useAddAdminNotesMutation()
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation()
  const [addTicketReply, { isLoading: isAddingReply }] = useAddTicketReplyMutation()
  const [uploadAttachment, { isLoading: isUploading }] = useUploadAttachmentMutation()

  // Get tickets from API response
  const tickets: SupportTicket[] = ticketsResponse?.tickets || []
  const stats = statsResponse?.stats

  // Apply frontend search (additional to API search)
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_id.toString().includes(searchTerm)
    
    return matchesSearch
  })

  // Handlers
  const handleUpdateStatus = async (ticketId: number, newStatus: SupportTicket['status']) => {
    try {
      await updateTicketStatus({
        ticketId,
        data: { status: newStatus }
      }).unwrap()
      
      toast.success(`Ticket #${ticketId} marked as ${newStatus}`)
      setActionMenu(null)
    } catch (error: any) {
      console.error('Update status error:', error)
      toast.error(error?.data?.error || 'Failed to update ticket status')
    }
  }

  const handleAssignTicket = async (ticketId: number) => {
    if (!assignTo.trim()) {
      toast.error('Please enter assignee name')
      return
    }

    try {
      await assignTicket({
        ticketId,
        data: { assigned_to: assignTo }
      }).unwrap()
      
      toast.success(`Ticket #${ticketId} assigned to ${assignTo}`)
      setShowAssignModal(null)
      setAssignTo('')
    } catch (error: any) {
      console.error('Assign ticket error:', error)
      toast.error(error?.data?.error || 'Failed to assign ticket')
    }
  }

  const handleAddAdminNotes = async (ticketId: number) => {
    if (!adminNotes.trim()) {
      toast.error('Please enter admin notes')
      return
    }

    try {
      await addAdminNotes({
        ticketId,
        admin_notes: adminNotes
      }).unwrap()
      
      toast.success('Admin notes added successfully')
      setShowNotesModal(null)
      setAdminNotes('')
    } catch (error: any) {
      console.error('Add notes error:', error)
      toast.error(error?.data?.error || 'Failed to add admin notes')
    }
  }

  const handleAddReply = async (ticketId: number) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message')
      return
    }

    try {
      await addTicketReply({
        ticketId,
        data: { 
          message: replyText,
          is_admin_reply: true 
        }
      }).unwrap()
      
      toast.success('Reply added to ticket')
      setShowReplyModal(null)
      setReplyText('')
    } catch (error: any) {
      console.error('Add reply error:', error)
      toast.error(error?.data?.error || 'Failed to add reply')
    }
  }

  const handleUploadAttachment = async (ticketId: number) => {
    const file = fileUploads[ticketId]
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not allowed. Allowed: JPEG, PNG, GIF, PDF, TXT')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      await uploadAttachment({
        ticketId,
        formData
      }).unwrap()
      
      toast.success('Attachment uploaded successfully')
      setFileUploads(prev => ({ ...prev, [ticketId]: null }))
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error?.data?.error || 'Failed to upload attachment')
    }
  }

  const handleFileSelect = (ticketId: number, file: File | null) => {
    setFileUploads(prev => ({ ...prev, [ticketId]: file }))
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800 border-red-200'
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertTriangle size={16} />
      case 'In Progress': return <Clock size={16} />
      case 'Resolved': return <CheckCircle size={16} />
      case 'Closed': return <XCircle size={16} />
      case 'On Hold': return <AlertCircle size={16} />
      default: return <MessageSquare size={16} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle size={16} />
      case 'high': return <TrendingUp size={16} />
      default: return <AlertTriangle size={16} />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'damage_report': return 'bg-red-100 text-red-800'
      case 'technical_issue': return 'bg-blue-100 text-blue-800'
      case 'billing': return 'bg-purple-100 text-purple-800'
      case 'complaint': return 'bg-orange-100 text-orange-800'
      case 'general_inquiry': return 'bg-green-100 text-green-800'
      case 'feedback': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return dateString
    }
  }

  const formatType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const downloadAttachments = (attachments: any[]) => {
    if (!attachments || attachments.length === 0) {
      toast.error('No attachments to download')
      return
    }

    // In a real implementation, you would download from URLs
    attachments.forEach((attachment, index) => {
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      if (index === 0) {
        toast.success(`Downloading ${attachment.filename}...`)
      }
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto text-blue-600 animate-spin mb-4" size={48} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Support Tickets</h3>
          <p className="text-gray-600">Fetching ticket data from server...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <XCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h3 className="text-2xl font-bold text-red-600 mb-2">Connection Error</h3>
          <p className="text-gray-600 mb-6">Failed to connect to the support server.</p>
          <button 
            onClick={() => refetch()}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <RefreshCw size={20} className="inline mr-2" />
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                Support Tickets
              </h1>
              <p className="text-gray-600 mt-1">Manage customer support requests and inquiries</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => refetch()}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                <FileSpreadsheet size={20} />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Tickets</p>
                <h3 className="text-3xl font-bold mt-1">{stats?.total_tickets || tickets.length}</h3>
              </div>
              <MessageSquare size={32} className="text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Open Tickets</p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats?.open_tickets || tickets.filter(t => t.status === 'Open').length}
                </h3>
              </div>
              <AlertTriangle size={32} className="text-red-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">In Progress</p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats?.in_progress_tickets || tickets.filter(t => t.status === 'In Progress').length}
                </h3>
              </div>
              <Clock size={32} className="text-orange-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Avg Response Time</p>
                <h3 className="text-3xl font-bold mt-1">
                  {stats?.avg_response_time ? `${stats.avg_response_time.toFixed(1)}h` : 'N/A'}
                </h3>
              </div>
              <TrendingUp size={32} className="text-green-200" />
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tickets by user, subject, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
                >
                  <option value="all">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="On Hold">On Hold</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[180px]"
                >
                  <option value="all">All Types</option>
                  <option value="damage_report">Damage Report</option>
                  <option value="technical_issue">Technical Issue</option>
                  <option value="billing">Billing</option>
                  <option value="complaint">Complaint</option>
                  <option value="general_inquiry">General Inquiry</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  const csvContent = tickets.map(t => 
                    `${t.ticket_id},${t.subject},${t.user_name},${t.status},${t.priority},${formatDateTime(t.created_at)}`
                  ).join('\n')
                  const blob = new Blob([csvContent], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `support-tickets-${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                  toast.success('Exporting tickets to CSV')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <Download size={20} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-blue-100">
              <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Support Tickets Found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setPriorityFilter('all')
                  setTypeFilter('all')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div key={ticket.ticket_id} className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Ticket Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between mb-4">
                        <div className="flex-1 min-w-[300px]">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              #{ticket.ticket_id} - {ticket.subject}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(ticket.priority)} flex items-center gap-1`}>
                              {getPriorityIcon(ticket.priority)}
                              {ticket.priority.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-full font-semibold border ${getStatusColor(ticket.status)}`}>
                              {getStatusIcon(ticket.status)}
                              {ticket.status.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full font-semibold ${getTypeColor(ticket.type)}`}>
                              {formatType(ticket.type)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDateTime(ticket.created_at)}
                            </span>
                            {ticket.assigned_to && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <User size={14} />
                                {ticket.assigned_to}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* User and Booking Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold">
                            {ticket.user_name?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{ticket.user_name || 'Unknown User'}</div>
                            <div className="text-gray-600 text-sm">{ticket.user_email || 'No email'}</div>
                            {ticket.user_phone && (
                              <div className="text-gray-500 text-sm flex items-center gap-1">
                                <Phone size={12} />
                                {ticket.user_phone}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {(ticket.booking_id || ticket.vehicle_name) && (
                          <div className="flex items-center gap-3">
                            <Car className="text-green-600" size={20} />
                            <div>
                              {ticket.booking_id && (
                                <div className="font-semibold text-gray-900">Booking #{ticket.booking_id}</div>
                              )}
                              {ticket.vehicle_name && (
                                <div className="text-gray-600 text-sm">{ticket.vehicle_name}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ticket Description */}
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                      </div>

                      {/* Attachments */}
                      {ticket.attachments && ticket.attachments.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Paperclip size={16} className="text-gray-500" />
                            <span className="font-semibold text-gray-700">Attachments</span>
                            <span className="text-gray-500 text-sm">({ticket.attachments.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {ticket.attachments.map((attachment: any, index: number) => (
                              <button
                                key={index}
                                onClick={() => {
                                  const link = document.createElement('a')
                                  link.href = attachment.url
                                  link.download = attachment.filename
                                  link.click()
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                {attachment.type?.startsWith('image/') ? (
                                  <Image size={16} className="text-blue-600" />
                                ) : (
                                  <File size={16} className="text-gray-600" />
                                )}
                                <span className="text-sm text-gray-700 truncate max-w-[150px]">
                                  {attachment.filename}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {Math.round(attachment.size / 1024)}KB
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin Notes */}
                      {ticket.admin_notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield size={16} className="text-yellow-600" />
                            <span className="font-semibold text-yellow-800">Admin Notes</span>
                          </div>
                          <p className="text-yellow-700 whitespace-pre-wrap">{ticket.admin_notes}</p>
                        </div>
                      )}

                      {/* Last Response */}
                      {ticket.last_response && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare size={16} className="text-blue-600" />
                            <span className="font-semibold text-blue-800">Last Response</span>
                            <span className="text-blue-600 text-sm">({ticket.response_count} total)</span>
                            {ticket.last_response_at && (
                              <span className="text-blue-500 text-sm ml-auto">
                                {formatDateTime(ticket.last_response_at)}
                              </span>
                            )}
                          </div>
                          <p className="text-blue-700 whitespace-pre-wrap">{ticket.last_response}</p>
                        </div>
                      )}

                      {/* Quick Reply & File Upload */}
                      <div className="space-y-4">
                        {/* File Upload */}
                        <div className="border border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Paperclip size={18} className="text-gray-600" />
                              <span className="font-semibold text-gray-700">Add Attachment</span>
                            </div>
                            {fileUploads[ticket.ticket_id] && (
                              <span className="text-sm text-green-600">
                                {fileUploads[ticket.ticket_id]?.name}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <input
                              type="file"
                              onChange={(e) => handleFileSelect(ticket.ticket_id, e.target.files?.[0] || null)}
                              className="flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              accept=".jpg,.jpeg,.png,.gif,.pdf,.txt"
                            />
                            <button
                              onClick={() => handleUploadAttachment(ticket.ticket_id)}
                              disabled={!fileUploads[ticket.ticket_id] || isUploading}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              {isUploading ? (
                                <RefreshCw size={16} className="animate-spin" />
                              ) : (
                                <Upload size={16} />
                              )}
                              Upload
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Max file size: 10MB. Allowed: JPG, PNG, GIF, PDF, TXT
                          </p>
                        </div>

                        {/* Quick Reply */}
                        <div className="border border-gray-200 rounded-xl p-4">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your response here..."
                            className="w-full h-24 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          <div className="flex justify-between items-center mt-3">
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <FileText size={16} className="text-gray-400" />
                              </button>
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Image size={16} className="text-gray-400" />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold transition-all">
                                Save Draft
                              </button>
                              <button 
                                onClick={() => handleAddReply(ticket.ticket_id)}
                                disabled={isAddingReply || !replyText.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                              >
                                <Reply size={16} />
                                {isAddingReply ? 'Sending...' : 'Send Reply'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Sidebar */}
                    <div className="flex flex-col gap-3 min-w-[200px]">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                        <Eye size={16} />
                        View Details
                      </button>

                      {ticket.status === 'Open' && (
                        <button 
                          onClick={() => {
                            setShowAssignModal(ticket.ticket_id)
                            setAssignTo('')
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <User size={16} />
                          Assign to Me
                        </button>
                      )}

                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === ticket.ticket_id ? null : ticket.ticket_id)}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <MoreVertical size={16} />
                          Actions
                        </button>
                        
                        {actionMenu === ticket.ticket_id && (
                          <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 min-w-[200px]">
                            {ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateStatus(ticket.ticket_id, 'In Progress')}
                                  disabled={isUpdatingStatus}
                                  className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-t-xl disabled:opacity-50"
                                >
                                  <Clock size={16} />
                                  Mark In Progress
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(ticket.ticket_id, 'Resolved')}
                                  disabled={isUpdatingStatus}
                                  className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-2 text-gray-700"
                                >
                                  <CheckCircle size={16} />
                                  Mark Resolved
                                </button>
                                <button 
                                  onClick={() => handleUpdateStatus(ticket.ticket_id, 'On Hold')}
                                  disabled={isUpdatingStatus}
                                  className="w-full text-left px-4 py-3 hover:bg-yellow-50 flex items-center gap-2 text-gray-700"
                                >
                                  <AlertCircle size={16} />
                                  Put On Hold
                                </button>
                              </>
                            )}
                            
                            <button 
                              onClick={() => {
                                setShowNotesModal(ticket.ticket_id)
                                setAdminNotes(ticket.admin_notes || '')
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-yellow-50 flex items-center gap-2 text-gray-700"
                            >
                              <Shield size={16} />
                              Add Admin Notes
                            </button>
                            
                            <button 
                              onClick={() => handleUpdateStatus(ticket.ticket_id, 'Closed')}
                              disabled={isUpdatingStatus}
                              className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600 rounded-b-xl"
                            >
                              <Archive size={16} />
                              Close Ticket
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Priority Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['urgent', 'high', 'medium', 'low'].map(priority => {
            const count = tickets.filter(t => t.priority === priority).length
            return (
              <div key={priority} className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 text-center">
                <div className={`w-12 h-12 ${getPriorityColor(priority)} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  {getPriorityIcon(priority)}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-gray-600 capitalize">{priority} Priority</div>
              </div>
            )
          })}
        </div>

        {/* Stats by Type */}
        {stats?.by_type && Object.keys(stats.by_type).length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tickets by Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.by_type).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(type).split(' ')[0]}`}></div>
                    <span className="font-medium text-gray-700">{formatType(type)}</span>
                  </div>
                  <span className="font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-gray-600">
              Showing 1-{filteredTickets.length} of {tickets.length} tickets
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                1
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAssignModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <User className="mx-auto text-blue-500 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Assign Ticket</h3>
              <input
                type="text"
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                placeholder="Enter assignee name"
                className="w-full border border-gray-300 rounded-xl p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowAssignModal(null)}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignTicket(showAssignModal)}
                  disabled={isAssigning || !assignTo.trim()}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <User size={16} />
                  {isAssigning ? 'Assigning...' : 'Assign Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowNotesModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <Shield className="mx-auto text-yellow-500 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Add Admin Notes</h3>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter admin notes..."
                className="w-full h-32 border border-gray-300 rounded-xl p-4 mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              />
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowNotesModal(null)}
                  className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleAddAdminNotes(showNotesModal)}
                  disabled={isAddingNotes || !adminNotes.trim()}
                  className="px-6 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Shield size={16} />
                  {isAddingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SupportTickets