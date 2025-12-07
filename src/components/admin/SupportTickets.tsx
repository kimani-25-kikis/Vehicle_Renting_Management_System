// components/admin/SupportTickets.tsx
import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare, Search, Filter, Eye, Edit, 
  CheckCircle, XCircle, Clock, AlertTriangle,
  User, Mail, Phone, Calendar, Car,
  MoreVertical, RefreshCw, TrendingUp, Download,
  Shield, FileText, ArrowRight, AlertCircle,
  ThumbsUp, ThumbsDown, Reply, Archive,
  Paperclip, File, Image, DownloadCloud,
  Users, BarChart2, FileSpreadsheet, Printer, Upload,
  Star, Tag, Flag, ExternalLink, Copy, Send,
  Bell, EyeOff, Lock, Unlock, FilterX,
  BarChart, PieChart, LineChart, ChevronDown, ChevronUp,
  Hash, Award, Crown, Zap, Target, TrendingDown,
  Check, X, HelpCircle, Info, AlertOctagon,
  Share2, Bookmark, Edit2, Trash2, Link,
  Maximize2, Minimize2, FileCode
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
  useUpdateTicketPriorityMutation,
  type SupportTicketResponse
} from '../../features/api/supportApi'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

interface SupportTicket extends SupportTicketResponse {}

