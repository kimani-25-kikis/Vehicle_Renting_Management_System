// components/admin/UserManagement.tsx
import React, { useState, useEffect } from 'react'
import { 
  Users, Search, Filter, Edit, Trash2, Eye, 
  Shield, Mail, Phone, Calendar, CheckCircle, 
  XCircle, MoreVertical, Download, 
  Plus, RefreshCw, UserPlus, Loader,
  Crown, TrendingUp,
  Activity, Globe, Lock, Unlock,
  MessageSquare, Bell, 
  Grid, List, 
  Target, Award, Trophy,
  ChevronDown, ChevronUp,
  UserCheck, UserX, UserCog,
  Sparkles, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// Use your existing userApi
import { 
  useGetAllUsersQuery,
  useUpdateUsersDetailsMutation,
  useUpdateUserTypeStatusMutation,
  useDeleteUserMutation,
  useCreateUserMutation,  
} from '../../features/api/UserApi'

// Interface matching EXACTLY what's in your database
interface User {
  user_id: number
  first_name: string
  last_name: string
  email: string
  password?: string
  phone_number?: string
  address?: string
  user_type: 'customer' | 'admin'
  created_at: string
  updated_at: string
}

// Formatting functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const UserManagement: React.FC = () => {
  // API Hooks
  const { 
    data: users = [], 
    isLoading, 
    error, 
    refetch 
  } = useGetAllUsersQuery()
  
  const [updateUserDetails] = useUpdateUsersDetailsMutation()
  const [updateUserType] = useUpdateUserTypeStatusMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [createUser] = useCreateUserMutation()

  // States
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null)
  const [showEditModal, setShowEditModal] = useState<User | null>(null)

  // New user form state
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    user_type: 'customer' as 'customer' | 'admin'
  })

  // Calculate new users today
  const getNewUsersToday = () => {
    const today = new Date().toDateString()
    return users.filter(user => 
      new Date(user.created_at).toDateString() === today
    ).length
  }

  // Stats calculations
  const totalUsers = users.length
  const adminCount = users.filter(u => u.user_type === 'admin').length
  const customerCount = users.filter(u => u.user_type === 'customer').length
  const newToday = getNewUsersToday()

  // Handle API errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to load users', {
        icon: <XCircle className="text-red-500" />,
        action: {
          label: 'Retry',
          onClick: () => refetch()
        }
      })
    }
  }, [error, refetch])

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || user.user_type === roleFilter
    
    return matchesSearch && matchesRole
  })

  // CRUD Operations
  const handleCreateUser = async () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all required fields')
      return
    }

    if (newUser.password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    try {
      setIsProcessing(-1)
      
      await createUser({
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        phone_number: newUser.phone_number || undefined,
        password: newUser.password,
        user_type: newUser.user_type,
      }).unwrap()
      
      toast.success('User created successfully!', {
        icon: <UserPlus className="text-green-500" />,
      })
      
      setShowNewUserModal(false)
      setNewUser({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        user_type: 'customer'
      })
      
      refetch()
    } catch (error: any) {
      toast.error('Failed to create user', {
        description: error?.data?.error || error?.data?.message || 'Please try again'
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleUpdateUser = async (user: User, updatedData: Partial<User>) => {
    if (!user) return

    setIsProcessing(user.user_id)
    try {
      await updateUserDetails({
        user_id: user.user_id,
        ...updatedData
      }).unwrap()
      
      toast.success('User updated successfully!', {
        icon: <CheckCircle className="text-green-500" />,
      })
      setShowEditModal(null)
    } catch (error: any) {
      toast.error('Failed to update user', {
        description: error?.data?.message || 'Please try again'
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    setIsProcessing(userId)
    try {
      await deleteUser(userId).unwrap()
      toast.success('User deleted successfully!', {
        icon: <Trash2 className="text-red-500" />,
      })
      setShowDeleteModal(null)
    } catch (error: any) {
      toast.error('Failed to delete user', {
        description: error?.data?.message || 'Please try again'
      })
    } finally {
      setIsProcessing(null)
      setActionMenu(null)
    }
  }

  // FIXED: Role update function - Use updateUserDetails instead of updateUserType

// Single function for updating any user field including role
const handleUpdateRole = async (userId: number, currentRole: string) => {
    setIsProcessing(userId)
    const newRole = currentRole === 'admin' ? 'customer' : 'admin'
    
    try {
      // Now updateUserDetails can handle user_type
      const response = await updateUserDetails({
        user_id: userId,
        user_type: newRole
      }).unwrap()
      
      toast.success(`User role updated to ${newRole === 'admin' ? 'Administrator' : 'Customer'}!`, {
        icon: <Shield className="text-orange-500" />,
      })
      refetch() // Refresh the user list
    } catch (error: any) {
      console.error('Role update error:', error)
      toast.error('Failed to update user role', {
        description: error?.data?.message || error?.data?.error || 'Please try again'
      })
    } finally {
      setIsProcessing(null)
      setActionMenu(null)
    }
}

  const handleBulkAction = async (action: 'delete' | 'makeAdmin' | 'makeCustomer') => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first')
      return
    }

    setIsProcessing(-1)

    try {
      switch (action) {
        case 'delete':
          await Promise.all(
            selectedUsers.map(userId => 
              deleteUser(userId).unwrap()
            )
          )
          toast.success(`${selectedUsers.length} users deleted!`, {
            icon: <Trash2 className="text-red-500" />,
          })
          break
        
        case 'makeAdmin':
          await Promise.all(
            selectedUsers.map(userId => 
              updateUserDetails({ 
                user_id: userId, 
                user_type: 'admin' // FIX: Use updateUserDetails
              }).unwrap()
            )
          )
          toast.success(`${selectedUsers.length} users promoted to admin!`, {
            icon: <Crown className="text-yellow-500" />,
          })
          break
        
        case 'makeCustomer':
          await Promise.all(
            selectedUsers.map(userId => 
              updateUserDetails({ 
                user_id: userId, 
                user_type: 'customer' // FIX: Use updateUserDetails
              }).unwrap()
            )
          )
          toast.success(`${selectedUsers.length} admins demoted to customer!`, {
            icon: <Users className="text-blue-500" />,
          })
          break
      }
      setSelectedUsers([])
    } catch (error: any) {
      toast.error(`Failed to perform bulk ${action}`, {
        description: error?.data?.message || 'Some actions may have failed'
      })
    } finally {
      setIsProcessing(null)
    }
  }

  // Get status color
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
      case 'customer':
        return 'bg-blue-50 text-blue-700 border border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6"
          >
            <Users className="text-blue-600" size={48} />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading User Data</h3>
          <p className="text-gray-600">Please wait while we fetch user information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] pt-20">
      {/* Header with spacing */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-blue-900 mb-2">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage and monitor all user accounts in the system
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewUserModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              <span>Create User</span>
            </button>
            <button
              onClick={() => refetch()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard with hover effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Users Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <Activity className="text-green-500" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {totalUsers}
          </h3>
          <p className="text-gray-600 text-sm mb-2">Total Users</p>
          <div className="flex items-center gap-1 text-green-600 text-xs">
            <TrendingUp size={12} />
            <span>All active accounts</span>
          </div>
        </div>

        {/* Admins Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Crown className="text-yellow-600" size={20} />
            </div>
            <Shield className="text-yellow-500" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {adminCount}
          </h3>
          <p className="text-gray-600 text-sm mb-2">Administrators</p>
          <div className="flex items-center gap-1 text-yellow-600 text-xs">
            <Crown size={12} />
            <span>System administrators</span>
          </div>
        </div>

        {/* Regular Customers Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserCheck className="text-purple-600" size={20} />
            </div>
            <Globe className="text-purple-500" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {customerCount}
          </h3>
          <p className="text-gray-600 text-sm mb-2">Customers</p>
          <div className="flex items-center gap-1 text-purple-600 text-xs">
            <UserCheck size={12} />
            <span>Customer accounts</span>
          </div>
        </div>

        {/* New Today Card - Added */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Sparkles className="text-green-600" size={20} />
            </div>
            <Clock className="text-green-500" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {newToday}
          </h3>
          <p className="text-gray-600 text-sm mb-2">New Today</p>
          <div className="flex items-center gap-1 text-green-600 text-xs">
            <TrendingUp size={12} />
            <span>Registered today</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 text-sm"
            >
              <Filter size={16} />
              Filters
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} selected
                </span>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Role Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  User Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="customer">Customers</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>

              {/* Date Joined */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Joined Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  disabled
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setRoleFilter('all')
                    setShowFilters(false)
                  }}
                  className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex-1"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex-1"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table - Professional and compact */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {error ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <XCircle className="mx-auto text-red-500 mb-3" size={40} />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Users</h3>
                <p className="text-gray-600 text-sm mb-3">Failed to load user data.</p>
                <button
                  onClick={() => refetch()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-300 mb-3" size={40} />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No users found</h3>
              <p className="text-gray-600 text-sm">Try adjusting your filters or create a new user.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(user => user.user_id))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    User Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.user_id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.user_id)}
                        onChange={() => {
                          if (selectedUsers.includes(user.user_id)) {
                            setSelectedUsers(prev => prev.filter(id => id !== user.user_id))
                          } else {
                            setSelectedUsers(prev => [...prev, user.user_id])
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-medium text-sm">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: #{user.user_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900 truncate max-w-[150px]">
                          <Mail size={12} className="text-gray-400 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone_number && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 truncate max-w-[150px]">
                            <Phone size={10} className="text-gray-400 flex-shrink-0" />
                            <span className="truncate">{user.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getRoleColor(user.user_type)}`}>
                        {user.user_type === 'admin' ? <Crown size={10} /> : <Users size={10} />}
                        <span>{user.user_type === 'admin' ? 'Admin' : 'Customer'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowEditModal(user)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Edit User"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleUpdateRole(user.user_id, user.user_type)}
                          className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
                          title={user.user_type === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
                        >
                          <Shield size={14} />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(user.user_id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-blue-50">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{selectedUsers.length}</span> users selected
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('makeAdmin')}
                disabled={isProcessing === -1}
                className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium text-xs transition-colors disabled:opacity-70"
              >
                {isProcessing === -1 ? 'Processing...' : 'Make Admins'}
              </button>
              <button
                onClick={() => handleBulkAction('makeCustomer')}
                disabled={isProcessing === -1}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs transition-colors disabled:opacity-70"
              >
                {isProcessing === -1 ? 'Processing...' : 'Make Customers'}
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={isProcessing === -1}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-xs transition-colors disabled:opacity-70"
              >
                {isProcessing === -1 ? 'Processing...' : 'Delete'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        {filteredUsers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredUsers.length}</span> of{' '}
              <span className="font-medium">{users.length}</span> users
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showNewUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowNewUserModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <UserPlus className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Create New User</h3>
                </div>
                <button
                  onClick={() => setShowNewUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={newUser.first_name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={newUser.last_name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newUser.phone_number}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone_number: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter a secure password"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={newUser.user_type}
                    onChange={(e) => setNewUser(prev => ({ ...prev, user_type: e.target.value as 'customer' | 'admin' }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowNewUserModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-70"
                >
                  Create User
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowEditModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Edit className="text-blue-600" size={20} />
                  <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                </div>
                <button
                  onClick={() => setShowEditModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue={showEditModal.first_name}
                      onChange={(e) => setShowEditModal(prev => prev ? { ...prev, first_name: e.target.value } : null)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue={showEditModal.last_name}
                      onChange={(e) => setShowEditModal(prev => prev ? { ...prev, last_name: e.target.value } : null)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={showEditModal.email}
                    onChange={(e) => setShowEditModal(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue={showEditModal.phone_number || ''}
                    onChange={(e) => setShowEditModal(prev => prev ? { ...prev, phone_number: e.target.value } : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    defaultValue={showEditModal.user_type}
                    onChange={(e) => setShowEditModal(prev => prev ? { ...prev, user_type: e.target.value as 'customer' | 'admin' } : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateUser(showEditModal, {
                    first_name: showEditModal.first_name,
                    last_name: showEditModal.last_name,
                    email: showEditModal.email,
                    phone_number: showEditModal.phone_number || '',
                    user_type: showEditModal.user_type
                  })}
                  disabled={isProcessing === showEditModal.user_id}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-70"
                >
                  {isProcessing === showEditModal.user_id ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Delete User?</h3>
                <p className="text-gray-600 text-sm mb-6">
                  This action cannot be undone. The user will be permanently removed from the system.
                </p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(showDeleteModal)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default UserManagement