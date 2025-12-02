// components/admin/PaymentManagement.tsx
import React, { useState, useEffect } from 'react'
import { 
  DollarSign, Search, Filter, Download, Eye, 
  CheckCircle, XCircle, Clock, TrendingUp,
  Users, Calendar, CreditCard, Smartphone,
  MoreVertical, RefreshCw, BarChart3, Shield,
  Mail, FileText, AlertTriangle, DownloadCloud,
  ExternalLink, ChevronDown, ChevronUp,
  Printer, ArrowUpDown, Banknote, Receipt,
  CircleDollarSign, Wallet, QrCode,
  Landmark, ReceiptText, Loader2,
  Plus, Trash2
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetAllPaymentsQuery,
  useGetPaymentStatsQuery,
  useRefundPaymentMutation,
  useUpdatePaymentStatusMutation,
  useExportPaymentsMutation,
  useGetPaymentByBookingIdQuery
} from '../../features/api/PaymentApi'
import type { Payment, PaymentFilters, PaymentStats } from '../../features/api/PaymentApi'

// Payment Details Modal Component
const PaymentDetailsModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  paymentId: number | null
}> = ({ isOpen, onClose, paymentId }) => {
  const { data: paymentResponse, isLoading, error } = useGetPaymentByBookingIdQuery(paymentId!, {
    skip: !paymentId || !isOpen
  })

  const payment = paymentResponse?.data

  if (!isOpen || !paymentId) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'card': return <CreditCard size={20} className="text-purple-600" />
      case 'mpesa': return <Smartphone size={20} className="text-green-600" />
      case 'cash': return <Banknote size={20} className="text-orange-600" />
      case 'stripe': return <Landmark size={20} className="text-blue-600" />
      default: return <CreditCard size={20} className="text-gray-600" />
    }
  }

  const getMethodName = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'card': return 'Credit Card'
      case 'mpesa': return 'M-Pesa'
      case 'cash': return 'Cash'
      case 'stripe': return 'Stripe'
      default: return method || 'Unknown'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <span className="ml-3 text-gray-600">Loading payment details...</span>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Payment</h3>
            <p className="text-gray-600 mb-4">Failed to load payment details. Please try again.</p>
            <p className="text-sm text-gray-500 mb-6">Error: {error?.toString()}</p>
            <button 
              onClick={onClose}
              className="mt-6 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        ) : payment ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                <p className="text-gray-600">Payment #{payment.payment_id}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Status and Amount */}
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(payment.payment_status)}`}>
                    {payment.payment_status || 'Unknown'}
                  </span>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(payment.payment_method)}
                    <span className="font-medium">{getMethodName(payment.payment_method)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  ${payment.amount?.toFixed(2) || '0.00'}
                </div>
                <p className="text-gray-600">Total Amount</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Users size={20} />
                    Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{payment.user_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{payment.user_email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Customer ID</p>
                      <p className="font-medium">#{payment.user_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Booking Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Booking ID</p>
                      <p className="font-medium">#{payment.booking_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Booking Status</p>
                      <p className="font-medium">{payment.booking_status || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vehicle</p>
                      <p className="font-medium">{payment.vehicle_model || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={20} />
                    Payment Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Payment ID</p>
                      <p className="font-medium">#{payment.payment_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="font-medium text-sm font-mono break-all">
                        {payment.transaction_id || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created Date</p>
                      <p className="font-medium">{formatDate(payment.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{formatDate(payment.updated_at)}</p>
                    </div>
                    {/* {payment.payment_date && (
                      <div>
                        <p className="text-sm text-gray-500">Payment Date</p>
                        <p className="font-medium">{formatDate(payment.payment_date)}</p>
                      </div>
                    )} */}
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Amount Breakdown</h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Amount Paid</span>
                      <span className="font-semibold text-green-600">${payment.amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium">{getMethodName(payment.payment_method)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Status</span>
                      <span className={`font-semibold ${getStatusColor(payment.payment_status).replace('bg-', 'text-')}`}>
                        {payment.payment_status || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500">
                  Payment processed on {formatDate(payment.created_at)}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Printer size={16} />
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Not Found</h3>
            <p className="text-gray-600 mb-6">The payment details could not be loaded.</p>
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const PaymentManagement: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<PaymentFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Completed' | 'Failed' | 'Refunded'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | string>('all')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [actionMenu, setActionMenu] = useState<number | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedPaymentBookingId, setSelectedPaymentBookingId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // API Hooks
  const { 
    data: paymentsResponse, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetAllPaymentsQuery(filters)

  const { data: statsResponse, isLoading: isLoadingStats, refetch: refetchStats } = useGetPaymentStatsQuery()
  
  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation()
  const [updatePaymentStatus, { isLoading: isUpdatingStatus }] = useUpdatePaymentStatusMutation()
  const [exportPayments, { isLoading: isExporting }] = useExportPaymentsMutation()

  // Process data
  const payments = paymentsResponse?.data || []
  const stats = statsResponse?.stats || {}

  // Get unique payment methods from data
  const paymentMethods = [...new Set(payments.map(p => p.payment_method).filter(Boolean))]

  // Apply frontend filters
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      (payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (payment.booking_id?.toString().includes(searchTerm) || false) ||
      (payment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (payment.payment_id?.toString().includes(searchTerm) || false)
    
    const matchesStatus = statusFilter === 'all' || payment.payment_status === statusFilter
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter
    
    // Date filtering
    let matchesDate = true
    if (dateRange.from && payment.created_at) {
      const paymentDate = new Date(payment.created_at).toISOString().split('T')[0]
      if (paymentDate < dateRange.from) matchesDate = false
    }
    if (dateRange.to && payment.created_at) {
      const paymentDate = new Date(payment.created_at).toISOString().split('T')[0]
      if (paymentDate > dateRange.to) matchesDate = false
    }
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDate
  })

  // Calculate stats if API doesn't provide them
  // const calculatedStats = {
  //   total_revenue: stats.total_revenue || payments
  //     .filter(p => p.payment_status === 'Completed')
  //     .reduce((sum, p) => sum + (p.amount || 0), 0),
  //   completed_payments: stats.completed_payments || payments.filter(p => p.payment_status === 'Completed').length,
  //   pending_payments: stats.pending_payments || payments.filter(p => p.payment_status === 'Pending').length,
  //   failed_payments: stats.failed_payments || payments.filter(p => p.payment_status === 'Failed').length,
  //   refunded_amount: stats.refunded_amount || payments
  //     .filter(p => p.payment_status === 'Refunded')
  //     .reduce((sum, p) => sum + (p.amount || 0), 0),
  //   today_revenue: stats.today_revenue || 0,
  //   monthly_revenue: stats.monthly_revenue || 0
  // }

  // Handlers
  const handleUpdateStatus = async (paymentId: number, newStatus: Payment['payment_status']) => {
    try {
      await updatePaymentStatus({
        payment_id: paymentId,
        payment_status: newStatus
      }).unwrap()
      toast.success(`Payment #${paymentId} status updated to ${newStatus}`)
      setActionMenu(null)
      refetch()
      refetchStats()
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to update payment status')
      setActionMenu(null)
    }
  }

  const handleRefundPayment = async (paymentId: number) => {
    const refundReason = prompt('Please enter refund reason:')
    if (!refundReason) {
      toast.error('Refund reason is required')
      return
    }

    try {
      await refundPayment({
        payment_id: paymentId,
        refund_reason: refundReason
      }).unwrap()
      toast.success(`Payment #${paymentId} refunded successfully`)
      setActionMenu(null)
      refetch()
      refetchStats()
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to refund payment')
      setActionMenu(null)
    }
  }

  const handleExportPayments = async () => {
    try {
      const exportFilters = {
        ...filters,
        format: 'csv' as const
      }
      
      const blob = await exportPayments(exportFilters).unwrap()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Payments exported successfully')
    } catch (error: any) {
      console.error('Export error:', error)
      toast.error('Failed to export payments')
    }
  }

  const handleApplyFilters = () => {
    const newFilters: PaymentFilters = {}
    
    if (statusFilter !== 'all') newFilters.payment_status = statusFilter
    if (methodFilter !== 'all') newFilters.payment_method = methodFilter
    if (dateRange.from) newFilters.date_from = dateRange.from
    if (dateRange.to) newFilters.date_to = dateRange.to
    if (searchTerm) newFilters.search = searchTerm
    
    setFilters(newFilters)
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setStatusFilter('all')
    setMethodFilter('all')
    setDateRange({ from: '', to: '' })
    setShowFilters(false)
  }

  const handleViewDetails = (bookingId: number) => {
    setSelectedPaymentBookingId(bookingId)
    setShowDetailsModal(true)
    setActionMenu(null)
  }

  const handleRefresh = () => {
    refetch()
    refetchStats()
    toast.success('Data refreshed successfully')
  }

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle size={16} />
      case 'pending': return <Clock size={16} />
      case 'failed': return <XCircle size={16} />
      case 'refunded': return <DollarSign size={16} />
      default: return <Clock size={16} />
    }
  }

  const getMethodColor = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'card': return 'bg-purple-100 text-purple-800'
      case 'mpesa': return 'bg-green-100 text-green-800'
      case 'cash': return 'bg-orange-100 text-orange-800'
      case 'stripe': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'card': return <CreditCard size={16} />
      case 'mpesa': return <Smartphone size={16} />
      case 'cash': return <DollarSign size={16} />
      case 'stripe': return <Landmark size={16} />
      default: return <CreditCard size={16} />
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0)
  }

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-600 text-lg">Loading payment data...</p>
        <p className="text-gray-400 text-sm mt-2">Fetching payment records from server</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Payments</h3>
        <p className="text-gray-600 text-center max-w-md mb-4">
          {error?.toString() || 'Failed to load payment data. Please check your connection.'}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Make sure your payment API endpoints are properly configured.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => refetch()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Retry
          </button>
        </div>
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
              Payment Management
            </h1>
            <p className="text-gray-600 mt-1">
              {payments.length} payment{payments.length !== 1 ? 's' : ''} • Total: {formatCurrency(calculatedStats.total_revenue)}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button 
              onClick={handleExportPayments}
              disabled={payments.length === 0 || isExporting}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <BarChart3 size={20} />
              )}
              Export Report
            </button>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-1">
                {formatCurrency(calculatedStats.total_revenue)}
              </h3>
            </div>
            <DollarSign size={32} className="text-blue-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Completed</p>
              <h3 className="text-3xl font-bold mt-1">
                {calculatedStats.completed_payments}
              </h3>
            </div>
            <CheckCircle size={32} className="text-green-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Pending</p>
              <h3 className="text-3xl font-bold mt-1">
                {calculatedStats.pending_payments}
              </h3>
            </div>
            <Clock size={32} className="text-orange-200" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Failed</p>
              <h3 className="text-3xl font-bold mt-1">
                {calculatedStats.failed_payments}
              </h3>
            </div>
            <XCircle size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search payments by user name, email, transaction ID, booking ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
            >
              <Filter size={20} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button 
              onClick={handleClearFilters}
              disabled={!Object.keys(filters).length && !searchTerm && statusFilter === 'all' && methodFilter === 'all'}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Methods</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method === 'stripe' ? 'Stripe' : 
                       method === 'card' ? 'Credit Card' : 
                       method === 'mpesa' ? 'M-Pesa' : 
                       method === 'cash' ? 'Cash' : method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleApplyFilters}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Filter size={16} />
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Payment ID</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Booking ID</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Method</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          #{payment.payment_id}
                        </div>
                        {payment.transaction_id && (
                          <div className="text-xs text-gray-500 font-mono truncate max-w-[150px]" title={payment.transaction_id}>
                            {payment.transaction_id.substring(0, 20)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {payment.user_name || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-[200px]" title={payment.user_email}>
                          {payment.user_email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        #{payment.booking_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xl font-bold text-blue-600">
                        {formatCurrency(payment.amount || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getMethodColor(payment.payment_method)}`}>
                        {getMethodIcon(payment.payment_method)}
                        {payment.payment_method === 'stripe' ? 'Stripe' : 
                         payment.payment_method === 'card' ? 'Credit Card' : 
                         payment.payment_method === 'mpesa' ? 'M-Pesa' : 
                         payment.payment_method === 'cash' ? 'Cash' : 
                         payment.payment_method || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(payment.payment_status)}`}>
                        {getStatusIcon(payment.payment_status)}
                        {payment.payment_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDateTime(payment.created_at)}
                      </div>
                      {payment.updated_at !== payment.created_at && (
                        <div className="text-xs text-gray-500">
                          Updated: {formatDateTime(payment.updated_at)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(payment.booking_id)}
                          className="p-2 hover:bg-blue-100 rounded-xl transition-colors text-blue-600"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        
                        <div className="relative">
                          <button
                            onClick={() => setActionMenu(actionMenu === payment.payment_id ? null : payment.payment_id)}
                            disabled={isUpdatingStatus || isRefunding}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                            title="More Actions"
                          >
                            <MoreVertical size={18} className="text-gray-400" />
                          </button>
                          
                          {actionMenu === payment.payment_id && (
                            <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 min-w-[200px]">
                              <button 
                                onClick={() => handleViewDetails(payment.booking_id)}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-t-xl"
                              >
                                <FileText size={16} />
                                View Details
                              </button>
                              {payment.payment_status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => handleUpdateStatus(payment.payment_id, 'Completed')}
                                    className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-2 text-green-700"
                                  >
                                    <CheckCircle size={16} />
                                    Mark as Completed
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateStatus(payment.payment_id, 'Failed')}
                                    className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-700"
                                  >
                                    <XCircle size={16} />
                                    Mark as Failed
                                  </button>
                                </>
                              )}
                              {payment.payment_status === 'Completed' && (
                                <button 
                                  onClick={() => handleRefundPayment(payment.payment_id)}
                                  className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-2 text-orange-700"
                                >
                                  <DollarSign size={16} />
                                  Process Refund
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <DollarSign className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">No payments found</p>
                    <p className="text-gray-400">Try adjusting your search or filters</p>
                    {payments.length > 0 && (
                      <p className="text-sm text-gray-400 mt-2">
                        Found {payments.length} payment{payments.length !== 1 ? 's' : ''} total, but none match your filters
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {filteredPayments.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {filteredPayments.length} of {payments.length} payment{payments.length !== 1 ? 's' : ''}
              </div>
              <div className="text-sm text-gray-600">
                Total: {formatCurrency(filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        paymentId={selectedPaymentBookingId}
      />
    </div>
  )
}

export default PaymentManagement