const SupportTickets: React.FC = () => {
  // State management (Original + Enhanced)
  const [searchTerm, setSearchTerm] = useState('')
  const [updateTicketPriority, { isLoading: isUpdatingPriority }] = useUpdateTicketPriorityMutation()
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
  
  // Enhanced states
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState<SupportTicket | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'json' | 'csv'>('pdf')
  const [quickActions, setQuickActions] = useState<{ [key: number]: string[] }>({})
  const [expandedTickets, setExpandedTickets] = useState<number[]>([])
  const [bulkAction, setBulkAction] = useState<string>('')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [ticketPriorities, setTicketPriorities] = useState<{ [key: number]: string }>({})
  const [customTags, setCustomTags] = useState<{ [key: number]: string[] }>({})
  const [newTag, setNewTag] = useState('')
  const [showTagModal, setShowTagModal] = useState<number | null>(null)
  const [ticketInsights, setTicketInsights] = useState<any>(null)
  const [showInsights, setShowInsights] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
const [activeFilters, setActiveFilters] = useState({
  status: false,
  priority: false,
  type: false,
  date: false,
  assigned: false
})

const [dateRange, setDateRange] = useState({ from: '', to: '' })
const [assignedFilter, setAssignedFilter] = useState('all')
  
  const ticketRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // API Hooks (Original)
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
      ticket.ticket_id.toString().includes(searchTerm) ||
      ticket.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // ORIGINAL HANDLERS (Keep as is)
  const handleUpdateStatus = async (ticketId: number, newStatus: SupportTicket['status']) => {
    try {
      await updateTicketStatus({
        ticketId,
        data: { status: newStatus }
      }).unwrap()
      
      toast.success(`Ticket #${ticketId} marked as ${newStatus}`)
      setActionMenu(null)
      
      // Enhanced: Add to quick actions history
      setQuickActions(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), `Status changed to ${newStatus}`]
      }))
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
      
      // Enhanced: Add to quick actions history
      setQuickActions(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), `Assigned to ${assignTo}`]
      }))
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
        data: { admin_notes: adminNotes }
      }).unwrap()
      
      toast.success('Admin notes added successfully')
      setShowNotesModal(null)
      setAdminNotes('')
      
      // Enhanced: Add to quick actions history
      setQuickActions(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), 'Admin notes added']
      }))
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
      
      // Enhanced: Add to quick actions history
      setQuickActions(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), 'Admin reply sent']
      }))
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    if (!allowedTypes.includes(file.type)) {
      toast.error('File type not allowed. Allowed: JPEG, PNG, GIF, PDF, TXT, DOC, DOCX, XLS, XLSX')
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
      
      // Enhanced: Add to quick actions history
      setQuickActions(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), `Attachment uploaded: ${file.name}`]
      }))
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error?.data?.error || 'Failed to upload attachment')
    }
  }

  const handleFileSelect = (ticketId: number, file: File | null) => {
    setFileUploads(prev => ({ ...prev, [ticketId]: file }))
  }

  // ENHANCED HANDLERS (New features)
  const handleUpdatePriority = async (ticketId: number, newPriority: string) => {
  try {
    await updateTicketPriority({
      ticketId,
      data: { priority: newPriority }
    }).unwrap()
    
    toast.success(`Ticket #${ticketId} priority set to ${newPriority}`)
    
    // Refetch tickets to get updated data
    refetch()
    
    // Add to quick actions history
    setQuickActions(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), `Priority changed to ${newPriority}`]
    }))
  } catch (error: any) {
    console.error('Update priority error:', error)
    toast.error(error?.data?.error || 'Failed to update priority')
  }
}

  const handleAddTag = (ticketId: number) => {
    if (!newTag.trim()) {
      toast.error('Please enter a tag')
      return
    }

    setCustomTags(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newTag.trim()]
    }))
    
    setNewTag('')
    setShowTagModal(null)
    toast.success(`Tag "${newTag}" added to ticket #${ticketId}`)
  }

  const handleRemoveTag = (ticketId: number, tagIndex: number) => {
    setCustomTags(prev => ({
      ...prev,
      [ticketId]: prev[ticketId]?.filter((_, index) => index !== tagIndex) || []
    }))
  }

  // ENHANCED FEATURES: Download/Export functions
  const downloadTicketAsPDF = async (ticket: SupportTicket) => {
    try {
      const element = ticketRefs.current[ticket.ticket_id.toString()]
      if (!element) {
        toast.error('Cannot generate PDF for this ticket')
        return
      }

      toast.loading('Generating PDF...')
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`ticket-${ticket.ticket_id}-${ticket.subject.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`)
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
  }

  const downloadTicketAsExcel = (ticket: SupportTicket) => {
    const workbook = XLSX.utils.book_new()
    
    // Ticket Info Sheet
    const ticketData = [
      ['Ticket ID', ticket.ticket_id.toString()],
      ['Subject', ticket.subject],
      ['Customer', ticket.user_name],
      ['Email', ticket.user_email],
      ['Phone', ticket.user_phone || 'N/A'],
      ['Type', ticket.type],
      ['Priority', ticket.priority],
      ['Status', ticket.status],
      ['Created', new Date(ticket.created_at).toLocaleString()],
      ['Assigned To', ticket.assigned_to || 'Unassigned'],
      ['Booking ID', ticket.booking_id || 'N/A'],
      ['Vehicle', ticket.vehicle_name || 'N/A']
    ]
    
    const ticketSheet = XLSX.utils.aoa_to_sheet(ticketData)
    XLSX.utils.book_append_sheet(workbook, ticketSheet, 'Ticket Info')
    
    // Description Sheet
    const descData = [['Description'], [ticket.description]]
    const descSheet = XLSX.utils.aoa_to_sheet(descData)
    XLSX.utils.book_append_sheet(workbook, descSheet, 'Description')
    
    // Admin Notes Sheet
    if (ticket.admin_notes) {
      const notesData = [['Admin Notes'], [ticket.admin_notes]]
      const notesSheet = XLSX.utils.aoa_to_sheet(notesData)
      XLSX.utils.book_append_sheet(workbook, notesSheet, 'Admin Notes')
    }
    
    XLSX.writeFile(workbook, `ticket-${ticket.ticket_id}-report.xlsx`)
    toast.success('Excel report downloaded!')
  }

  const downloadTicketAsCSV = (ticket: SupportTicket) => {
    let csvContent = 'Ticket Report\n\n'
    csvContent += 'BASIC INFO\n'
    csvContent += `Ticket ID,${ticket.ticket_id}\n`
    csvContent += `Subject,${ticket.subject}\n`
    csvContent += `Customer,${ticket.user_name}\n`
    csvContent += `Email,${ticket.user_email}\n`
    csvContent += `Phone,${ticket.user_phone || 'N/A'}\n`
    csvContent += `Type,${ticket.type}\n`
    csvContent += `Priority,${ticket.priority}\n`
    csvContent += `Status,${ticket.status}\n`
    csvContent += `Created,${new Date(ticket.created_at).toLocaleString()}\n`
    csvContent += `Assigned To,${ticket.assigned_to || 'Unassigned'}\n\n`
    
    csvContent += 'DESCRIPTION\n'
    csvContent += `${ticket.description}\n\n`
    
    if (ticket.admin_notes) {
      csvContent += 'ADMIN NOTES\n'
      csvContent += `${ticket.admin_notes}\n\n`
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ticket-${ticket.ticket_id}-report.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('CSV report downloaded!')
  }

  const printTicket = (ticket: SupportTicket) => {
    setSelectedTicketForPrint(ticket)
    
    // Print after a small delay
    setTimeout(() => {
      const printContent = document.getElementById('printable-ticket')
      if (printContent) {
        const originalContents = document.body.innerHTML
        document.body.innerHTML = printContent.innerHTML
        window.print()
        document.body.innerHTML = originalContents
        location.reload()
      }
    }, 500)
  }

  const exportBulkTickets = () => {
    if (selectedTickets.length === 0) {
      toast.error('Please select tickets to export')
      return
    }

    const selectedTicketData = tickets.filter(t => selectedTickets.includes(t.ticket_id))
    
    switch (exportFormat) {
      case 'excel':
        exportBulkAsExcel(selectedTicketData)
        break
      case 'csv':
        exportBulkAsCSV(selectedTicketData)
        break
      default:
        toast.error('Please select an export format')
    }
    
    setShowExportModal(false)
  }

  const exportBulkAsExcel = (ticketsData: SupportTicket[]) => {
    const workbook = XLSX.utils.book_new()
    
    const summaryData = [
      ['Ticket ID', 'Subject', 'Customer', 'Email', 'Type', 'Priority', 'Status', 'Created', 'Assigned To']
    ]
    
    ticketsData.forEach(ticket => {
      summaryData.push([
        ticket.ticket_id.toString(),
        ticket.subject,
        ticket.user_name,
        ticket.user_email,
        ticket.type,
        ticket.priority,
        ticket.status,
        new Date(ticket.created_at).toLocaleString(),
        ticket.assigned_to || 'Unassigned'
      ])
    })
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
    
    XLSX.writeFile(workbook, `tickets-bulk-export-${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success(`Exported ${ticketsData.length} tickets to Excel!`)
  }

  const exportBulkAsCSV = (ticketsData: SupportTicket[]) => {
    let csvContent = 'Ticket ID,Subject,Customer,Email,Type,Priority,Status,Created,Assigned To\n'
    
    ticketsData.forEach(ticket => {
      csvContent += `${ticket.ticket_id},"${ticket.subject}","${ticket.user_name}","${ticket.user_email}","${ticket.type}","${ticket.priority}","${ticket.status}","${new Date(ticket.created_at).toLocaleString()}","${ticket.assigned_to || 'Unassigned'}"\n`
    })
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tickets-bulk-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${ticketsData.length} tickets to CSV!`)
  }

  const toggleTicketExpand = (ticketId: number) => {
    setExpandedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    )
  }

  const toggleTicketSelection = (ticketId: number) => {
    setSelectedTickets(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    )
  }

  const selectAllTickets = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([])
    } else {
      setSelectedTickets(filteredTickets.map(t => t.ticket_id))
    }
  }

  // Helper functions (Original + Enhanced)
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
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                Support Tickets Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage customer support requests and inquiries</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => refetch()}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <FileSpreadsheet size={20} />
                Export
              </button>
              {selectedTickets.length > 0 && (
                <button 
                  onClick={() => setShowBulkModal(true)}
                  className="bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Users size={20} />
                  Bulk ({selectedTickets.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview - Keep Original */}
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

        {/* Enhanced Controls Bar */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Bulk Selection */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                onChange={selectAllTickets}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">
                {selectedTickets.length > 0 
                  ? `${selectedTickets.length} selected` 
                  : 'Select all'}
              </span>
            </div>

            {/* Search and Filters - Keep Original */}
            {/* Enhanced Filter System */}
<div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
    {/* Bulk Selection */}
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
        onChange={selectAllTickets}
        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
      />
      <span className="text-gray-700">
        {selectedTickets.length > 0 
          ? `${selectedTickets.length} selected` 
          : 'Select all'}
      </span>
    </div>

    {/* Search Bar */}
    <div className="relative flex-1 min-w-[250px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        placeholder="Search tickets by ID, subject, customer, email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>

    {/* Filter Toggle Button */}
    <button
      onClick={() => setShowFilters(!showFilters)}
      className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors"
    >
      <Filter size={18} />
      {showFilters ? 'Hide Filters' : 'Show Filters'}
      {Object.values(activeFilters).filter(Boolean).length > 0 && (
        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
          {Object.values(activeFilters).filter(Boolean).length}
        </span>
      )}
    </button>
  </div>

  {/* Collapsible Filter Panel */}
  {showFilters && (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Tickets</h3>
        <button
          onClick={() => {
            setStatusFilter('all')
            setPriorityFilter('all')
            setTypeFilter('all')
            setDateRange({ from: '', to: '' })
            setAssignedFilter('all')
            setActiveFilters({
              status: false,
              priority: false,
              type: false,
              date: false,
              assigned: false
            })
          }}
          className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
        >
          <FilterX size={16} />
          Clear All Filters
        </button>
      </div>

      {/* Organized Filter Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CheckCircle size={16} className="text-blue-600" />
              Status
            </label>
            <button
              onClick={() => {
                setActiveFilters(prev => ({ ...prev, status: !prev.status }))
                if (activeFilters.status) setStatusFilter('all')
              }}
              className={`text-xs px-2 py-1 rounded ${activeFilters.status ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
            >
              {activeFilters.status ? 'On' : 'Off'}
            </button>
          </div>
          {activeFilters.status && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="On Hold">On Hold</option>
            </select>
          )}
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-600" />
              Priority
            </label>
            <button
              onClick={() => {
                setActiveFilters(prev => ({ ...prev, priority: !prev.priority }))
                if (activeFilters.priority) setPriorityFilter('all')
              }}
              className={`text-xs px-2 py-1 rounded ${activeFilters.priority ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}
            >
              {activeFilters.priority ? 'On' : 'Off'}
            </button>
          </div>
          {activeFilters.priority && (
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          )}
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag size={16} className="text-purple-600" />
              Type
            </label>
            <button
              onClick={() => {
                setActiveFilters(prev => ({ ...prev, type: !prev.type }))
                if (activeFilters.type) setTypeFilter('all')
              }}
              className={`text-xs px-2 py-1 rounded ${activeFilters.type ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}
            >
              {activeFilters.type ? 'On' : 'Off'}
            </button>
          </div>
          {activeFilters.type && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="damage_report">Damage Report</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="billing">Billing</option>
              <option value="complaint">Complaint</option>
              <option value="general_inquiry">General Inquiry</option>
              <option value="feedback">Feedback</option>
            </select>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar size={16} className="text-green-600" />
              Date Range
            </label>
            <button
              onClick={() => {
                setActiveFilters(prev => ({ ...prev, date: !prev.date }))
                if (activeFilters.date) setDateRange({ from: '', to: '' })
              }}
              className={`text-xs px-2 py-1 rounded ${activeFilters.date ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
            >
              {activeFilters.date ? 'On' : 'Off'}
            </button>
          </div>
          {activeFilters.date && (
            <div className="space-y-2">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="From"
              />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="To"
              />
            </div>
          )}
        </div>

        {/* Assigned To Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User size={16} className="text-indigo-600" />
              Assigned To
            </label>
            <button
              onClick={() => {
                setActiveFilters(prev => ({ ...prev, assigned: !prev.assigned }))
                if (activeFilters.assigned) setAssignedFilter('all')
              }}
              className={`text-xs px-2 py-1 rounded ${activeFilters.assigned ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
            >
              {activeFilters.assigned ? 'On' : 'Off'}
            </button>
          </div>
          {activeFilters.assigned && (
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {/* You can dynamically populate this from tickets */}
              {Array.from(new Set(tickets.filter(t => t.assigned_to).map(t => t.assigned_to))).map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Active Filters Badges */}
      {Object.values(activeFilters).some(Boolean) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.status && statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="text-blue-600 hover:text-blue-800">
                  <X size={12} />
                </button>
              </span>
            )}
            {activeFilters.priority && priorityFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                Priority: {priorityFilter}
                <button onClick={() => setPriorityFilter('all')} className="text-orange-600 hover:text-orange-800">
                  <X size={12} />
                </button>
              </span>
            )}
            {activeFilters.type && typeFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Type: {formatType(typeFilter)}
                <button onClick={() => setTypeFilter('all')} className="text-purple-600 hover:text-purple-800">
                  <X size={12} />
                </button>
              </span>
            )}
            {activeFilters.date && (dateRange.from || dateRange.to) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Date: {dateRange.from || 'Any'} to {dateRange.to || 'Any'}
                <button onClick={() => setDateRange({ from: '', to: '' })} className="text-green-600 hover:text-green-800">
                  <X size={12} />
                </button>
              </span>
            )}
            {activeFilters.assigned && assignedFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                Assigned: {assignedFilter === 'unassigned' ? 'Unassigned' : assignedFilter}
                <button onClick={() => setAssignedFilter('all')} className="text-indigo-600 hover:text-indigo-800">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )}
</div>
          </div>
        </div>

        {/* HYBRID Tickets List - Original Content + Enhanced Features */}
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
            filteredTickets.map((ticket) => {
              const isExpanded = expandedTickets.includes(ticket.ticket_id)
              const isSelected = selectedTickets.includes(ticket.ticket_id)
              
              return (
                <div 
                  key={ticket.ticket_id} 
                  ref={el => {
                    if (el) {
                      ticketRefs.current[ticket.ticket_id.toString()] = el;
                    }
                    return undefined;
                  }}
                  className={`bg-white rounded-2xl shadow-xl border ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-100'} overflow-hidden hover:shadow-2xl transition-all duration-300`}
                >
                  <div className="p-6">
                    {/* Ticket Header with Enhanced Features */}
                    <div className="flex items-start gap-4 mb-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTicketSelection(ticket.ticket_id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between mb-2">
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
                          
                          {/* Enhanced Quick Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleTicketExpand(ticket.ticket_id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                            <button
                              onClick={() => setShowTagModal(ticket.ticket_id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Add Tag"
                            >
                              <Tag size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Enhanced Quick Export Buttons */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <button
                            onClick={() => downloadTicketAsPDF(ticket)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm transition-colors"
                            title="Download as PDF"
                          >
                            <FileText size={14} />
                            PDF
                          </button>
                          <button
                            onClick={() => downloadTicketAsExcel(ticket)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm transition-colors"
                            title="Download as Excel"
                          >
                            <FileSpreadsheet size={14} />
                            Excel
                          </button>
                          <button
                            onClick={() => downloadTicketAsCSV(ticket)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm transition-colors"
                            title="Download as CSV"
                          >
                            <FileText size={14} />
                            CSV
                          </button>
                          <button
                            onClick={() => printTicket(ticket)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm transition-colors"
                            title="Print Ticket"
                          >
                            <Printer size={14} />
                            Print
                          </button>
                        </div>

                        {/* Custom Tags */}
                        {customTags[ticket.ticket_id] && customTags[ticket.ticket_id].length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {customTags[ticket.ticket_id].map((tag, index) => (
                              <span 
                                key={index}
                                className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs"
                              >
                                {tag}
                                <button
                                  onClick={() => handleRemoveTag(ticket.ticket_id, index)}
                                  className="text-indigo-500 hover:text-indigo-700"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ORIGINAL TICKET CONTENT (Always visible) */}
                    <div className="mt-4">
                      {/* User and Booking Info - ORIGINAL */}
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

                      {/* Ticket Description - ORIGINAL (User's writing) */}
                      <div className="mb-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                      </div>

                      {/* Attachments - ORIGINAL */}
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

                      {/* Admin Notes - ORIGINAL */}
                      {ticket.admin_notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield size={16} className="text-yellow-600" />
                            <span className="font-semibold text-yellow-800">Admin Notes</span>
                          </div>
                          <p className="text-yellow-700 whitespace-pre-wrap">{ticket.admin_notes}</p>
                        </div>
                      )}

                      {/* Last Response - ORIGINAL */}
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

                      {/* EXPANDED ADMIN ACTIONS SECTION */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          {/* Priority Management - ENHANCED */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Flag size={16} className="text-gray-600" />
                              <span className="font-semibold text-gray-700">Priority Management</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {['urgent', 'high', 'medium', 'low'].map(priority => (
                                <button
                                  key={priority}
                                  onClick={() => handleUpdatePriority(ticket.ticket_id, priority)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    ticketPriorities[ticket.ticket_id] === priority || 
                                    (!ticketPriorities[ticket.ticket_id] && ticket.priority === priority)
                                      ? getPriorityColor(priority)
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quick Reply & File Upload - ORIGINAL */}
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
                      )}
                    </div>

                    {/* ORIGINAL Actions Sidebar */}
                    <div className="mt-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      {/* Ticket Content continues... */}
                      <div className="flex-1">
                        {/* Content already shown above */}
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[200px]">
                        {/* <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                          <Eye size={16} />
                          View Details
                        </button> */}

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
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                          >
                            <MoreVertical size={16} />
                            Actions
                          </button>
                          
                          {actionMenu === ticket.ticket_id && (
                            <div className="absolute right-0 bottom-12 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[200px]">
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
              )
            })
          )}
        </div>

        {/* Rest of the original components... */}
        {/* Priority Overview, Stats by Type, Pagination remain the same */}
        
        {/* Enhanced Modals */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowExportModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center">
                <FileSpreadsheet className="mx-auto text-green-500 mb-4" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Export Tickets</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['pdf', 'excel', 'csv'].map(format => (
                        <button
                          key={format}
                          onClick={() => setExportFormat(format as any)}
                          className={`p-3 rounded-xl border ${exportFormat === format ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} transition-colors`}
                        >
                          <div className="text-sm font-medium capitalize">{format}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={exportBulkTickets}
                    disabled={selectedTickets.length === 0}
                    className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Download size={16} />
                    Export {selectedTickets.length > 0 ? `(${selectedTickets.length})` : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tag Modal */}
        {showTagModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTagModal(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center">
                <Tag className="mx-auto text-indigo-500 mb-4" size={48} />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Add Tag to Ticket #{showTagModal}</h3>
                
                <div className="mb-6">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag name (e.g., 'follow-up', 'urgent', 'bug')"
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
                  />
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Urgent', 'Follow-up', 'Bug', 'Feature', 'Customer', 'VIP', 'Billing', 'Technical'].map(tag => (
                      <button
                        key={tag}
                        onClick={() => setNewTag(tag)}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm hover:bg-indigo-100 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setShowTagModal(null)}
                    className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddTag(showTagModal)}
                    disabled={!newTag.trim()}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Tag size={16} />
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Original Modals (Assign, Admin Notes) */}
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

        {/* Printable Content (Hidden) */}
        {selectedTicketForPrint && (
          <div id="printable-ticket" className="hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Ticket Report</h1>
                <p className="text-gray-600">Generated on {new Date().toLocaleString()}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ticket #{selectedTicketForPrint.ticket_id}</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><strong>Subject:</strong> {selectedTicketForPrint.subject}</div>
                  <div><strong>Status:</strong> {selectedTicketForPrint.status}</div>
                  <div><strong>Priority:</strong> {selectedTicketForPrint.priority}</div>
                  <div><strong>Type:</strong> {formatType(selectedTicketForPrint.type)}</div>
                  <div><strong>Customer:</strong> {selectedTicketForPrint.user_name}</div>
                  <div><strong>Email:</strong> {selectedTicketForPrint.user_email}</div>
                  <div><strong>Created:</strong> {formatDateTime(selectedTicketForPrint.created_at)}</div>
                  <div><strong>Assigned To:</strong> {selectedTicketForPrint.assigned_to || 'Unassigned'}</div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Description</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedTicketForPrint.description}
                  </div>
                </div>
                
                {selectedTicketForPrint.admin_notes && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Notes</h3>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      {selectedTicketForPrint.admin_notes}
                    </div>
                  </div>
                )}
                
                <div className="mt-8 pt-8 border-t border-gray-300">
                  <p className="text-sm text-gray-500 text-center">
                    Report generated by Rent Wheels Support System
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SupportTickets