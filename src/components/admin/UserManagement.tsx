// components/admin/UserManagement.tsx
import React, { useState, useEffect } from 'react'
import { 
  Users, Search, Filter, Edit, Trash2, Eye, 
  Shield, Mail, Phone, Calendar, CheckCircle, 
  XCircle, MoreVertical, Download, Upload,
  Plus, RefreshCw, UserPlus, Loader,
  Ban, UserCheck, MailCheck, UserX, UserCog,
  Sparkles, Zap, Crown, BadgeCheck, TrendingUp,
  Activity, Globe, Lock, Unlock, CreditCard,
  MessageSquare, Bell, Star, ChevronRight,
  Grid, List, Columns, Sparkle, Rocket,
  Target, Award, Medal, Trophy, Coffee
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
  user_type: 'user' | 'admin'
  created_at: string
  updated_at: string
}

// Animated components
const FloatingCard = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative group"
  >
    {children}
  </motion.div>
)

const GlowingButton = ({ children, onClick, variant = 'primary', className = '' }: any) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl font-bold transition-all duration-300 ${className} ${
      variant === 'primary' 
        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30' 
        : variant === 'danger'
        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/30'
        : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg hover:shadow-xl hover:shadow-gray-500/30'
    }`}
  >
    <span className="relative z-10">{children}</span>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
  </motion.button>
)

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
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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
    user_type: 'user' as 'user' | 'admin'
  })

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
  // Validate required fields
  if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password) {
    toast.error('Please fill in all required fields')
    return
  }

  // Validate password length
  if (newUser.password.length < 8) {
    toast.error('Password must be at least 8 characters long')
    return
  }

  try {
    setIsProcessing(-1)
    
    // Call the createUser mutation
    await createUser({
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      phone_number: newUser.phone_number || undefined,
      password: newUser.password, // Send the password
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
      password: '', // Reset password
      user_type: 'user'
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

  const handleUpdateRole = async (userId: number, newRole: string) => {
    setIsProcessing(userId)
    try {
      await updateUserType({
        user_id: userId,
        user_type: newRole
      }).unwrap()
      
      toast.success(`User role updated to ${newRole}!`, {
        icon: <Shield className="text-orange-500" />,
      })
    } catch (error: any) {
      toast.error('Failed to update user role', {
        description: error?.data?.message || 'Please try again'
      })
    } finally {
      setIsProcessing(null)
      setActionMenu(null)
    }
  }

  const handleBulkAction = async (action: 'delete' | 'makeAdmin' | 'makeUser') => {
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
              updateUserType({ user_id: userId, user_type: 'admin' }).unwrap()
            )
          )
          toast.success(`${selectedUsers.length} users promoted to admin!`, {
            icon: <Crown className="text-yellow-500" />,
          })
          break
        
        case 'makeUser':
          await Promise.all(
            selectedUsers.map(userId => 
              updateUserType({ user_id: userId, user_type: 'user' }).unwrap()
            )
          )
          toast.success(`${selectedUsers.length} admins demoted to user!`, {
            icon: <Users className="text-blue-500" />,
          })
          break
      }
      setSelectedUsers([])
    } catch (error: any) {
      toast.error(`Failed to perform bulk ${action}`, {
        description: 'Some actions may have failed'
      })
    } finally {
      setIsProcessing(null)
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-6"
          >
            <Sparkles className="text-blue-400" size={48} />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading User Universe</h3>
          <p className="text-gray-400">Gathering cosmic user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight 
            }}
            animate={{ 
              y: [null, -50, 50],
              opacity: [0.2, 0.8, 0.2]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.1 
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative space-y-6">
        {/* Header with Animated Stats */}
        <FloatingCard delay={0.1}>
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                    <Users className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      User Galaxy
                    </h1>
                    <p className="text-gray-400 mt-1">Manage your cosmic user community</p>
                  </div>
                </div>
                
                {/* Animated Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Users</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{users.length}</h3>
                      </div>
                      <Users className="text-blue-400" size={20} />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Admins</p>
                        <h3 className="text-2xl font-bold text-white mt-1">
                          {users.filter(u => u.user_type === 'admin').length}
                        </h3>
                      </div>
                      <Crown className="text-yellow-400" size={20} />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Active Today</p>
                        <h3 className="text-2xl font-bold text-white mt-1">
                          {users.length}
                        </h3>
                      </div>
                      <Activity className="text-green-400" size={20} />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Growth</p>
                        <h3 className="text-2xl font-bold text-white mt-1">+12%</h3>
                      </div>
                      <TrendingUp className="text-purple-400" size={20} />
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <GlowingButton 
                  onClick={() => setShowNewUserModal(true)}
                  className="px-6 py-4 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create New User
                </GlowingButton>
                
                <GlowingButton 
                  onClick={() => refetch()}
                  variant="secondary"
                  className="px-6 py-4 flex items-center gap-2"
                >
                  <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                  Refresh Universe
                </GlowingButton>
              </div>
            </div>
          </div>
        </FloatingCard>

        {/* Controls Bar */}
        <FloatingCard delay={0.2}>
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search with Glow Effect */}
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search across the user galaxy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
                >
                  <List size={20} />
                </button>
              </div>

              {/* Role Filter */}
              <div className="flex gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all" className="bg-gray-800">All Roles</option>
                  <option value="customer" className="bg-gray-800">Users</option>
                  <option value="admin" className="bg-gray-800">Admins</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-4 border-t border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-xl font-semibold border border-blue-500/30">
                      {selectedUsers.length} selected
                      {isProcessing === -1 && <Loader className="inline ml-2 animate-spin" size={16} />}
                    </span>
                    
                    <div className="flex gap-2">
                      <GlowingButton
                        onClick={() => handleBulkAction('makeAdmin')}
                        className="px-4 py-2 text-sm"
                      >
                        <Crown size={14} className="mr-2" />
                        Make Admins
                      </GlowingButton>
                      
                      <GlowingButton
                        onClick={() => handleBulkAction('makeUser')}
                        variant="secondary"
                        className="px-4 py-2 text-sm"
                      >
                        <Users size={14} className="mr-2" />
                        Make Users
                      </GlowingButton>
                      
                      <GlowingButton
                        onClick={() => handleBulkAction('delete')}
                        variant="danger"
                        className="px-4 py-2 text-sm"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete Selected
                      </GlowingButton>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedUsers([])}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </FloatingCard>

        {/* Users Display - Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map((user, index) => (
              <FloatingCard key={user.user_id} delay={index * 0.05}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 border border-gray-700 shadow-2xl group hover:border-blue-500/30 transition-all duration-300"
                >
                  {/* User Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                          {user.first_name[0]}{user.last_name[0]}
                        </div>
                        {user.user_type === 'admin' && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Crown size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-gray-400 text-sm">ID: #{user.user_id}</p>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === user.user_id ? null : user.user_id)}
                        className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
                      >
                        <MoreVertical className="text-gray-400" size={20} />
                      </button>
                      
                      <AnimatePresence>
                        {actionMenu === user.user_id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-10 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-10 min-w-[200px] overflow-hidden"
                          >
                            <button 
                              onClick={() => {
                                setShowEditModal(user)
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                            >
                              <Edit size={16} />
                              Edit Profile
                            </button>
                            <button 
                              onClick={() => handleUpdateRole(user.user_id, user.user_type === 'admin' ? 'user' : 'admin')}
                              className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center gap-2 text-gray-300"
                            >
                              <Shield size={16} />
                              {user.user_type === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                            </button>
                            <button 
                              onClick={() => setShowDeleteModal(user.user_id)}
                              className="w-full text-left px-4 py-3 hover:bg-red-900/30 flex items-center gap-2 text-red-400"
                            >
                              <Trash2 size={16} />
                              Delete User
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail size={16} />
                      <span className="text-sm truncate">{user.email}</span>
                    </div>
                    
                    {user.phone_number && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Phone size={16} />
                        <span className="text-sm">{user.phone_number}</span>
                      </div>
                    )}

                    {/* Role Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      user.user_type === 'admin' 
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {user.user_type === 'admin' ? <Crown size={14} /> : <Users size={14} />}
                      {user.user_type === 'admin' ? 'Administrator' : 'Regular User'}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700">
                      <div>
                        <p className="text-gray-500 text-xs">Joined</p>
                        <p className="text-white text-sm">{formatDate(user.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Last Active</p>
                        <p className="text-white text-sm">{formatDate(user.updated_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Select Checkbox */}
                  <div className="absolute top-4 left-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.user_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(prev => [...prev, user.user_id])
                        } else {
                          setSelectedUsers(prev => prev.filter(id => id !== user.user_id))
                        }
                      }}
                      className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                    />
                  </div>
                </motion.div>
              </FloatingCard>
            ))}
          </div>
        )}

        {/* Users Display - List View */}
        {viewMode === 'list' && (
          <FloatingCard delay={0.3}>
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-3xl border border-gray-700 shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
                      <th className="px-8 py-6 text-left">
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
                          className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                        />
                      </th>
                      <th className="px-8 py-6 text-left font-semibold text-gray-300">User</th>
                      <th className="px-8 py-6 text-left font-semibold text-gray-300">Contact</th>
                      <th className="px-8 py-6 text-left font-semibold text-gray-300">Role</th>
                      <th className="px-8 py-6 text-left font-semibold text-gray-300">Last Updated</th>
                      <th className="px-8 py-6 text-left font-semibold text-gray-300">Joined</th>
                      <th className="px-8 py-6 text-left font-semibold text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredUsers.map((user) => (
                      <motion.tr 
                        key={user.user_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.user_id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(prev => [...prev, user.user_id])
                              } else {
                                setSelectedUsers(prev => prev.filter(id => id !== user.user_id))
                              }
                            }}
                            className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                          />
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold">
                              {user.first_name[0]}{user.last_name[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-white">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-gray-400 text-sm">ID: #{user.user_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white">
                              <Mail size={16} className="text-gray-400" />
                              {user.email}
                            </div>
                            {user.phone_number && (
                              <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Phone size={16} className="text-gray-400" />
                                {user.phone_number}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                            user.user_type === 'admin' 
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {user.user_type === 'admin' ? <Crown size={16} /> : <Users size={16} />}
                            {user.user_type}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-gray-300 text-sm">
                          {formatDateTime(user.updated_at)}
                        </td>
                        <td className="px-8 py-6 text-gray-300">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            {formatDate(user.created_at)}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex gap-2">
                            <GlowingButton
                              onClick={() => setShowEditModal(user)}
                              className="px-4 py-2 text-sm"
                            >
                              <Edit size={14} />
                            </GlowingButton>
                            <GlowingButton
                              onClick={() => handleUpdateRole(user.user_id, user.user_type === 'admin' ? 'user' : 'admin')}
                              variant="secondary"
                              className="px-4 py-2 text-sm"
                            >
                              <Shield size={14} />
                            </GlowingButton>
                            <GlowingButton
                              onClick={() => setShowDeleteModal(user.user_id)}
                              variant="danger"
                              className="px-4 py-2 text-sm"
                            >
                              <Trash2 size={14} />
                            </GlowingButton>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-700">
                    <Users className="text-gray-600" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Users Found</h3>
                  <p className="text-gray-400">Try adjusting your search or create a new user</p>
                </div>
              )}
            </div>
          </FloatingCard>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && users.length === 0 && (
          <FloatingCard>
            <div className="text-center py-16">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
              >
                <Rocket className="text-white" size={40} />
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-3">Welcome to User Galaxy!</h3>
              <p className="text-gray-400 mb-8">Your user universe is empty. Launch your first user into orbit!</p>
              <GlowingButton
                onClick={() => setShowNewUserModal(true)}
                className="px-8 py-4 text-lg"
              >
                <Rocket size={20} className="mr-2" />
                Launch First User
              </GlowingButton>
            </div>
          </FloatingCard>
        )}
      </div>

      {/* Create User Modal */}
      {/* Create User Modal */}
<AnimatePresence>
  {showNewUserModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => setShowNewUserModal(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <UserPlus className="text-white" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white">Create New User</h3>
          </div>
          <button
            onClick={() => setShowNewUserModal(false)}
            className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
          >
            <XCircle className="text-gray-400" size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">First Name *</label>
              <input
                type="text"
                value={newUser.first_name}
                onChange={(e) => setNewUser(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Last Name *</label>
              <input
                type="text"
                value={newUser.last_name}
                onChange={(e) => setNewUser(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Email *</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Phone Number</label>
            <input
              type="tel"
              value={newUser.phone_number}
              onChange={(e) => setNewUser(prev => ({ ...prev, phone_number: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 234 567 8900"
            />
          </div>

          {/* ADD PASSWORD FIELD */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Password *</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a secure password"
              required
            />
            <p className="text-gray-500 text-xs mt-2">
              Password must be at least 8 characters long
            </p>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Role</label>
            <select
              value={newUser.user_type}
              onChange={(e) => setNewUser(prev => ({ ...prev, user_type: e.target.value as 'user' | 'admin' }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="user" className="bg-gray-800">User</option>
              <option value="admin" className="bg-gray-800">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <GlowingButton
            onClick={handleCreateUser}
            className="flex-1 py-4"
            disabled={!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password}
          >
            <Sparkle size={20} className="mr-2" />
            Create User
          </GlowingButton>
          <button
            onClick={() => setShowNewUserModal(false)}
            className="px-6 py-4 bg-gray-800 text-gray-300 rounded-2xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Cancel
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl">
                    <Edit className="text-white" size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Edit User</h3>
                </div>
                <button
                  onClick={() => setShowEditModal(null)}
                  className="p-2 hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <XCircle className="text-gray-400" size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue={showEditModal.first_name}
                      onChange={(e) => setShowEditModal(prev => prev ? { ...prev, first_name: e.target.value } : null)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue={showEditModal.last_name}
                      onChange={(e) => setShowEditModal(prev => prev ? { ...prev, last_name: e.target.value } : null)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={showEditModal.email}
                    onChange={(e) => setShowEditModal(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue={showEditModal.phone_number || ''}
                    onChange={(e) => setShowEditModal(prev => prev ? { ...prev, phone_number: e.target.value } : null)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Role</label>
                  <select
                    defaultValue={showEditModal.user_type}
                    onChange={(e) => setShowEditModal(prev => prev ? { ...prev, user_type: e.target.value as 'user' | 'admin' } : null)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user" className="bg-gray-800">User</option>
                    <option value="admin" className="bg-gray-800">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <GlowingButton
                  onClick={() => handleUpdateUser(showEditModal, {
                    first_name: showEditModal.first_name,
                    last_name: showEditModal.last_name,
                    email: showEditModal.email,
                    phone_number: showEditModal.phone_number || '',
                    user_type: showEditModal.user_type
                  })}
                  disabled={isProcessing === showEditModal.user_id}
                  className="flex-1 py-4"
                >
                  {isProcessing === showEditModal.user_id ? (
                    <Loader className="animate-spin mx-auto" size={20} />
                  ) : (
                    <>
                      <CheckCircle size={20} className="mr-2" />
                      Update User
                    </>
                  )}
                </GlowingButton>
                <button
                  onClick={() => setShowEditModal(null)}
                  className="px-6 py-4 bg-gray-800 text-gray-300 rounded-2xl font-semibold hover:bg-gray-700 transition-colors"
                >
                  Cancel
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700 shadow-2xl max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="text-white" size={32} />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">Delete User?</h3>
                <p className="text-gray-400 mb-8">
                  This action cannot be undone. The user will be permanently removed from the system.
                </p>

                <div className="flex gap-3">
                  <GlowingButton
                    onClick={() => handleDeleteUser(showDeleteModal)}
                    variant="danger"
                    className="flex-1 py-4"
                  >
                    {isProcessing === showDeleteModal ? (
                      <Loader className="animate-spin mx-auto" size={20} />
                    ) : (
                      'Yes, Delete'
                    )}
                  </GlowingButton>
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="px-6 py-4 bg-gray-800 text-gray-300 rounded-2xl font-semibold hover:bg-gray-700 transition-colors flex-1"
                  >
                    Cancel
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