// components/admin/VehicleManagement.tsx
import React, { useState, useEffect } from 'react'
import { 
  Car, Search, Filter, Edit, Trash2, Eye, 
  Plus, RefreshCw, Download, Upload, Fuel,
  Settings, MapPin, Calendar, DollarSign,
  CheckCircle, XCircle, MoreVertical, Star,
  Users, Wrench, Shield
} from 'lucide-react'
import { toast } from 'sonner'

interface Vehicle {
  vehicle_id: number
  specification: {
    manufacturer: string
    model: string
    year: number
    fuel_type: string
    transmission: string
    seating_capacity: number
  }
  rental_rate: number
  current_location: string
  availability: boolean
  mileage: number
  features: string[]
  images: string[]
  created_at: string
  last_maintenance?: string
  status: 'available' | 'rented' | 'maintenance'
}

const VehicleManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'rented' | 'maintenance'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'economy' | 'luxury' | 'suv'>('all')
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockVehicles: Vehicle[] = [
      {
        vehicle_id: 1,
        specification: {
          manufacturer: 'Toyota',
          model: 'Camry',
          year: 2023,
          fuel_type: 'Petrol',
          transmission: 'Automatic',
          seating_capacity: 5
        },
        rental_rate: 45,
        current_location: 'Nairobi CBD',
        availability: true,
        mileage: 12500,
        features: ['Bluetooth', 'Air Conditioning', 'GPS'],
        images: [],
        created_at: '2024-01-15',
        status: 'available'
      },
      {
        vehicle_id: 2,
        specification: {
          manufacturer: 'Mercedes',
          model: 'E-Class',
          year: 2024,
          fuel_type: 'Diesel',
          transmission: 'Automatic',
          seating_capacity: 5
        },
        rental_rate: 120,
        current_location: 'Westlands',
        availability: true,
        mileage: 8000,
        features: ['Leather Seats', 'Sunroof', 'Premium Sound'],
        images: [],
        created_at: '2024-02-01',
        status: 'rented'
      },
      {
        vehicle_id: 3,
        specification: {
          manufacturer: 'Land Rover',
          model: 'Range Rover',
          year: 2023,
          fuel_type: 'Petrol',
          transmission: 'Automatic',
          seating_capacity: 7
        },
        rental_rate: 150,
        current_location: 'Karen',
        availability: false,
        mileage: 15000,
        features: ['4WD', 'Panoramic Roof', 'Heated Seats'],
        images: [],
        created_at: '2024-01-20',
        status: 'maintenance',
        last_maintenance: '2024-03-15'
      }
    ]
    setVehicles(mockVehicles)
    setLoading(false)
  }, [])

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.specification.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.specification.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.current_location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleDeleteVehicle = (vehicleId: number) => {
    toast.success(`Vehicle #${vehicleId} deleted successfully`)
    setVehicles(prev => prev.filter(vehicle => vehicle.vehicle_id !== vehicleId))
    setActionMenu(null)
  }

  const handleToggleAvailability = (vehicleId: number, currentAvailability: boolean) => {
    toast.success(`Vehicle ${currentAvailability ? 'made unavailable' : 'made available'}`)
    setVehicles(prev => prev.map(vehicle => 
      vehicle.vehicle_id === vehicleId ? { 
        ...vehicle, 
        availability: !currentAvailability,
        status: !currentAvailability ? 'available' : 'maintenance'
      } : vehicle
    ))
    setActionMenu(null)
  }

  const handleBulkAction = (action: 'available' | 'maintenance' | 'delete') => {
    if (selectedVehicles.length === 0) {
      toast.error('Please select vehicles first')
      return
    }

    switch (action) {
      case 'available':
        setVehicles(prev => prev.map(vehicle => 
          selectedVehicles.includes(vehicle.vehicle_id) ? { 
            ...vehicle, 
            availability: true,
            status: 'available'
          } : vehicle
        ))
        toast.success(`${selectedVehicles.length} vehicles marked as available`)
        break
      case 'maintenance':
        setVehicles(prev => prev.map(vehicle => 
          selectedVehicles.includes(vehicle.vehicle_id) ? { 
            ...vehicle, 
            availability: false,
            status: 'maintenance'
          } : vehicle
        ))
        toast.success(`${selectedVehicles.length} vehicles sent for maintenance`)
        break
      case 'delete':
        setVehicles(prev => prev.filter(vehicle => !selectedVehicles.includes(vehicle.vehicle_id)))
        toast.success(`${selectedVehicles.length} vehicles deleted`)
        break
    }
    setSelectedVehicles([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'rented': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} />
      case 'rented': return <Users size={16} />
      case 'maintenance': return <Wrench size={16} />
      default: return <Car size={16} />
    }
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
              Vehicle Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your fleet and vehicle availability</p>
          </div>
          <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
            <Plus size={20} />
            Add New Vehicle
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Vehicles</p>
              <h3 className="text-3xl font-bold mt-1">{vehicles.length}</h3>
            </div>
            <Car size={32} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Available</p>
              <h3 className="text-3xl font-bold mt-1">{vehicles.filter(v => v.status === 'available').length}</h3>
            </div>
            <CheckCircle size={32} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">In Maintenance</p>
              <h3 className="text-3xl font-bold mt-1">{vehicles.filter(v => v.status === 'maintenance').length}</h3>
            </div>
            <Wrench size={32} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Monthly Revenue</p>
              <h3 className="text-3xl font-bold mt-1">$12.4K</h3>
            </div>
            <DollarSign size={32} className="text-purple-200" />
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
                placeholder="Search vehicles by make, model, or location..."
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
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="economy">Economy</option>
                <option value="luxury">Luxury</option>
                <option value="suv">SUV</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedVehicles.length > 0 && (
            <div className="flex gap-3">
              <select
                onChange={(e) => handleBulkAction(e.target.value as any)}
                className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue=""
              >
                <option value="" disabled>Bulk Actions</option>
                <option value="available">Mark as Available</option>
                <option value="maintenance">Send for Maintenance</option>
                <option value="delete">Delete Vehicles</option>
              </select>
              <span className="bg-blue-100 text-blue-800 px-3 py-3 rounded-xl font-semibold">
                {selectedVehicles.length} selected
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

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.vehicle_id} className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            {/* Vehicle Image */}
            <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Car size={64} className="text-white opacity-20" />
              </div>
              <div className="absolute top-4 right-4">
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(vehicle.status)}`}>
                  {getStatusIcon(vehicle.status)}
                  {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                </span>
              </div>
              <div className="absolute top-4 left-4">
                <input
                  type="checkbox"
                  checked={selectedVehicles.includes(vehicle.vehicle_id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedVehicles(prev => [...prev, vehicle.vehicle_id])
                    } else {
                      setSelectedVehicles(prev => prev.filter(id => id !== vehicle.vehicle_id))
                    }
                  }}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {vehicle.specification.manufacturer} {vehicle.specification.model}
                  </h3>
                  <p className="text-gray-600">{vehicle.specification.year}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">${vehicle.rental_rate}</div>
                  <div className="text-gray-600 text-sm">per day</div>
                </div>
              </div>

              {/* Specifications */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Fuel size={16} className="text-gray-400" />
                  {vehicle.specification.fuel_type}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Settings size={16} className="text-gray-400" />
                  {vehicle.specification.transmission}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} className="text-gray-400" />
                  {vehicle.specification.seating_capacity} seats
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  {vehicle.current_location}
                </div>
              </div>

              {/* Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                      {feature}
                    </span>
                  ))}
                  {vehicle.features.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium">
                      +{vehicle.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActionMenu(vehicle.vehicle_id)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <MoreVertical size={20} className="text-gray-400" />
                  </button>
                  
                  {actionMenu === vehicle.vehicle_id && (
                    <div className="absolute right-6 bottom-20 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 min-w-[180px]">
                      <button className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-t-xl">
                        <Eye size={16} />
                        View Details
                      </button>
                      <button className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700">
                        <Edit size={16} />
                        Edit Vehicle
                      </button>
                      <button 
                        onClick={() => handleToggleAvailability(vehicle.vehicle_id, vehicle.availability)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700"
                      >
                        {vehicle.availability ? <Wrench size={16} /> : <CheckCircle size={16} />}
                        {vehicle.availability ? 'Maintenance' : 'Make Available'}
                      </button>
                      <button 
                        onClick={() => handleDeleteVehicle(vehicle.vehicle_id)}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600 rounded-b-xl"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    Added {new Date(vehicle.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-blue-100">
          <Car className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No vehicles found</p>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div className="text-gray-600">
            Showing 1-{filteredVehicles.length} of {vehicles.length} vehicles
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

export default VehicleManagement