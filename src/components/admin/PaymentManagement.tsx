// PaymentManagement.tsx
import React, { useState, useEffect } from 'react'
import {
  useGetAllPaymentsQuery,
  useGetPaymentStatsQuery,
  useUpdatePaymentStatusMutation,
  useRefundPaymentMutation,
  useExportPaymentsMutation,
  type Payment,
  type PaymentFilters,
  type PaymentStats
} from '../../features/api/PaymentApi'
import {
  CreditCard, DollarSign, TrendingUp, Calendar,
  CheckCircle, Clock, XCircle, RefreshCw, Filter,
  Download, BarChart3, PieChart, Smartphone, AlertCircle,
  Loader, Search, ChevronDown, ChevronUp, Eye, Shield,
  Users, Receipt, FileText, MoreVertical, Trash2,
  Edit, Printer, ExternalLink, Ban, Check, X
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

const PaymentManagement: React.FC = () => {
  // State for filters
  const [filters, setFilters] = useState<PaymentFilters>({
    payment_status: undefined,
    payment_method: undefined,
    date_from: undefined,
    date_to: undefined,
    search: undefined
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPayments, setSelectedPayments] = useState<number[]>([])
  const [showRefundModal, setShowRefundModal] = useState<Payment | null>(null)
  const [showStatusModal, setShowStatusModal] = useState<Payment | null>(null)
  const [newStatus, setNewStatus] = useState<string>('')
  const [refundReason, setRefundReason] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // API calls
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments
  } = useGetAllPaymentsQuery(filters)

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats
  } = useGetPaymentStatsQuery()

  const [updatePaymentStatus, { isLoading: isUpdatingStatus }] = useUpdatePaymentStatusMutation()
  const [refundPayment, { isLoading: isRefunding }] = useRefundPaymentMutation()
  const [exportPayments, { isLoading: isExporting }] = useExportPaymentsMutation()

  const payments: Payment[] = paymentsData?.data || []
  const stats: PaymentStats = statsData?.stats || {
    total_revenue: 0,
    completed_payments: 0,
    pending_payments: 0,
    failed_payments: 0,
    refunded_amount: 0,
    today_revenue: 0,
    monthly_revenue: 0
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return 'Invalid date'
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle size={14} className="text-green-600" />
      case 'pending':
        return <Clock size={14} className="text-yellow-600" />
      case 'failed':
        return <XCircle size={14} className="text-red-600" />
      case 'refunded':
        return <RefreshCw size={14} className="text-purple-600" />
      default:
        return <AlertCircle size={14} className="text-gray-600" />
    }
  }

  // Get payment method icon
  const getPaymentMethodIcon = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'stripe':
        return <CreditCard className="text-blue-600" size={16} />
      case 'mpesa':
        return <Smartphone className="text-green-600" size={16} />
      default:
        return <CreditCard className="text-gray-600" size={16} />
    }
  }

  // Handle filter change
  const handleFilterChange = (key: keyof PaymentFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
    setPage(1)
  }

  // Handle date range preset
  const handleDatePreset = (preset: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date()
    let fromDate = new Date()

    switch (preset) {
      case 'today':
        fromDate = today
        break
      case 'week':
        fromDate.setDate(today.getDate() - 7)
        break
      case 'month':
        fromDate.setMonth(today.getMonth() - 1)
        break
      case 'year':
        fromDate.setFullYear(today.getFullYear() - 1)
        break
    }

    setFilters(prev => ({
      ...prev,
      date_from: format(fromDate, 'yyyy-MM-dd'),
      date_to: format(today, 'yyyy-MM-dd')
    }))
  }

  // Handle refresh
  const handleRefresh = () => {
    refetchPayments()
    refetchStats()
    toast.success('Payments data refreshed!')
  }

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await exportPayments({
        ...filters,
        format: 'csv'
      }).unwrap()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Payments exported successfully!')
    } catch (error) {
      toast.error('Failed to export payments')
    }
  }

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!showStatusModal || !newStatus) return

    try {
      await updatePaymentStatus({
        payment_id: showStatusModal.payment_id,
        payment_status: newStatus as any
      }).unwrap()

      toast.success(`Payment status updated to ${newStatus}`)
      setShowStatusModal(null)
      setNewStatus('')
      refetchPayments()
    } catch (error) {
      toast.error('Failed to update payment status')
    }
  }

  // Handle refund
  const handleRefund = async () => {
    if (!showRefundModal) return

    try {
      await refundPayment({
        payment_id: showRefundModal.payment_id,
        refund_reason: refundReason
      }).unwrap()

      toast.success('Payment refunded successfully!')
      setShowRefundModal(null)
      setRefundReason('')
      refetchPayments()
      refetchStats()
    } catch (error) {
      toast.error('Failed to process refund')
    }
  }

  // Toggle payment selection
  const togglePaymentSelection = (paymentId: number) => {
    setSelectedPayments(prev =>
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    )
  }

  // Select all payments
  const selectAllPayments = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([])
    } else {
      setSelectedPayments(payments.map(p => p.payment_id))
    }
  }

  // Clear filters
  const clearFilters = () => {
    setFilters({
      payment_status: undefined,
      payment_method: undefined,
      date_from: undefined,
      date_to: undefined,
      search: undefined
    })
  }

  if (paymentsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Payments</h2>
          <p className="text-gray-600 mb-6">Failed to load payment data. Please try again.</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Payment Management
            </h1>
            <p className="text-gray-600">
              Monitor and manage all payment transactions in the system
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg disabled:opacity-70"
            >
              {isExporting ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Download size={18} />
              )}
              Export CSV
            </button>
            <button
              onClick={handleRefresh}
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(stats.total_revenue)}
          </h3>
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
            <TrendingUp size={12} />
            {formatCurrency(stats.today_revenue)} today
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <BarChart3 className="text-blue-600" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(stats.monthly_revenue)}
          </h3>
          <p className="text-gray-600 text-sm">Monthly Revenue</p>
        </div>

        {/* Payment Status Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <PieChart className="text-white" size={24} />
            </div>
            <Users className="text-purple-600" size={24} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-bold text-green-600">{stats.completed_payments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-bold text-yellow-600">{stats.pending_payments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failed</span>
              <span className="font-bold text-red-600">{stats.failed_payments}</span>
            </div>
          </div>
        </div>

        {/* Refunds */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Receipt className="text-white" size={24} />
            </div>
            <Shield className="text-orange-600" size={24} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(stats.refunded_amount)}
          </h3>
          <p className="text-gray-600 text-sm">Total Refunds</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              <Filter size={20} />
              Filters
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {selectedPayments.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedPayments.length} selected
                </span>
                <button
                  onClick={() => setSelectedPayments([])}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search payments..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full lg:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={filters.payment_status || 'all'}
                  onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              {/* Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={filters.payment_method || 'all'}
                  onChange={(e) => handleFilterChange('payment_method', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Methods</option>
                  <option value="stripe">Stripe (Card)</option>
                  <option value="mpesa">M-Pesa</option>
                </select>
              </div>

              {/* Date Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Date Range
                </label>
                <select
                  onChange={(e) => handleDatePreset(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Range</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          {paymentsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="animate-spin text-blue-600" size={40} />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No payments found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedPayments.length === payments.length && payments.length > 0}
                      onChange={selectAllPayments}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px 6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.payment_id)}
                        onChange={() => togglePaymentSelection(payment.payment_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        #{payment.payment_id}
                      </div>
                      <div className="text-xs text-gray-500">
                        Booking #{payment.booking_id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.user_name || `User #${payment.user_id}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.user_email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(payment.payment_status)}`}>
                        {getStatusIcon(payment.payment_status)}
                        {payment.payment_status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.payment_method)}
                        <span className="text-sm text-gray-700 capitalize">
                          {payment.payment_method || 'Unknown'}
                        </span>
                      </div>
                      {payment.transaction_id && (
                        <div className="text-xs text-gray-500 truncate max-w-[120px]">
                          {payment.transaction_id.slice(0, 20)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(payment.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowStatusModal(payment)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                          title="Change Status"
                        >
                          <Edit size={16} />
                        </button>
                        {payment.payment_status === 'Completed' && (
                          <button
                            onClick={() => setShowRefundModal(payment)}
                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg"
                            title="Refund Payment"
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                        <button
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {payments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-bold">1-{Math.min(payments.length, pageSize)}</span> of{' '}
              <span className="font-bold">{payments.length}</span> payments
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= payments.length}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center gap-3 mb-6">
              <Edit className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Update Payment Status</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Payment #{showStatusModal.payment_id} • {formatCurrency(showStatusModal.amount)}
              </p>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowStatusModal(null)
                  setNewStatus('')
                }}
                className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || isUpdatingStatus}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:opacity-70"
              >
                {isUpdatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-orange-600" size={24} />
              <h3 className="text-xl font-bold text-gray-900">Refund Payment</h3>
            </div>
            
            <div className="mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                <p className="text-orange-800 font-semibold mb-2">Payment Details:</p>
                <p className="text-orange-700">
                  Payment #{showRefundModal.payment_id} • {formatCurrency(showRefundModal.amount)}
                </p>
                <p className="text-orange-600 text-sm mt-2">
                  Customer: {showRefundModal.user_name || `User #${showRefundModal.user_id}`}
                </p>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Reason (Optional)
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
                className="w-full h-32 border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowRefundModal(null)
                  setRefundReason('')
                }}
                className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={isRefunding}
                className="px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all disabled:opacity-70"
              >
                {isRefunding ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentManagement