// components/admin/SupportTickets.tsx
import React, { useState, useEffect } from 'react'
import { 
  MessageSquare, Search, Filter, Eye, Edit, 
  CheckCircle, XCircle, Clock, AlertTriangle,
  User, Mail, Phone, Calendar, Car,
  MoreVertical, RefreshCw, TrendingUp, Download,
  Shield, FileText, ArrowRight, AlertCircle,
  ThumbsUp, ThumbsDown, Reply, Archive
} from 'lucide-react'
import { toast } from 'sonner'

interface SupportTicket {
  ticket_id: number
  user_id: number
  user_name: string
  user_email: string
  user_phone?: string
  subject: string
  description: string
  type: 'damage_report' | 'general_inquiry' | 'technical_issue' | 'billing' | 'complaint'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assigned_to?: string
  booking_id?: number
  vehicle_name?: string
  created_at: string
  updated_at: string
  last_response?: string
  response_count: number
  attachments?: string[]
}

const SupportTickets: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'damage_report' | 'general_inquiry' | 'technical_issue' | 'billing' | 'complaint'>('all')
  const [selectedTickets, setSelectedTickets] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockTickets: SupportTicket[] = [
      {
        ticket_id: 1,
        user_id: 1,
        user_name: 'John Doe',
        user_email: 'john.doe@example.com',
        user_phone: '+254712345678',
        subject: 'Damage Report - Toyota Camry',
        description: 'I noticed a scratch on the passenger side door after returning the vehicle. It was not there when I picked up the car.',
        type: 'damage_report',
        priority: 'high',
        status: 'open',
        booking_id: 1,
        vehicle_name: 'Toyota Camry 2023',
        created_at: '2024-03-20T14:30:00',
        updated_at: '2024-03-20T14:30:00',
        response_count: 0
      },
      {
        ticket_id: 2,
        user_id: 2,
        user_name: 'Sarah Wilson',
        user_email: 'sarah.wilson@example.com',
        subject: 'Payment Not Processed',
        description: 'I was charged twice for my booking #1234. The payment was deducted from my account but shows as pending in the system.',
        type: 'billing',
        priority: 'urgent',
        status: 'in_progress',
        assigned_to: 'Admin User',
        booking_id: 2,
        created_at: '2024-03-19T10:15:00',
        updated_at: '2024-03-20T09:30:00',
        last_response: 'We are investigating the payment issue and will refund the duplicate charge.',
        response_count: 2
      },
      {
        ticket_id: 3,
        user_id: 3,
        user_name: 'Mike Johnson',
        user_email: 'mike.johnson@example.com',
        user_phone: '+254723456789',
        subject: 'App Not Working',
        description: 'I cannot log into the mobile app. It keeps showing "Connection Error" even though my internet is working fine.',
        type: 'technical_issue',
        priority: 'medium',
        status: 'open',
        created_at: '2024-03-21T09:45:00',
        updated_at: '2024-03-21T09:45:00',
        response_count: 0
      },
      {
        ticket_id: 4,
        user_id: 4,
        user_name: 'Emily Davis',
        user_email: 'emily.davis@example.com',
        subject: 'Great Service!',
        description: 'I wanted to compliment the excellent service I received during my recent rental. The staff was very helpful and professional.',
        type: 'general_inquiry',
        priority: 'low',
        status: 'resolved',
        assigned_to: 'Support Team',
        booking_id: 4,
        created_at: '2024-03-18T16:20:00',
        updated_at: '2024-03-19T11:30:00',
        last_response: 'Thank you for your kind feedback! We appreciate you choosing our service.',
        response_count: 1
      },
      {
        ticket_id: 5,
        user_id: 5,
        user_name: 'David Brown',
        user_email: 'david.brown@example.com',
        user_phone: '+254734567890',
        subject: 'Late Return Fee Dispute',
        description: 'I was charged a late return fee but I returned the vehicle on time. The system seems to have recorded the wrong return time.',
        type: 'complaint',
        priority: 'high',
        status: 'in_progress',
        assigned_to: 'Billing Department',
        booking_id: 5,
        vehicle_name: 'BMW X5 2023',
        created_at: '2024-03-22T11:30:00',
        updated_at: '2024-03-22T14:15:00',
        last_response: 'We are reviewing the return time logs and will get back to you within 24 hours.',
        response_count: 1
      }
    ]
    setTickets(mockTickets)
    setLoading(false)
  }, [])

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticket_id.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    const matchesType = typeFilter === 'all' || ticket.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType
  })

  const handleUpdateStatus = (ticketId: number, newStatus: SupportTicket['status']) => {
    toast.success(`Ticket #${ticketId} marked as ${newStatus.replace('_', ' ')}`)
    setTickets(prev => prev.map(ticket => 
      ticket.ticket_id === ticketId ? { 
        ...ticket, 
        status: newStatus,
        updated_at: new Date().toISOString()
      } : ticket
    ))
    setActionMenu(null)
  }

  const handleAssignTicket = (ticketId: number, assignTo: string) => {
    toast.success(`Ticket #${ticketId} assigned to ${assignTo}`)
    setTickets(prev => prev.map(ticket => 
      ticket.ticket_id === ticketId ? { 
        ...ticket, 
        assigned_to: assignTo,
        status: 'in_progress',
        updated_at: new Date().toISOString()
      } : ticket
    ))
    setActionMenu(null)
  }

  const handleAddReply = (ticketId: number) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message')
      return
    }

    toast.success('Reply added to ticket')
    setTickets(prev => prev.map(ticket => 
      ticket.ticket_id === ticketId ? { 
        ...ticket, 
        last_response: replyText,
        response_count: ticket.response_count + 1,
        updated_at: new Date().toISOString()
      } : ticket
    ))
    setReplyText('')
    setActionMenu(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle size={16} />
      case 'in_progress': return <Clock size={16} />
      case 'resolved': return <CheckCircle size={16} />
      case 'closed': return <XCircle size={16} />
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
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
      </div>
    )
  }

  return (
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
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              <FileText size={20} />
              Generate Report
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Tickets</p>
              <h3 className="text-3xl font-bold mt-1">{tickets.length}</h3>
            </div>
            <MessageSquare size={32} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Open</p>
              <h3 className="text-3xl font-bold mt-1">
                {tickets.filter(t => t.status === 'open').length}
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
                {tickets.filter(t => t.status === 'in_progress').length}
              </h3>
            </div>
            <Clock size={32} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Avg Response Time</p>
              <h3 className="text-3xl font-bold mt-1">2.4h</h3>
            </div>
            <TrendingUp size={32} className="text-green-200" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tickets by user, subject, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="damage_report">Damage Report</option>
                <option value="technical_issue">Technical Issue</option>
                <option value="billing">Billing</option>
                <option value="complaint">Complaint</option>
                <option value="general_inquiry">General Inquiry</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              <Download size={20} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <div key={ticket.ticket_id} className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Ticket Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          #{ticket.ticket_id} - {ticket.subject}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(ticket.priority)} flex items-center gap-1`}>
                          {getPriorityIcon(ticket.priority)}
                          {ticket.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full font-semibold border ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('_', ' ').toUpperCase()}
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
                        {ticket.user_name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{ticket.user_name}</div>
                        <div className="text-gray-600 text-sm">{ticket.user_email}</div>
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
                    <p className="text-gray-700 leading-relaxed">{ticket.description}</p>
                  </div>

                  {/* Last Response */}
                  {ticket.last_response && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield size={16} className="text-blue-600" />
                        <span className="font-semibold text-blue-800">Last Response</span>
                        <span className="text-blue-600 text-sm">({ticket.response_count} total)</span>
                      </div>
                      <p className="text-blue-700">{ticket.last_response}</p>
                    </div>
                  )}

                  {/* Quick Reply */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full h-20 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                          <FileText size={16} className="text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                          <Download size={16} className="text-gray-400" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold transition-all">
                          Save Draft
                        </button>
                        <button 
                          onClick={() => handleAddReply(ticket.ticket_id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2"
                        >
                          <Reply size={16} />
                          Send Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                    <Eye size={16} />
                    View Details
                  </button>

                  {ticket.status === 'open' && (
                    <button 
                      onClick={() => handleAssignTicket(ticket.ticket_id, 'Your Name')}
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
                        {ticket.status !== 'closed' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(ticket.ticket_id, 'in_progress')}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-t-xl"
                            >
                              <Clock size={16} />
                              Mark In Progress
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(ticket.ticket_id, 'resolved')}
                              className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-2 text-gray-700"
                            >
                              <CheckCircle size={16} />
                              Mark Resolved
                            </button>
                          </>
                        )}
                        <button className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
                          <Mail size={16} />
                          Contact User
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(ticket.ticket_id, 'closed')}
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
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-blue-100">
          <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No support tickets found</p>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

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

      {/* Pagination */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex items-center justify-between">
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
  )
}

export default SupportTickets