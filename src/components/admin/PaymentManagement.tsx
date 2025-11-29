// components/admin/PaymentManagement.tsx
import React, { useState, useEffect } from 'react'
import { 
  DollarSign, Search, Filter, Download, Eye, 
  CheckCircle, XCircle, Clock, TrendingUp,
  Users, Calendar, CreditCard, Smartphone,
  MoreVertical, RefreshCw, BarChart3, Shield,
  Mail, FileText, AlertTriangle, DownloadCloud
} from 'lucide-react'
import { toast } from 'sonner'

interface Payment {
  payment_id: number
  booking_id: number
  user_id: number
  user_name: string
  user_email: string
  vehicle_name: string
  amount: number
  payment_method: 'card' | 'mpesa' | 'cash'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  created_at: string
  processed_at?: string
  refund_amount?: number
  refund_reason?: string
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'failed' | 'refunded'>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | 'card' | 'mpesa' | 'cash'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [selectedPayments, setSelectedPayments] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        payment_id: 1,
        booking_id: 1,
        user_id: 1,
        user_name: 'John Doe',
        user_email: 'john.doe@example.com',
        vehicle_name: 'Toyota Camry 2023',
        amount: 135,
        payment_method: 'card',
        payment_status: 'completed',
        transaction_id: 'txn_123456789',
        created_at: '2024-03-20T14:30:00',
        processed_at: '2024-03-20T14:31:00'
      },
      {
        payment_id: 2,
        booking_id: 2,
        user_id: 2,
        user_name: 'Sarah Wilson',
        user_email: 'sarah.wilson@example.com',
        vehicle_name: 'Mercedes E-Class 2024',
        amount: 240,
        payment_method: 'mpesa',
        payment_status: 'completed',
        transaction_id: 'MPE2345678901',
        created_at: '2024-03-18T10:15:00',
        processed_at: '2024-03-18T10:16:00'
      },
      {
        payment_id: 3,
        booking_id: 3,
        user_id: 3,
        user_name: 'Mike Johnson',
        user_email: 'mike.johnson@example.com',
        vehicle_name: 'Land Rover Range Rover',
        amount: 450,
        payment_method: 'card',
        payment_status: 'pending',
        created_at: '2024-03-21T09:45:00'
      },
      {
        payment_id: 4,
        booking_id: 4,
        user_id: 4,
        user_name: 'Emily Davis',
        user_email: 'emily.davis@example.com',
        vehicle_name: 'Toyota Camry 2023',
        amount: 90,
        payment_method: 'mpesa',
        payment_status: 'failed',
        transaction_id: 'MPE3456789012',
        created_at: '2024-03-15T16:20:00'
      },
      {
        payment_id: 5,
        booking_id: 5,
        user_id: 5,
        user_name: 'David Brown',
        user_email: 'david.brown@example.com',
        vehicle_name: 'BMW X5 2023',
        amount: 180,
        payment_method: 'card',
        payment_status: 'refunded',
        transaction_id: 'txn_987654321',
        created_at: '2024-03-10T11:30:00',
        processed_at: '2024-03-10T11:31:00',
        refund_amount: 180,
        refund_reason: 'Customer cancellation'
      }
    ]
    setPayments(mockPayments)
    setLoading(false)
  }, [])

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.booking_id.toString().includes(searchTerm) ||
      payment.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.payment_status === statusFilter
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const handleProcessPayment = (paymentId: number) => {
    toast.success(`Payment #${paymentId} processed successfully`)
    setPayments(prev => prev.map(payment => 
      payment.payment_id === paymentId ? { 
        ...payment, 
        payment_status: 'completed',
        processed_at: new Date().toISOString()
      } : payment
    ))
    setActionMenu(null)
  }

  const handleRefundPayment = (paymentId: number) => {
    toast.success(`Refund initiated for payment #${paymentId}`)
    setPayments(prev => prev.map(payment => 
      payment.payment_id === paymentId ? { 
        ...payment, 
        payment_status: 'refunded',
        refund_amount: payment.amount,
        refund_reason: 'Admin initiated refund'
      } : payment
    ))
    setActionMenu(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} />
      case 'pending': return <Clock size={16} />
      case 'failed': return <XCircle size={16} />
      case 'refunded': return <DollarSign size={16} />
      default: return <Clock size={16} />
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'card': return 'bg-purple-100 text-purple-800'
      case 'mpesa': return 'bg-green-100 text-green-800'
      case 'cash': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard size={16} />
      case 'mpesa': return <Smartphone size={16} />
      case 'cash': return <DollarSign size={16} />
      default: return <CreditCard size={16} />
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

  const calculateRevenue = () => {
    return payments
      .filter(p => p.payment_status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0)
  }

  const calculatePending = () => {
    return payments
      .filter(p => p.payment_status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0)
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
              Payment Management
            </h1>
            <p className="text-gray-600 mt-1">Monitor and manage all payment transactions</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              <BarChart3 size={20} />
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
              <p className="text-blue-100">Total Revenue</p>
              <h3 className="text-3xl font-bold mt-1">${calculateRevenue()}</h3>
            </div>
            <DollarSign size={32} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Completed</p>
              <h3 className="text-3xl font-bold mt-1">
                {payments.filter(p => p.payment_status === 'completed').length}
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
                {payments.filter(p => p.payment_status === 'pending').length}
              </h3>
            </div>
            <Clock size={32} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Pending Amount</p>
              <h3 className="text-3xl font-bold mt-1">${calculatePending()}</h3>
            </div>
            <TrendingUp size={32} className="text-purple-200" />
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
                placeholder="Search payments by user, transaction ID, or booking..."
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
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>

              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Methods</option>
                <option value="card">Credit Card</option>
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
              </select>

              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              <DownloadCloud size={20} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Transaction</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Customer</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Vehicle</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Method</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.payment_id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">
                        #{payment.payment_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        Booking #{payment.booking_id}
                      </div>
                      {payment.transaction_id && (
                        <div className="text-xs text-gray-400 font-mono">
                          {payment.transaction_id}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {payment.user_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.user_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{payment.vehicle_name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-xl font-bold text-blue-600">
                        ${payment.amount}
                      </div>
                      {payment.refund_amount && (
                        <div className="text-sm text-red-600 line-through">
                          -${payment.refund_amount}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getMethodColor(payment.payment_method)}`}>
                      {getMethodIcon(payment.payment_method)}
                      {payment.payment_method.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(payment.payment_status)}`}>
                      {getStatusIcon(payment.payment_status)}
                      {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {formatDateTime(payment.created_at)}
                    </div>
                    {payment.processed_at && (
                      <div className="text-xs text-gray-500">
                        Processed: {formatDateTime(payment.processed_at)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-blue-100 rounded-xl transition-colors text-blue-600">
                        <Eye size={18} />
                      </button>
                      
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === payment.payment_id ? null : payment.payment_id)}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <MoreVertical size={18} className="text-gray-400" />
                        </button>
                        
                        {actionMenu === payment.payment_id && (
                          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 min-w-[200px]">
                            <button className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-t-xl">
                              <FileText size={16} />
                              View Details
                            </button>
                            {payment.payment_status === 'pending' && (
                              <button 
                                onClick={() => handleProcessPayment(payment.payment_id)}
                                className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-2 text-green-700"
                              >
                                <CheckCircle size={16} />
                                Mark as Paid
                              </button>
                            )}
                            {payment.payment_status === 'completed' && (
                              <button 
                                onClick={() => handleRefundPayment(payment.payment_id)}
                                className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-2 text-orange-700"
                              >
                                <DollarSign size={16} />
                                Process Refund
                              </button>
                            )}
                            <button className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
                              <Mail size={16} />
                              Send Receipt
                            </button>
                            <button className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600 rounded-b-xl">
                              <AlertTriangle size={16} />
                              Report Issue
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No payments found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {['card', 'mpesa', 'cash'].map(method => (
              <div key={method} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-700">
                  {getMethodIcon(method)}
                  {method.toUpperCase()}
                </span>
                <span className="font-semibold text-blue-600">
                  {payments.filter(p => p.payment_method === method).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Overview</h3>
          <div className="space-y-3">
            {['completed', 'pending', 'failed', 'refunded'].map(status => (
              <div key={status} className="flex items-center justify-between">
                <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="font-semibold text-blue-600">
                  {payments.filter(p => p.payment_status === status).length}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
              <Download size={16} />
              Export Report
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
              <BarChart3 size={16} />
              View Analytics
            </button>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
              <Shield size={16} />
              Security Logs
            </button>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div className="text-gray-600">
            Showing 1-{filteredPayments.length} of {payments.length} payments
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

export default PaymentManagement