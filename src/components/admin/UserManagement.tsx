// components/admin/UserManagement.tsx
import React, { useState, useEffect } from 'react'
import { 
  Users, Search, Filter, Edit, Trash2, Eye, 
  Shield, Mail, Phone, Calendar, CheckCircle, 
  XCircle, MoreVertical, Download, Upload,
  Plus, RefreshCw, UserPlus
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  user_id: number
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  role: string
  created_at: string
  is_active: boolean
  last_login?: string
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockUsers: User[] = [
      {
        user_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '+254712345678',
        role: 'user',
        created_at: '2024-01-15',
        is_active: true,
        last_login: '2024-03-20'
      },
      {
        user_id: 2,
        first_name: 'Sarah',
        last_name: 'Wilson',
        email: 'sarah.wilson@example.com',
        phone_number: '+254723456789',
        role: 'admin',
        created_at: '2024-01-10',
        is_active: true,
        last_login: '2024-03-20'
      },
      {
        user_id: 3,
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike.johnson@example.com',
        role: 'user',
        created_at: '2024-02-01',
        is_active: false,
        last_login: '2024-02-15'
      }
    ]
    setUsers(mockUsers)
    setLoading(false)
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active)
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const handleDeleteUser = (userId: number) => {
    toast.success(`User #${userId} deleted successfully`)
    setUsers(prev => prev.filter(user => user.user_id !== userId))
    setActionMenu(null)
  }

  const handleToggleStatus = (userId: number, currentStatus: boolean) => {
    toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`)
    setUsers(prev => prev.map(user => 
      user.user_id === userId ? { ...user, is_active: !currentStatus } : user
    ))
    setActionMenu(null)
  }

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first')
      return
    }

    switch (action) {
      case 'activate':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.user_id) ? { ...user, is_active: true } : user
        ))
        toast.success(`${selectedUsers.length} users activated`)
        break
      case 'deactivate':
        setUsers(prev => prev.map(user => 
          selectedUsers.includes(user.user_id) ? { ...user, is_active: false } : user
        ))
        toast.success(`${selectedUsers.length} users deactivated`)
        break
      case 'delete':
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.user_id)))
        toast.success(`${selectedUsers.length} users deleted`)
        break
    }
    setSelectedUsers([])
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
              User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all registered users and their permissions</p>
          </div>
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
            <UserPlus size={20} />
            Add New User
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Users</p>
              <h3 className="text-3xl font-bold mt-1">{users.length}</h3>
            </div>
            <Users size={32} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Users</p>
              <h3 className="text-3xl font-bold mt-1">{users.filter(u => u.is_active).length}</h3>
            </div>
            <CheckCircle size={32} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Admins</p>
              <h3 className="text-3xl font-bold mt-1">{users.filter(u => u.role === 'admin').length}</h3>
            </div>
            <Shield size={32} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">New This Month</p>
              <h3 className="text-3xl font-bold mt-1">12</h3>
            </div>
            <UserPlus size={32} className="text-purple-200" />
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
                placeholder="Search users by name, email, or phone..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="user">Users</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="flex gap-3">
              <select
                onChange={(e) => handleBulkAction(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue=""
              >
                <option value="" disabled>Bulk Actions</option>
                <option value="activate">Activate Selected</option>
                <option value="deactivate">Deactivate Selected</option>
                <option value="delete">Delete Selected</option>
              </select>
              <span className="bg-blue-100 text-blue-800 px-3 py-3 rounded-xl font-semibold">
                {selectedUsers.length} selected
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              <Download size={20} />
              Export
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2">
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <th className="px-6 py-4 text-left">
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
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Contact</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Joined</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
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
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold">
                        {user.first_name[0]}{user.last_name[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">ID: #{user.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-900">
                        <Mail size={16} className="text-gray-400" />
                        {user.email}
                      </div>
                      {user.phone_number && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Phone size={16} className="text-gray-400" />
                          {user.phone_number}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.role === 'admin' 
                        ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      user.is_active
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {user.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === user.user_id ? null : user.user_id)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreVertical size={20} className="text-gray-400" />
                      </button>
                      
                      {actionMenu === user.user_id && (
                        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 min-w-[200px]">
                          <button className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-t-xl">
                            <Eye size={16} />
                            View Details
                          </button>
                          <button className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
                            <Edit size={16} />
                            Edit User
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user.user_id, user.is_active)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700"
                          >
                            {user.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.user_id)}
                            className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600 rounded-b-xl"
                          >
                            <Trash2 size={16} />
                            Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No users found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div className="text-gray-600">
            Showing 1-{filteredUsers.length} of {users.length} users
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

export default UserManagement