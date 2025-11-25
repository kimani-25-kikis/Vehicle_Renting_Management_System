import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useGetVehiclesQuery } from '../features/api/vehiclesApi'
import { 
    Car, Fuel, Users, Settings, MapPin, Heart, 
    Star, Zap, Shield, Gauge, Palette,
    Filter, X, Search, SlidersHorizontal, Sparkles
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer' 

const VehiclesListing: React.FC = () => {
    const [filters, setFilters] = useState({
        location: '',
        manufacturer: '',
        fuel_type: '',
        transmission: '',
        min_price: '',
        max_price: '',
        min_seating: '',
        search: ''
    })
    const [sortBy, setSortBy] = useState('newest')
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [activeFiltersCount, setActiveFiltersCount] = useState(0)
    const [debouncedFilters, setDebouncedFilters] = useState(filters)

    // Debounce filters to prevent too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters)
        }, 500)

        return () => clearTimeout(timer)
    }, [filters])

    const { data: vehiclesData, isLoading, error } = useGetVehiclesQuery(debouncedFilters)
    const vehicles = vehiclesData?.vehicles || []

    // Count active filters
    useEffect(() => {
        const count = Object.values(filters).filter(value => 
            value !== '' && value !== null && value !== undefined
        ).length
        setActiveFiltersCount(count)
    }, [filters])

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({
            location: '',
            manufacturer: '',
            fuel_type: '',
            transmission: '',
            min_price: '',
            max_price: '',
            min_seating: '',
            search: ''
        })
    }

    const clearSingleFilter = (key: string) => {
        setFilters(prev => ({ ...prev, [key]: '' }))
    }

    const getFuelTypeColor = (fuelType: string) => {
        switch (fuelType.toLowerCase()) {
            case 'electric': return 'from-green-500 to-emerald-600'
            case 'hybrid': return 'from-blue-500 to-cyan-600'
            case 'petrol': return 'from-orange-500 to-red-500'
            case 'diesel': return 'from-gray-600 to-gray-700'
            default: return 'from-gray-500 to-gray-600'
        }
    }

    const getTransmissionIcon = (transmission: string) => {
        return transmission === 'Automatic' ? 
            <Settings size={16} className="text-purple-500" /> : 
            <Gauge size={16} className="text-blue-500" />
    }

    const getFeatureIcon = (feature: string) => {
        const featureIcons: { [key: string]: any } = {
            'ac': <Zap size={12} className="text-blue-500" />,
            'bluetooth': <Sparkles size={12} className="text-purple-500" />,
            'navigation': <MapPin size={12} className="text-green-500" />,
            'leather': <Shield size={12} className="text-amber-500" />,
            'premium': <Star size={12} className="text-yellow-500" />
        }
        
        const lowerFeature = feature.toLowerCase()
        for (const [key, icon] of Object.entries(featureIcons)) {
            if (lowerFeature.includes(key)) return icon
        }
        return <Sparkles size={12} className="text-gray-500" />
    }

    // Filter options data - Updated to match backend parameters
    const filterOptions = {
        locations: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'],
        manufacturers: ['Toyota', 'Subaru', 'Nissan', 'Mitsubishi', 'Ford', 'Mercedes', 'BMW', 'Audi'],
        seatingOptions: ['2', '4', '5', '7', '8', '14'],
        fuelTypes: ['Electric', 'Hybrid', 'Petrol', 'Diesel'],
        transmissions: ['Automatic', 'Manual']
    }

    const getFilterLabel = (key: string, value: string) => {
        const labels: { [key: string]: string } = {
            location: 'Location',
            manufacturer: 'Brand',
            fuel_type: 'Fuel',
            transmission: 'Transmission',
            min_price: 'Min Price',
            max_price: 'Max Price',
            min_seating: 'Min Seats',
            search: 'Search'
        }
        return `${labels[key]}: ${value}`
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="text-center bg-white rounded-2xl p-8 shadow-xl border border-blue-100 max-w-md">
                    <Car size={64} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-6">We couldn't load the vehicles. Please try again later.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16"> {/* Added pt-16 for fixed navbar */}
           
            {/* Fixed Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar/>
            </div>

            {/* Enhanced Header */}
            <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                                Discover Your Ride
                            </h1>
                            <p className="text-lg text-gray-600 mt-2 max-w-2xl">
                                Explore our premium collection of vehicles tailored for every journey
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            {/* Search Bar */}
                            <div className="relative flex-1 lg:w-80">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by brand, model, or features..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                                />
                                {filters.search && (
                                    <button 
                                        onClick={() => handleFilterChange('search', '')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {/* Sort Dropdown */}
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm min-w-[160px]"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="year">Year: Newest</option>
                                </select>

                                {/* Mobile Filter Button */}
                                <button
                                    onClick={() => setShowMobileFilters(true)}
                                    className="lg:hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Filter size={20} />
                                    Filters
                                    {activeFiltersCount > 0 && (
                                        <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Bar */}
                    {activeFiltersCount > 0 && (
                        <div className="flex items-center gap-3 mt-6 flex-wrap">
                            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
                            {Object.entries(filters).map(([key, value]) => 
                                value && (
                                    <span 
                                        key={key}
                                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                                    >
                                        {getFilterLabel(key, value)}
                                        <button 
                                            onClick={() => clearSingleFilter(key)}
                                            className="hover:text-blue-600 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                )
                            )}
                            <button 
                                onClick={clearFilters}
                                className="text-sm text-red-600 hover:text-red-700 font-medium ml-auto transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Enhanced Filters Sidebar - Now independent and scrollable */}
                    <div className={`lg:w-80 flex-shrink-0 ${showMobileFilters ? 'fixed inset-0 z-50 bg-black/50 lg:static lg:bg-transparent' : 'hidden lg:block'}`}>
                        <div className={`bg-white rounded-2xl shadow-xl border border-blue-100 p-6 h-fit max-h-[85vh] overflow-y-auto ${showMobileFilters ? 'm-4 lg:m-0' : 'lg:sticky lg:top-24'}`}>
                            {/* Mobile Header */}
                            {showMobileFilters && (
                                <div className="flex justify-between items-center mb-6 lg:hidden border-b border-gray-200 pb-4">
                                    <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                                    <button 
                                        onClick={() => setShowMobileFilters(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Search in Filters */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Search size={18} className="text-blue-600" />
                                        Search Vehicles
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search brand, model, features..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    />
                                </div>

                                {/* Location Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <MapPin size={18} className="text-blue-600" />
                                        Pickup Location
                                    </label>
                                    <select 
                                        value={filters.location}
                                        onChange={(e) => handleFilterChange('location', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    >
                                        <option value="">All Locations</option>
                                        {filterOptions.locations.map(location => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Brand Filter - Replaced Vehicle Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Car size={18} className="text-blue-600" />
                                        Vehicle Brand
                                    </label>
                                    <select 
                                        value={filters.manufacturer}
                                        onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    >
                                        <option value="">All Brands</option>
                                        {filterOptions.manufacturers.map(manufacturer => (
                                            <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fuel Type Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Fuel size={18} className="text-blue-600" />
                                        Fuel Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {filterOptions.fuelTypes.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => handleFilterChange('fuel_type', filters.fuel_type === type ? '' : type)}
                                                className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                                                    filters.fuel_type === type 
                                                        ? `bg-gradient-to-r ${getFuelTypeColor(type)} text-white shadow-lg` 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Transmission Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <SlidersHorizontal size={18} className="text-blue-600" />
                                        Transmission
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {filterOptions.transmissions.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => handleFilterChange('transmission', filters.transmission === type ? '' : type)}
                                                className={`p-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 justify-center ${
                                                    filters.transmission === type 
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                        : 'border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {getTransmissionIcon(type)}
                                                <span className="text-sm font-medium">{type}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Seating Capacity */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <Users size={18} className="text-blue-600" />
                                        Min Seating Capacity
                                    </label>
                                    <select 
                                        value={filters.min_seating}
                                        onChange={(e) => handleFilterChange('min_seating', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                    >
                                        <option value="">Any Seats</option>
                                        {filterOptions.seatingOptions.map(seats => (
                                            <option key={seats} value={seats}>{seats}+ Seats</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Price Range - Fixed to work with backend */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                        💰 Daily Price Range ($)
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <input 
                                                type="number"
                                                placeholder="Min $"
                                                value={filters.min_price}
                                                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                                min="0"
                                                step="10"
                                            />
                                        </div>
                                        <div>
                                            <input 
                                                type="number"
                                                placeholder="Max $"
                                                value={filters.max_price}
                                                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
                                                min="0"
                                                step="10"
                                            />
                                        </div>
                                    </div>
                                    {(filters.min_price || filters.max_price) && (
                                        <div className="mt-2 text-xs text-gray-500">
                                            Range: ${filters.min_price || '0'} - ${filters.max_price || 'Any'}
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={clearFilters}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
                                    >
                                        Clear All
                                    </button>
                                    {showMobileFilters && (
                                        <button
                                            onClick={() => setShowMobileFilters(false)}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg hover:shadow-xl"
                                        >
                                            Show {vehicles.length} Results
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Vehicles Grid */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {vehicles.length} Vehicles Available
                                </h2>
                                {isLoading && (
                                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Loading...
                                    </div>
                                )}
                                {activeFiltersCount > 0 && !isLoading && (
                                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-colors"
                            >
                                <Filter size={18} />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Loading, Empty, and Vehicle Grid sections */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, index) => (
                                    <div key={index} className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden animate-pulse flex flex-col h-full">
                                        <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 flex-shrink-0"></div>
                                        <div className="p-6 space-y-4 flex-grow">
                                            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="h-8 bg-gray-200 rounded"></div>
                                                <div className="h-8 bg-gray-200 rounded"></div>
                                                <div className="h-8 bg-gray-200 rounded"></div>
                                            </div>
                                            <div className="h-12 bg-gray-200 rounded mt-auto"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : vehicles.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-12 text-center">
                                <Car size={80} className="mx-auto text-gray-300 mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">No vehicles match your search</h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    Try adjusting your filters or search terms to find your perfect ride.
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button 
                                        onClick={clearFilters}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                                    >
                                        Clear All Filters
                                    </button>
                                    <Link 
                                        to="/"
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-xl font-semibold transition-colors"
                                    >
                                        Back to Home
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {vehicles.map((vehicle) => (
                                    <div key={vehicle.vehicle_id} className="group flex">
                                        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col w-full">
                                            {/* Vehicle card content remains exactly the same */}
                                            <div className="relative h-48 bg-gradient-to-br from-blue-200 via-blue-100 to-indigo-200 overflow-hidden flex-shrink-0">
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                
                                                <div className={`absolute top-4 left-0 px-4 py-2 rounded-r-full text-xs font-bold text-white shadow-lg ${
                                                    vehicle.availability 
                                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                                        : 'bg-gradient-to-r from-red-500 to-pink-600'
                                                }`}>
                                                    {vehicle.availability ? 'AVAILABLE' : 'BOOKED'}
                                                </div>

                                                <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 p-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl">
                                                    <Heart size={18} className="text-white hover:text-red-400" />
                                                </button>

                                                {vehicle.current_location && (
                                                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 backdrop-blur-sm">
                                                        <MapPin size={12} />
                                                        <span className="font-medium">{vehicle.current_location}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-6 flex flex-col flex-grow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight truncate">
                                                            {vehicle.specification.manufacturer} {vehicle.specification.model}
                                                        </h3>
                                                        <p className="text-gray-500 text-sm">
                                                            {vehicle.specification.year} • {vehicle.specification.vehicle_type.replace('-', ' ')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-3">
                                                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                                            ${vehicle.rental_rate}
                                                            <span className="text-sm text-gray-500">/day</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                                                    <div className="text-center">
                                                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                                                            getFuelTypeColor(vehicle.specification.fuel_type).replace('from-', 'bg-gradient-to-r from-')
                                                        }`}>
                                                            <Fuel size={14} className="text-white" />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-700">{vehicle.specification.fuel_type}</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="w-8 h-8 mx-auto bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-1">
                                                            {getTransmissionIcon(vehicle.specification.transmission)}
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-700">{vehicle.specification.transmission}</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="w-8 h-8 mx-auto bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-1">
                                                            <Users size={14} className="text-white" />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-700">{vehicle.specification.seating_capacity} seats</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {vehicle.specification.engine_capacity && (
                                                        <span className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                                                            <Zap size={12} />
                                                            {vehicle.specification.engine_capacity}L
                                                        </span>
                                                    )}
                                                    {vehicle.specification.color && (
                                                        <span className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                                                            <Palette size={12} />
                                                            {vehicle.specification.color}
                                                        </span>
                                                    )}
                                                </div>

                                                {vehicle.specification.features && (
                                                    <div className="mb-4 flex-grow">
                                                        <div className="flex flex-wrap gap-1">
                                                            {vehicle.specification.features.split(', ').slice(0, 4).map((feature, index) => (
                                                                <span key={index} className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                                                                    {getFeatureIcon(feature)}
                                                                    {feature.trim()}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex gap-3 mt-auto pt-4">
                                                    <Link 
                                                        to={`/vehicles/${vehicle.vehicle_id}`}
                                                        className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 text-center shadow-sm hover:shadow-md border border-blue-900"
                                                    >
                                                        View Details
                                                    </Link>
                                                    <Link 
                                                        to={`/bookings/new?vehicleId=${vehicle.vehicle_id}`}
                                                        className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 text-center shadow-lg hover:shadow-xl border ${
                                                            vehicle.availability 
                                                                ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                                                                : 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-400'
                                                        }`}
                                                    >
                                                        {vehicle.availability ? 'Rent Now' : 'Booked'}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FOOTER PLACEMENT - Add your Footer component here */}
            <Footer />
        </div>
    )
}

export default VehiclesListing