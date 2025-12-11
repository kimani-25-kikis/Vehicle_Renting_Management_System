import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useGetVehiclesQuery } from '../features/api/vehiclesApi'
import { 
    Car, Fuel, Users, Settings, MapPin, Heart, 
    Search, Filter, X, SlidersHorizontal, Sparkles,
    ArrowDown, CheckCircle, XCircle, Wrench, Clock
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

interface Filters {
    location: string;
    manufacturer: string;
    fuel_type: string;
    price_range: string;
    search: string;
    status?: 'available' | 'rented' | 'maintenance'; // Add status filter
}

// Enhanced Hero Component with Scroll Arrow
const VehiclesHero: React.FC = () => {
    const scrollToVehicles = () => {
        const vehiclesSection = document.getElementById('vehicles-section');
        if (vehiclesSection) {
            vehiclesSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div 
            className="relative py-20 lg:py-28 bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1493238792000-8113da705763?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FyJTIwd2FsbHBhcGVyfGVufDB8fDB8fHww")'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-orange-500/20 mix-blend-soft-light"></div>
            
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Discover Your 
                    <span className="text-orange-400 block">Perfect Ride</span>
                </h1>
                <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                    Explore our premium collection of luxury and performance vehicles. 
                    Find the perfect car for your next adventure.
                </p>
                
                {/* Scroll Down Arrow */}
                <div className="flex justify-center animate-bounce">
                    <button 
                        onClick={scrollToVehicles}
                        className="flex flex-col items-center text-white hover:text-orange-400 transition-colors duration-300 group"
                    >
                        <span className="text-sm mb-2 font-semibold group-hover:text-orange-400 transition-colors">
                            Explore Vehicles
                        </span>
                        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center group-hover:border-orange-400 transition-colors">
                            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse group-hover:bg-orange-400 transition-colors"></div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    )
}

// Status badge component
const StatusBadge: React.FC<{ status: 'available' | 'rented' | 'maintenance' }> = ({ status }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'available':
                return {
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    borderColor: 'border-green-300',
                    icon: <CheckCircle size={14} />,
                    label: 'Available Now'
                };
            case 'rented':
                return {
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    borderColor: 'border-red-300',
                    icon: <XCircle size={14} />,
                    label: 'Currently Rented'
                };
            case 'maintenance':
                return {
                    bgColor: 'bg-yellow-100',
                    textColor: 'text-yellow-800',
                    borderColor: 'border-yellow-300',
                    icon: <Wrench size={14} />,
                    label: 'Under Maintenance'
                };
            default:
                return {
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    borderColor: 'border-gray-300',
                    icon: <Clock size={14} />,
                    label: 'Check Status'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className={`flex items-center gap-2 ${config.bgColor} ${config.textColor} ${config.borderColor} border px-3 py-1.5 rounded-full text-xs font-semibold`}>
            {config.icon}
            {config.label}
        </div>
    );
};

// Enhanced Filter Bar Component with Status Filter
const FilterBar: React.FC<{
    filters: Filters
    activeFiltersCount: number
    onFilterChange: (key: keyof Filters, value: string) => void
    onClearFilters: () => void
    onShowMobileFilters: () => void
}> = ({ filters, activeFiltersCount, onFilterChange, onClearFilters, onShowMobileFilters }) => {
    const filterOptions = {
        locations: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'],
        manufacturers: ['Toyota', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Nissan', 'Honda', 'Mazda', 'Subaru'],
        fuelTypes: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
        priceRanges: [
            { value: '0-50', label: 'Under $50' },
            { value: '50-100', label: '$50 - $100' },
            { value: '100-200', label: '$100 - $200' },
            { value: '200+', label: '$200+' }
        ],
        status: [
            { value: 'available', label: 'Available', color: 'text-green-600' },
            { value: 'rented', label: 'Rented', color: 'text-red-600' },
            { value: 'maintenance', label: 'Maintenance', color: 'text-yellow-600' }
        ]
    }

    return (
        <div id="vehicles-section" className="bg-white shadow-xl border-b border-gray-200 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Main Filter Row */}
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
                    {/* Location Filter */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <MapPin size={16} className="text-orange-500" />
                            Location
                        </label>
                        <select 
                            value={filters.location}
                            onChange={(e) => onFilterChange('location', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-300 hover:border-blue-900"
                        >
                            <option value="">All Locations</option>
                            {filterOptions.locations.map(location => (
                                <option key={location} value={location}>{location}</option>
                            ))}
                        </select>
                        <MapPin size={18} className="absolute left-3 top-11 text-gray-400" />
                    </div>

                    {/* Brand Filter */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Car size={16} className="text-orange-500" />
                            Brand
                        </label>
                        <select 
                            value={filters.manufacturer}
                            onChange={(e) => onFilterChange('manufacturer', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-300 hover:border-blue-900"
                        >
                            <option value="">All Brands</option>
                            {filterOptions.manufacturers.map(manufacturer => (
                                <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                            ))}
                        </select>
                        <Car size={18} className="absolute left-3 top-11 text-gray-400" />
                    </div>

                    {/* Fuel Type Filter */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Fuel size={16} className="text-orange-500" />
                            Fuel Type
                        </label>
                        <select 
                            value={filters.fuel_type}
                            onChange={(e) => onFilterChange('fuel_type', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-300 hover:border-blue-900"
                        >
                            <option value="">All Fuel Types</option>
                            {filterOptions.fuelTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <Fuel size={18} className="absolute left-3 top-11 text-gray-400" />
                    </div>

                    {/* Price Range Filter */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Sparkles size={16} className="text-orange-500" />
                            Price Range
                        </label>
                        <select 
                            value={filters.price_range}
                            onChange={(e) => onFilterChange('price_range', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-300 hover:border-blue-900"
                        >
                            <option value="">Any Price</option>
                            {filterOptions.priceRanges.map(range => (
                                <option key={range.value} value={range.value}>{range.label}</option>
                            ))}
                        </select>
                        <Sparkles size={18} className="absolute left-3 top-11 text-gray-400" />
                    </div>

                    {/* Status Filter - NEW */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <CheckCircle size={16} className="text-orange-500" />
                            Status
                        </label>
                        <select 
                            value={filters.status || ''}
                            onChange={(e) => onFilterChange('status', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-300 hover:border-blue-900"
                        >
                            <option value="">All Status</option>
                            {filterOptions.status.map(status => (
                                <option key={status.value} value={status.value} className={status.color}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                        <CheckCircle size={18} className="absolute left-3 top-11 text-gray-400" />
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Search size={16} className="text-orange-500" />
                            Search
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search vehicles..."
                                value={filters.search}
                                onChange={(e) => onFilterChange('search', e.target.value)}
                                className="w-full pl-12 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all duration-300 hover:border-blue-900"
                            />
                            {filters.search && (
                                <button 
                                    onClick={() => onFilterChange('search', '')}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Filters & Controls */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pt-4 border-t border-gray-200">
                    {/* Active Filters */}
                    {activeFiltersCount > 0 && (
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-semibold text-blue-900">Active Filters:</span>
                            {Object.entries(filters).map(([key, value]) => {
                                const filterKey = key as keyof Filters;
                                const filterValue = value as string;
                                
                                return filterValue && (
                                    <span 
                                        key={filterKey}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border ${
                                            filterKey === 'status' 
                                                ? filterValue === 'available' 
                                                    ? 'bg-green-100 text-green-800 border-green-200'
                                                    : filterValue === 'rented'
                                                    ? 'bg-red-100 text-red-800 border-red-200'
                                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                : 'bg-orange-100 text-orange-800 border-orange-200'
                                        }`}
                                    >
                                        {filterKey === 'price_range' ? 'Price' : 
                                         filterKey === 'fuel_type' ? 'Fuel Type' :
                                         filterKey === 'status' ? 'Status' :
                                         filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}: {filterValue}
                                        <button 
                                            onClick={() => onFilterChange(filterKey, '')}
                                            className="hover:opacity-70 transition-opacity ml-1"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center gap-4 ml-auto">
                        {/* Clear Filters */}
                        {activeFiltersCount > 0 && (
                            <button 
                                onClick={onClearFilters}
                                className="bg-gray-100 hover:bg-gray-200 text-blue-900 px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 border border-gray-300"
                            >
                                Clear All
                                <X size={18} />
                            </button>
                        )}

                        {/* Mobile Filter Button */}
                        <button
                            onClick={onShowMobileFilters}
                            className="lg:hidden bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-orange-200"
                        >
                            <SlidersHorizontal size={20} />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="bg-blue-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const VehiclesListing: React.FC = () => {
    const [filters, setFilters] = useState<Filters>({
        location: '',
        manufacturer: '',
        fuel_type: '',
        price_range: '',
        search: ''
    })
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

    const { data: vehiclesData, isLoading, error, refetch } = useGetVehiclesQuery(debouncedFilters)
    const vehicles = vehiclesData?.vehicles || []

    // Count active filters
    useEffect(() => {
        const count = Object.values(filters).filter(value => 
            value !== '' && value !== null && value !== undefined
        ).length
        setActiveFiltersCount(count)
    }, [filters])

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        setFilters({
            location: '',
            manufacturer: '',
            fuel_type: '',
            price_range: '',
            search: ''
        })
    }

    const getFuelTypeColor = (fuelType: string) => {
        switch (fuelType.toLowerCase()) {
            case 'electric': return 'text-green-500'
            case 'hybrid': return 'text-blue-500'
            case 'petrol': return 'text-orange-500'
            case 'diesel': return 'text-gray-600'
            default: return 'text-gray-500'
        }
    }

    // Get status statistics
    const getStatusStats = () => {
        const stats = {
            available: 0,
            rented: 0,
            maintenance: 0,
            total: vehicles.length
        };

        vehicles.forEach(vehicle => {
            if (vehicle.status) {
                stats[vehicle.status] = (stats[vehicle.status] || 0) + 1;
            }
        });

        return stats;
    }

    const statusStats = getStatusStats();

    const filterOptions = {
        locations: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'],
        manufacturers: ['Toyota', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Nissan', 'Honda', 'Mazda', 'Subaru'],
        fuelTypes: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
        priceRanges: [
            { value: '0-50', label: 'Under $50' },
            { value: '50-100', label: '$50 - $100' },
            { value: '100-200', label: '$100 - $200' },
            { value: '200+', label: '$200+' }
        ],
        status: [
            { value: 'available', label: 'Available', color: 'text-green-600' },
            { value: 'rented', label: 'Rented', color: 'text-red-600' },
            { value: 'maintenance', label: 'Maintenance', color: 'text-yellow-600' }
        ]
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-16">
                <div className="text-center bg-white rounded-2xl p-8 shadow-lg border border-gray-200 max-w-md">
                    <Car size={64} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">We couldn't load the vehicles. Please try again.</p>
                    <button 
                        onClick={() => refetch()}
                        className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Fixed Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar/>
            </div>

            {/* Space between navbar and hero */}
            <div className="pt-16"></div>

            {/* Hero Section */}
            <VehiclesHero />

            {/* Filter Bar */}
            <FilterBar
                filters={filters}
                activeFiltersCount={activeFiltersCount}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                onShowMobileFilters={() => setShowMobileFilters(true)}
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Status Summary Stats - NEW */}
                {!isLoading && vehicles.length > 0 && (
                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                            <Car className="text-orange-500" size={20} />
                            Fleet Status Overview
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="text-2xl font-bold text-blue-900">{statusStats.total}</div>
                                <div className="text-sm text-gray-600">Total Vehicles</div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
                                <div className="text-2xl font-bold text-green-700">{statusStats.available}</div>
                                <div className="text-sm text-green-600 flex items-center gap-1">
                                    <CheckCircle size={14} />
                                    Available Now
                                </div>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                                <div className="text-2xl font-bold text-red-700">{statusStats.rented}</div>
                                <div className="text-sm text-red-600 flex items-center gap-1">
                                    <XCircle size={14} />
                                    Currently Rented
                                </div>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
                                <div className="text-2xl font-bold text-yellow-700">{statusStats.maintenance}</div>
                                <div className="text-sm text-yellow-600 flex items-center gap-1">
                                    <Wrench size={14} />
                                    Under Maintenance
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Filters Overlay */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
                        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                                    <h3 className="text-xl font-bold text-blue-900">Filters</h3>
                                    <button 
                                        onClick={() => setShowMobileFilters(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-900"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Search Filter */}
                                    <div>
                                        <label className="block text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                            <Search size={16} className="text-orange-500" />
                                            Search
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Search vehicles..."
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                        />
                                    </div>

                                    {/* Location Filter */}
                                    <div>
                                        <label className="block text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                            <MapPin size={16} className="text-orange-500" />
                                            Location
                                        </label>
                                        <select 
                                            value={filters.location}
                                            onChange={(e) => handleFilterChange('location', e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                        >
                                            <option value="">All Locations</option>
                                            {filterOptions.locations.map(location => (
                                                <option key={location} value={location}>{location}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Brand Filter */}
                                    <div>
                                        <label className="block text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                            <Car size={16} className="text-orange-500" />
                                            Brand
                                        </label>
                                        <select 
                                            value={filters.manufacturer}
                                            onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                        >
                                            <option value="">All Brands</option>
                                            {filterOptions.manufacturers.map(manufacturer => (
                                                <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Fuel Type Filter */}
                                    <div>
                                        <label className="block text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                            <Fuel size={16} className="text-orange-500" />
                                            Fuel Type
                                        </label>
                                        <select 
                                            value={filters.fuel_type}
                                            onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                        >
                                            <option value="">All Fuel Types</option>
                                            {filterOptions.fuelTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Price Range Filter */}
                                    <div>
                                        <label className="block text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                            <Sparkles size={16} className="text-orange-500" />
                                            Price Range
                                        </label>
                                        <select 
                                            value={filters.price_range}
                                            onChange={(e) => handleFilterChange('price_range', e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                        >
                                            <option value="">Any Price</option>
                                            {filterOptions.priceRanges.map(range => (
                                                <option key={range.value} value={range.value}>{range.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status Filter - NEW */}
                                    <div>
                                        <label className="block text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                            <CheckCircle size={16} className="text-orange-500" />
                                            Status
                                        </label>
                                        <select 
                                            value={filters.status || ''}
                                            onChange={(e) => handleFilterChange('status', e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                                        >
                                            <option value="">All Status</option>
                                            {filterOptions.status.map(status => (
                                                <option key={status.value} value={status.value} className={status.color}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={clearFilters}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-blue-900 py-3 rounded-lg font-semibold transition-all duration-300 border border-gray-300"
                                        >
                                            Clear All
                                        </button>
                                        <button
                                            onClick={() => setShowMobileFilters(false)}
                                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-200"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-blue-900">
                            {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'} Available
                        </h2>
                        {activeFiltersCount > 0 && !isLoading && (
                            <p className="text-orange-600 mt-2 font-medium">
                                Filtered by {activeFiltersCount} {activeFiltersCount === 1 ? 'criteria' : 'criteria'}
                            </p>
                        )}
                    </div>
                    
                    {/* Desktop Filter Stats */}
                    <div className="hidden lg:flex items-center gap-4">
                        {activeFiltersCount > 0 && (
                            <button 
                                onClick={clearFilters}
                                className="text-blue-900 hover:text-orange-600 font-semibold transition-colors flex items-center gap-2"
                            >
                                Clear Filters
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Vehicles Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden animate-pulse">
                                <div className="h-48 bg-gray-300"></div>
                                <div className="p-6 space-y-4">
                                    <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                    <div className="h-10 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                        <Car size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-blue-900 mb-3">No vehicles found</h3>
                        <p className="text-gray-600 mb-6">
                            {activeFiltersCount > 0 
                                ? "Try adjusting your filters to see more results."
                                : "Check back later for new vehicles."
                            }
                        </p>
                        {activeFiltersCount > 0 && (
                            <button 
                                onClick={clearFilters}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-orange-200"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vehicles.map((vehicle) => (
                            <div key={vehicle.vehicle_id} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group hover:border-orange-200">
                                {/* Vehicle Image with Status Overlay */}
                                <div className="relative h-48 overflow-hidden">
                                    <img 
                                        src={vehicle.specification.image_url || 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Toyota_Corolla_Fielder_rear.jpg/1200px-Toyota_Corolla_Fielder_rear.jpg'}
                                        alt={`${vehicle.specification.manufacturer} ${vehicle.specification.model}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://cache3.pakwheels.com/ad_pictures/1332/tn_toyota-corolla-fielder-hybrid-g-2020-133269008.webp'
                                        }}
                                    />
                                    {/* Status Badge Top Left */}
                                    {vehicle.status && (
                                        <div className={`absolute top-4 left-0 px-3 py-1.5 rounded-r-full text-xs font-bold text-white shadow-lg ${
                                            vehicle.status === 'available' ? 'bg-green-500' :
                                            vehicle.status === 'rented' ? 'bg-red-500' :
                                            'bg-yellow-500'
                                        }`}>
                                            {vehicle.status === 'available' ? 'AVAILABLE' :
                                             vehicle.status === 'rented' ? 'RENTED' :
                                             'MAINTENANCE'}
                                        </div>
                                    )}
                                    <button className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full transition-colors shadow-lg hover:shadow-xl">
                                        <Heart size={18} className="text-gray-600 hover:text-red-500 transition-colors" />
                                    </button>
                                </div>

                                {/* Vehicle Details */}
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-blue-900 mb-1 group-hover:text-orange-600 transition-colors">
                                                {vehicle.specification.manufacturer} {vehicle.specification.model}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {vehicle.specification.year} • {vehicle.specification.vehicle_type.replace('-', ' ')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-900">
                                                ${vehicle.rental_rate}
                                                <span className="text-sm text-gray-600">/day</span>
                                            </div>
                                            {/* Status Badge */}
                                            {vehicle.status && (
                                                <div className="mt-2">
                                                    <StatusBadge status={vehicle.status} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Key Specs */}
                                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                                        <div className={`flex items-center gap-1 ${getFuelTypeColor(vehicle.specification.fuel_type)}`}>
                                            <Fuel size={16} />
                                            {vehicle.specification.fuel_type}
                                        </div>
                                        <div className="flex items-center gap-1 text-purple-600">
                                            <Settings size={16} />
                                            {vehicle.specification.transmission}
                                        </div>
                                        <div className="flex items-center gap-1 text-pink-600">
                                            <Users size={16} />
                                            {vehicle.specification.seating_capacity} seats
                                        </div>
                                    </div>

                                    {/* Location */}
                                    {vehicle.current_location && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                                            <MapPin size={16} className="text-blue-500" />
                                            {vehicle.current_location}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Link 
                                            to={`/vehicles/${vehicle.vehicle_id}`}
                                            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold text-sm transition-all duration-300 text-center shadow-lg hover:shadow-blue-200"
                                        >
                                            View Details
                                        </Link>
                                        <Link 
                                            to={`/bookings/new?vehicleId=${vehicle.vehicle_id}`}
                                            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 text-center ${
                                                vehicle.status === 'available'
                                                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-200' 
                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                            onClick={(e) => {
                                                if (vehicle.status !== 'available') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            title={vehicle.status !== 'available' 
                                                ? vehicle.status === 'rented' 
                                                    ? 'This vehicle is currently rented'
                                                    : 'This vehicle is under maintenance'
                                                : 'Book this vehicle'
                                            }
                                        >
                                            {vehicle.status === 'available' 
                                                ? 'Rent Now' 
                                                : vehicle.status === 'rented'
                                                ? 'Currently Rented'
                                                : 'Under Maintenance'
                                            }
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default VehiclesListing