// components/admin/VehicleManagement.tsx
import React, { useState, useEffect } from 'react'
import { 
  Car, Search, Filter, Edit, Trash2, Eye, 
  Plus, RefreshCw, Download, Upload, Fuel,
  Settings, MapPin, Calendar, DollarSign,
  CheckCircle, XCircle, MoreVertical,
  Users, Wrench, Shield, Image as ImageIcon,
  AlertCircle, ExternalLink
} from 'lucide-react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  useGetVehiclesQuery,
  useDeleteVehicleMutation,
  useUpdateVehicleAvailabilityMutation,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useGetVehicleLocationsQuery,
  useGetVehicleSpecificationsQuery
} from '../../features/api/vehiclesApi'
import type {  CreateVehicleRequest } from '../../features/api/vehiclesApi'
import type { Vehicle } from '../../types/Types'  

// Add Vehicle Modal Component
// Improved AddVehicleModal Component
const AddVehicleModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateVehicleRequest) => void
  isLoading: boolean
}> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<CreateVehicleRequest>({
    rental_rate: 0,
    current_location: '',
    manufacturer: '',
    model: '',
    year: new Date().getFullYear(),
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    seating_capacity: 5,
    vehicle_type: 'four-wheeler',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.rental_rate || formData.rental_rate <= 0) {
      newErrors.rental_rate = 'Rental rate must be greater than 0'
    }
    
    if (!formData.current_location?.trim()) {
      newErrors.current_location = 'Current location is required'
    }
    
    if (!formData.manufacturer?.trim()) {
      newErrors.manufacturer = 'Manufacturer is required'
    }
    
    if (!formData.model?.trim()) {
      newErrors.model = 'Model is required'
    }
    
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear()) {
      newErrors.year = 'Please enter a valid year'
    }
    
    if (!formData.seating_capacity || formData.seating_capacity < 1) {
      newErrors.seating_capacity = 'Seating capacity must be at least 1'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0) {
      // Submit with all required data
      const submitData = {
        ...formData,
        // Make sure all required fields are present
        rental_rate: Number(formData.rental_rate),
        year: Number(formData.year),
        seating_capacity: Number(formData.seating_capacity),
        engine_capacity: formData.engine_capacity ? Number(formData.engine_capacity) : undefined,
      }
      onSubmit(submitData)
    }
  }

  const handleInputChange = (field: keyof CreateVehicleRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        rental_rate: 0,
        current_location: '',
        manufacturer: '',
        model: '',
        year: new Date().getFullYear(),
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        seating_capacity: 5,
        vehicle_type: 'four-wheeler',
      })
      setErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur effect */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-gray-700 shadow-2xl w-full max-w-4xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20" />
            <div className="relative p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                    <Car className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Add New Vehicle</h2>
                    <p className="text-gray-400 text-sm mt-1">Fill in all required fields to add a new vehicle</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors disabled:opacity-50"
                >
                  <XCircle className="text-gray-400" size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
                    <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                      <Car size={20} className="text-blue-400" />
                      Basic Information
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Rental Rate ($/day) *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="number"
                            required
                            value={formData.rental_rate || ''}
                            onChange={(e) => handleInputChange('rental_rate', parseFloat(e.target.value) || 0)}
                            className={`w-full pl-10 bg-gray-800 border ${errors.rental_rate ? 'border-red-500/50' : 'border-gray-600'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            step="0.01"
                            min="0"
                            placeholder="45.00"
                          />
                        </div>
                        {errors.rental_rate && (
                          <p className="mt-1 text-sm text-red-400">{errors.rental_rate}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Current Location *
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            required
                            value={formData.current_location || ''}
                            onChange={(e) => handleInputChange('current_location', e.target.value)}
                            className={`w-full pl-10 bg-gray-800 border ${errors.current_location ? 'border-red-500/50' : 'border-gray-600'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            placeholder="Nairobi CBD"
                          />
                        </div>
                        {errors.current_location && (
                          <p className="mt-1 text-sm text-red-400">{errors.current_location}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Image URL
                        </label>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="url"
                            value={formData.image_url || ''}
                            onChange={(e) => handleInputChange('image_url', e.target.value)}
                            className="w-full pl-10 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com/vehicle-image.jpg"
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          <span className="text-blue-400">💡 Tip:</span> Use a direct image link for best results
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
                    <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                      <Shield size={20} className="text-green-400" />
                      Vehicle Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Initial Status
                          </label>
                          <select
                            value={formData.availability ? 'available' : 'unavailable'}
                            onChange={(e) => handleInputChange('availability', e.target.value === 'available')}
                            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="available" className="bg-gray-800">Available</option>
                            <option value="unavailable" className="bg-gray-800">Unavailable (Maintenance)</option>
                          </select>
                        </div>
                        <div className="pt-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                            formData.availability 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                          }`}>
                            {formData.availability ? 'Available' : 'Maintenance'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Vehicles can be rented when set to "Available". Set to "Maintenance" for repairs or cleaning.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Specifications */}
                <div className="space-y-4">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
                    <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                      <Settings size={20} className="text-purple-400" />
                      Specifications
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Manufacturer *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.manufacturer || ''}
                            onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                            className={`w-full bg-gray-800 border ${errors.manufacturer ? 'border-red-500/50' : 'border-gray-600'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            placeholder="Toyota"
                          />
                          {errors.manufacturer && (
                            <p className="mt-1 text-sm text-red-400">{errors.manufacturer}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Model *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.model || ''}
                            onChange={(e) => handleInputChange('model', e.target.value)}
                            className={`w-full bg-gray-800 border ${errors.model ? 'border-red-500/50' : 'border-gray-600'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            placeholder="Camry"
                          />
                          {errors.model && (
                            <p className="mt-1 text-sm text-red-400">{errors.model}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Year *
                          </label>
                          <input
                            type="number"
                            required
                            value={formData.year || ''}
                            onChange={(e) => handleInputChange('year', parseInt(e.target.value) || new Date().getFullYear())}
                            className={`w-full bg-gray-800 border ${errors.year ? 'border-red-500/50' : 'border-gray-600'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            min="1900"
                            max={new Date().getFullYear()}
                            placeholder="2024"
                          />
                          {errors.year && (
                            <p className="mt-1 text-sm text-red-400">{errors.year}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Fuel Type *
                          </label>
                          <select
                            required
                            value={formData.fuel_type || 'Petrol'}
                            onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Petrol" className="bg-gray-800">Petrol</option>
                            <option value="Diesel" className="bg-gray-800">Diesel</option>
                            <option value="Electric" className="bg-gray-800">Electric</option>
                            <option value="Hybrid" className="bg-gray-800">Hybrid</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Transmission *
                          </label>
                          <select
                            required
                            value={formData.transmission || 'Automatic'}
                            onChange={(e) => handleInputChange('transmission', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Automatic" className="bg-gray-800">Automatic</option>
                            <option value="Manual" className="bg-gray-800">Manual</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Seating Capacity *
                          </label>
                          <input
                            type="number"
                            required
                            value={formData.seating_capacity || ''}
                            onChange={(e) => handleInputChange('seating_capacity', parseInt(e.target.value) || 5)}
                            className={`w-full bg-gray-800 border ${errors.seating_capacity ? 'border-red-500/50' : 'border-gray-600'} rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            min="1"
                            max="20"
                            placeholder="5"
                          />
                          {errors.seating_capacity && (
                            <p className="mt-1 text-sm text-red-400">{errors.seating_capacity}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Vehicle Type *
                          </label>
                          <select
                            required
                            value={formData.vehicle_type || 'four-wheeler'}
                            onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="four-wheeler" className="bg-gray-800">Four Wheeler</option>
                            <option value="two-wheeler" className="bg-gray-800">Two Wheeler</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">
                            Engine Capacity (cc)
                          </label>
                          <input
                            type="number"
                            value={formData.engine_capacity || ''}
                            onChange={(e) => handleInputChange('engine_capacity', e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="0.1"
                            min="0"
                            placeholder="2000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          value={formData.color || ''}
                          onChange={(e) => handleInputChange('color', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Red, Blue, Black, etc."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Features (comma separated)
                        </label>
                        <textarea
                          value={formData.features || ''}
                          onChange={(e) => handleInputChange('features', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Bluetooth, GPS, Sunroof, Heated Seats, Air Conditioning"
                          rows={3}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          <span className="text-purple-400">📝 Note:</span> Separate features with commas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gray-800/50 backdrop-blur-sm text-gray-300 rounded-2xl font-semibold hover:bg-gray-700/50 transition-colors border border-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="animate-spin" size={20} />
                      Adding Vehicle...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Add Vehicle to Fleet
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
// Edit Vehicle Modal Component
const EditVehicleModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  vehicle: Vehicle | null
  onSubmit: (vehicle_id: number, data: any) => void
  isLoading: boolean
}> = ({ isOpen, onClose, vehicle, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    rental_rate: 0,
    current_location: '',
    availability: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form with vehicle data when modal opens
  useEffect(() => {
    if (vehicle && isOpen) {
      setFormData({
        rental_rate: vehicle.rental_rate,
        current_location: vehicle.current_location || '',
        availability: vehicle.availability
      })
    }
  }, [vehicle, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    
    if (!formData.rental_rate || formData.rental_rate <= 0) {
      newErrors.rental_rate = 'Rental rate must be greater than 0'
    }
    
    if (!formData.current_location?.trim()) {
      newErrors.current_location = 'Current location is required'
    }
    
    setErrors(newErrors)
    
    if (Object.keys(newErrors).length === 0 && vehicle) {
      onSubmit(vehicle.vehicle_id, formData)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  if (!isOpen || !vehicle) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Vehicle</h2>
              <p className="text-gray-600 text-sm mt-1">
                {vehicle.specification.manufacturer} {vehicle.specification.model} ({vehicle.specification.year})
              </p>
            </div>
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <XCircle size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rental Rate ($/day) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.rental_rate}
                  onChange={(e) => handleInputChange('rental_rate', parseFloat(e.target.value))}
                  className={`w-full border ${errors.rental_rate ? 'border-red-300' : 'border-gray-300'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  step="0.01"
                  min="0"
                />
                {errors.rental_rate && (
                  <p className="mt-1 text-sm text-red-600">{errors.rental_rate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.current_location}
                  onChange={(e) => handleInputChange('current_location', e.target.value)}
                  className={`w-full border ${errors.current_location ? 'border-red-300' : 'border-gray-300'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {errors.current_location && (
                  <p className="mt-1 text-sm text-red-600">{errors.current_location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.availability === true}
                      onChange={() => handleInputChange('availability', true)}
                      className="text-blue-600 focus:ring-blue-500"
                      disabled={vehicle.status === 'rented'}
                    />
                    <span className={vehicle.status === 'rented' ? 'text-gray-400' : ''}>Available</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.availability === false}
                      onChange={() => handleInputChange('availability', false)}
                      className="text-blue-600 focus:ring-blue-500"
                      disabled={vehicle.status === 'rented'}
                    />
                    <span className={vehicle.status === 'rented' ? 'text-gray-400' : ''}>Unavailable (Maintenance)</span>
                  </label>
                </div>
                {vehicle.status === 'rented' && (
                  <p className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                    <AlertCircle size={16} />
                    Cannot change availability while vehicle is rented
                  </p>
                )}
              </div>
            </div>

            {/* Read-only specification info */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Specification (Read-only)</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Manufacturer</p>
                  <p className="font-medium">{vehicle.specification.manufacturer}</p>
                </div>
                <div>
                  <p className="text-gray-500">Model</p>
                  <p className="font-medium">{vehicle.specification.model}</p>
                </div>
                <div>
                  <p className="text-gray-500">Year</p>
                  <p className="font-medium">{vehicle.specification.year}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fuel Type</p>
                  <p className="font-medium">{vehicle.specification.fuel_type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Transmission</p>
                  <p className="font-medium">{vehicle.specification.transmission}</p>
                </div>
                <div>
                  <p className="text-gray-500">Seating Capacity</p>
                  <p className="font-medium">{vehicle.specification.seating_capacity}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || vehicle.status === 'rented'}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit size={20} />
                    Update Vehicle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// View Details Modal Component
// View Details Modal Component with Creative Blur Design
const VehicleDetailsModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  vehicle: Vehicle | null
}> = ({ isOpen, onClose, vehicle }) => {
  if (!isOpen || !vehicle) return null

  // Parse features string to array
  const features = vehicle.specification.features
    ? vehicle.specification.features.split(',').map(f => f.trim())
    : []

  // Get status colors and icons
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          bg: 'from-green-500 to-emerald-600',
          text: 'text-green-500',
          icon: <CheckCircle size={16} />,
          label: 'Available'
        }
      case 'rented':
        return {
          bg: 'from-blue-500 to-indigo-600',
          text: 'text-blue-500',
          icon: <Users size={16} />,
          label: 'Currently Rented'
        }
      case 'maintenance':
        return {
          bg: 'from-orange-500 to-amber-600',
          text: 'text-orange-500',
          icon: <Wrench size={16} />,
          label: 'Under Maintenance'
        }
      default:
        return {
          bg: 'from-gray-500 to-gray-600',
          text: 'text-gray-500',
          icon: <Car size={16} />,
          label: 'Unknown'
        }
    }
  }

  const statusConfig = getStatusConfig(vehicle.status || 'available')

  return (
    <>
      {/* Blur Background Layer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            {/* Enhanced Blur Background with Gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-500/20 rounded-full"
                    initial={{ 
                      x: Math.random() * window.innerWidth,
                      y: Math.random() * window.innerHeight 
                    }}
                    animate={{ 
                      y: [null, -30, 30],
                      opacity: [0.1, 0.6, 0.1]
                    }}
                    transition={{ 
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.2 
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl border border-gray-700/50 shadow-2xl w-full max-w-6xl overflow-hidden backdrop-blur-sm"
              >
                {/* Decorative Header Gradient */}
                <div className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  
                  <div className="relative p-8 border-b border-gray-700/50">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <Car className="text-white" size={28} />
                          </div>
                          <div className="absolute -bottom-2 -right-2">
                            <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${statusConfig.bg} text-white border border-white/20`}>
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Vehicle Details
                          </h2>
                          <p className="text-gray-400 mt-2">
                            {vehicle.specification.manufacturer} {vehicle.specification.model} • {vehicle.specification.year}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={onClose}
                        className="p-3 hover:bg-gray-700/50 rounded-2xl transition-all hover:scale-110 active:scale-95 group"
                      >
                        <XCircle className="text-gray-400 group-hover:text-white transition-colors" size={28} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-8">
                    {/* Hero Image Section */}
                    <div className="relative rounded-3xl overflow-hidden border border-gray-700/50 shadow-2xl group">
                      {vehicle.specification.image_url ? (
                        <>
                          <img 
                            src={vehicle.specification.image_url} 
                            alt={`${vehicle.specification.manufacturer} ${vehicle.specification.model}`}
                            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-80 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="text-center">
                            <Car size={80} className="text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No image available</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Floating Info Card */}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-2xl font-bold text-white">
                                {vehicle.specification.manufacturer} {vehicle.specification.model}
                              </h3>
                              <p className="text-gray-400 mt-1">Vehicle ID: #{vehicle.vehicle_id}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                ${vehicle.rental_rate.toFixed(2)}
                              </div>
                              <div className="text-gray-400">per day</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column - Basic Info */}
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl">
                            <Car className="text-blue-400" size={20} />
                          </div>
                          Basic Information
                        </h3>
                        
                        <div className="space-y-5">
                          <div className="flex items-center justify-between pb-3 border-b border-gray-700/50">
                            <div className="flex items-center gap-3">
                              <MapPin className="text-gray-400" size={18} />
                              <span className="text-gray-400">Location</span>
                            </div>
                            <span className="font-semibold text-white">{vehicle.current_location}</span>
                          </div>
                          
                          <div className="flex items-center justify-between pb-3 border-b border-gray-700/50">
                            <div className="flex items-center gap-3">
                              <Calendar className="text-gray-400" size={18} />
                              <span className="text-gray-400">Added Date</span>
                            </div>
                            <span className="font-semibold text-white">
                              {new Date(vehicle.created_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between pb-3 border-b border-gray-700/50">
                            <div className="flex items-center gap-3">
                              <div className={`p-1 rounded ${vehicle.availability ? 'bg-green-500/20' : 'bg-orange-500/20'}`}>
                                {vehicle.availability ? (
                                  <CheckCircle className="text-green-400" size={18} />
                                ) : (
                                  <XCircle className="text-orange-400" size={18} />
                                )}
                              </div>
                              <span className="text-gray-400">Availability</span>
                            </div>
                            <span className={`font-semibold ${vehicle.availability ? 'text-green-400' : 'text-orange-400'}`}>
                              {vehicle.availability ? '✓ Available for Rent' : '✗ Currently Unavailable'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-1 rounded bg-blue-500/20">
                                <Fuel className="text-blue-400" size={18} />
                              </div>
                              <span className="text-gray-400">Fuel Type</span>
                            </div>
                            <span className="font-semibold text-white">{vehicle.specification.fuel_type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Specifications */}
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl">
                            <Settings className="text-purple-400" size={20} />
                          </div>
                          Specifications
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div className="bg-gray-900/50 rounded-xl p-4">
                              <p className="text-gray-500 text-sm mb-1">Transmission</p>
                              <p className="font-semibold text-white">{vehicle.specification.transmission}</p>
                            </div>
                            <div className="bg-gray-900/50 rounded-xl p-4">
                              <p className="text-gray-500 text-sm mb-1">Seating</p>
                              <p className="font-semibold text-white flex items-center gap-2">
                                <Users size={16} className="text-gray-400" />
                                {vehicle.specification.seating_capacity} seats
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="bg-gray-900/50 rounded-xl p-4">
                              <p className="text-gray-500 text-sm mb-1">Vehicle Type</p>
                              <p className="font-semibold text-white">{vehicle.specification.vehicle_type}</p>
                            </div>
                            <div className="bg-gray-900/50 rounded-xl p-4">
                              <p className="text-gray-500 text-sm mb-1">Color</p>
                              <p className="font-semibold text-white">
                                {vehicle.specification.color || 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {vehicle.specification.engine_capacity && (
                          <div className="mt-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4">
                            <p className="text-gray-500 text-sm mb-1">Engine Capacity</p>
                            <p className="text-2xl font-bold text-white">
                              {vehicle.specification.engine_capacity.toFixed(1)} <span className="text-sm text-gray-400">cc</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Features Section */}
                    {features.length > 0 && (
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50 shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-pink-500/20 to-pink-600/20 rounded-xl">
                            <Sparkles className="text-pink-400" size={20} />
                          </div>
                          Premium Features
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {features.map((feature, index) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-blue-300 px-4 py-3 rounded-xl font-medium border border-blue-700/30 hover:border-blue-500/50 transition-all cursor-default hover:scale-105"
                            >
                              {feature}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image Link */}
                    {vehicle.specification.image_url && (
                      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl p-6 border border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ImageIcon className="text-blue-400" size={24} />
                            <div>
                              <p className="text-white font-semibold">High Resolution Image</p>
                              <p className="text-gray-400 text-sm">Click to view full size</p>
                            </div>
                          </div>
                          <a 
                            href={vehicle.specification.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
                          >
                            <ExternalLink size={18} />
                            <span>View Full Image</span>
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-700/50">
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={onClose}
                      className="px-8 py-3 bg-gray-800/50 backdrop-blur-sm text-gray-300 rounded-2xl font-semibold hover:bg-gray-700/50 transition-all border border-gray-700/50 hover:border-gray-600/50"
                    >
                      Close Details
                    </button>
                    {/* <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                      Rent This Vehicle
                    </button> */}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
const VehicleManagement: React.FC = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'rented' | 'maintenance'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'four-wheeler' | 'two-wheeler'>('all')
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([])
  const [actionMenu, setActionMenu] = useState<number | null>(null)
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // API Hooks
  const { 
    data: vehiclesData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetVehiclesQuery({
    search: searchTerm || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    vehicle_type: typeFilter === 'all' ? undefined : typeFilter,
  })

  const [deleteVehicle, { isLoading: isDeleting }] = useDeleteVehicleMutation()
  const [updateVehicleAvailability, { isLoading: isUpdatingAvailability }] = useUpdateVehicleAvailabilityMutation()
  const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation()
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation()

  // Derived data
  const vehicles = vehiclesData?.vehicles || []
  const totalVehicles = vehiclesData?.total || 0

  // Calculate stats
  const availableCount = vehicles.filter(v => v.status === 'available').length
  const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length
  const rentedCount = vehicles.filter(v => v.status === 'rented').length

  // Handlers
  const handleDeleteVehicle = async (vehicleId: number) => {
    try {
      await deleteVehicle(vehicleId).unwrap()
      toast.success('Vehicle deleted successfully')
      setActionMenu(null)
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to delete vehicle')
      setActionMenu(null)
    }
  }

  const handleToggleAvailability = async (vehicleId: number, currentAvailability: boolean) => {
    try {
      await updateVehicleAvailability({
        vehicle_id: vehicleId,
        availability: !currentAvailability
      }).unwrap()
      toast.success(`Vehicle ${currentAvailability ? 'made unavailable' : 'made available'}`)
      setActionMenu(null)
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to update vehicle availability')
      setActionMenu(null)
    }
  }

  const handleAddVehicle = async (formData: CreateVehicleRequest) => {
  console.log('Submitting vehicle data:', formData); // Add this
  
  try {
    const vehicleData = {
      ...formData,
      availability: formData.availability !== undefined ? formData.availability : true,
    };
    
    console.log('Data being sent to API:', vehicleData); // Add this
    
    const result = await createVehicle(vehicleData).unwrap();
    console.log('API response:', result); // Add this
    
    toast.success('Vehicle added successfully');
    setShowAddModal(false);
    refetch();
  } catch (error: any) {
    console.error('Error adding vehicle:', error); // Add this
    toast.error(error?.data?.error || 'Failed to add vehicle');
  }
}

  const handleUpdateVehicle = async (vehicleId: number, data: any) => {
    try {
      await updateVehicle({ vehicle_id: vehicleId, data }).unwrap()
      toast.success('Vehicle updated successfully')
      setShowEditModal(false)
      setSelectedVehicle(null)
      refetch()
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to update vehicle')
    }
  }

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowDetailsModal(true)
    setActionMenu(null)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowEditModal(true)
    setActionMenu(null)
  }

  const handleBulkAction = async (action: 'available' | 'maintenance' | 'delete') => {
    if (selectedVehicles.length === 0) {
      toast.error('Please select vehicles first')
      return
    }

    try {
      switch (action) {
        case 'available':
          await Promise.all(
            selectedVehicles.map(id =>
              updateVehicleAvailability({ vehicle_id: id, availability: true }).unwrap()
            )
          )
          toast.success(`${selectedVehicles.length} vehicles marked as available`)
          break

        case 'maintenance':
          await Promise.all(
            selectedVehicles.map(id =>
              updateVehicleAvailability({ vehicle_id: id, availability: false }).unwrap()
            )
          )
          toast.success(`${selectedVehicles.length} vehicles sent for maintenance`)
          break

        case 'delete':
          await Promise.all(
            selectedVehicles.map(id => deleteVehicle(id).unwrap())
          )
          toast.success(`${selectedVehicles.length} vehicles deleted`)
          break
      }
      
      setSelectedVehicles([])
      refetch()
    } catch (error: any) {
      toast.error('Failed to perform bulk action')
    }
  }

  // Helper functions
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

  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-600 text-lg">Loading vehicles...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-6">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Vehicles</h3>
        <p className="text-gray-600 text-center max-w-md mb-6">
          {error?.toString() || 'Failed to load vehicle data. Please try again.'}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => refetch()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Retry
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
              Vehicle Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your fleet and vehicle availability</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={isCreating}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
          >
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
              <h3 className="text-3xl font-bold mt-1">{totalVehicles}</h3>
            </div>
            <Car size={32} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Available</p>
              <h3 className="text-3xl font-bold mt-1">{availableCount}</h3>
            </div>
            <CheckCircle size={32} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">In Maintenance</p>
              <h3 className="text-3xl font-bold mt-1">{maintenanceCount}</h3>
            </div>
            <Wrench size={32} className="text-orange-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Rented</p>
              <h3 className="text-3xl font-bold mt-1">{rentedCount}</h3>
            </div>
            <Users size={32} className="text-purple-200" />
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
                <option value="four-wheeler">Four Wheelers</option>
                <option value="two-wheeler">Two Wheelers</option>
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
            <button 
              onClick={() => refetch()}
              disabled={isLoading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.vehicle_id} className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
            {/* Vehicle Image */}
            <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative overflow-hidden">
              {vehicle.specification.image_url ? (
                <img 
                  src={vehicle.specification.image_url} 
                  alt={`${vehicle.specification.manufacturer} ${vehicle.specification.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car size={64} className="text-white opacity-20" />
                </div>
              )}
              <div className="absolute top-4 right-4">
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(vehicle.status!)}`}>
                  {getStatusIcon(vehicle.status!)}
                  {vehicle.status!.charAt(0).toUpperCase() + vehicle.status!.slice(1)}
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
                  <p className="text-gray-600">{vehicle.specification.year} • {vehicle.specification.color || 'No color specified'}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">${vehicle.rental_rate.toFixed(2)}</div>
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
                  {vehicle.specification.transmission || 'N/A'}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} className="text-gray-400" />
                  {vehicle.specification.seating_capacity} seats
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="truncate">{vehicle.current_location}</span>
                </div>
              </div>

              {/* Features */}
              {vehicle.specification.features && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {vehicle.specification.features.split(',').slice(0, 3).map((feature, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium">
                        {feature.trim()}
                      </span>
                    ))}
                    {vehicle.specification.features.split(',').length > 3 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs font-medium">
                        +{vehicle.specification.features.split(',').length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActionMenu(vehicle.vehicle_id === actionMenu ? null : vehicle.vehicle_id)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <MoreVertical size={20} className="text-gray-400" />
                  </button>
                  
                  {actionMenu === vehicle.vehicle_id && (
                    <div className="absolute right-6 bottom-20 bg-white border border-gray-200 rounded-xl shadow-2xl z-10 min-w-[180px]">
                      <button 
                        onClick={() => handleViewDetails(vehicle)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 rounded-t-xl"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button 
                        onClick={() => handleEditVehicle(vehicle)}
                        disabled={vehicle.status === 'rented'}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 disabled:text-gray-400 disabled:hover:bg-white"
                      >
                        <Edit size={16} />
                        Edit Vehicle
                      </button>
                      <button 
                        onClick={() => handleToggleAvailability(vehicle.vehicle_id, vehicle.availability)}
                        disabled={vehicle.status === 'rented' || isUpdatingAvailability}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 text-gray-700 disabled:text-gray-400 disabled:hover:bg-white"
                      >
                        {vehicle.availability ? <Wrench size={16} /> : <CheckCircle size={16} />}
                        {isUpdatingAvailability ? 'Updating...' : vehicle.availability ? 'Maintenance' : 'Make Available'}
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${vehicle.specification.manufacturer} ${vehicle.specification.model}?`)) {
                            handleDeleteVehicle(vehicle.vehicle_id)
                          }
                        }}
                        disabled={isDeleting || vehicle.status === 'rented'}
                        className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center gap-2 text-red-600 rounded-b-xl disabled:text-red-300 disabled:hover:bg-white"
                      >
                        <Trash2 size={16} />
                        {isDeleting ? 'Deleting...' : 'Delete'}
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

      {vehicles.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-xl border border-blue-100">
          <Car className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No vehicles found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
          <button 
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
              setTypeFilter('all')
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {vehicles.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-gray-600">
              Showing <span className="font-semibold">{vehicles.length}</span> of <span className="font-semibold">{totalVehicles}</span> vehicles
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-blue-600 text-white rounded-xl">1</span>
              <button 
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddVehicle}
        isLoading={isCreating}
      />

      <EditVehicleModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedVehicle(null)
        }}
        vehicle={selectedVehicle}
        onSubmit={handleUpdateVehicle}
        isLoading={isUpdating}
      />

      <VehicleDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedVehicle(null)
        }}
        vehicle={selectedVehicle}
      />
    </div>
  )
}

export default VehicleManagement