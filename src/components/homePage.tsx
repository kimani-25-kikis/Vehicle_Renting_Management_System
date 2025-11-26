import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Car, Zap, Fuel, Settings, Star, Shield, Clock, Users, MapPin, Calendar, Heart, Search } from 'lucide-react'
import { useGetVehiclesQuery } from '../features/api/vehiclesApi'
import type { Vehicle } from '../types/Types'
import Navbar from './Navbar'
import Footer from './Footer'


import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';


const FEATURED_VEHICLES_BG = 'https://m.media-amazon.com/images/I/81uVQ3ZZwqL._AC_UF350,350_QL80_.jpg'

const HomePage: React.FC = () => {
    const [searchParams, setSearchParams] = useState({
        location: '',
        pickupDate: '',
        returnDate: ''
    })
    const { data: vehiclesData, isLoading, error } = useGetVehiclesQuery({
        limit: 6,
        availability: true
    })

   
    const { isAuthenticated } = useSelector((state: RootState) => state.authSlice);

    const featuredVehicles = vehiclesData?.vehicles || []

    const categories = [
        { icon: <Zap size={24} />, name: 'Electric', count: '12 Vehicles', color: 'text-green-500', filter: 'Electric' },
        { icon: <Fuel size={24} />, name: 'Hybrid', count: '8 Vehicles', color: 'text-blue-500', filter: 'Hybrid' },
        { icon: <Settings size={24} />, name: 'Automatic', count: '25 Vehicles', color: 'text-purple-500', filter: 'Automatic' },
        { icon: <Car size={24} />, name: 'Manual', count: '6 Vehicles', color: 'text-orange-500', filter: 'Manual' }
    ]

    const features = [
        { icon: <Shield size={32} />, title: 'Fully Insured', description: 'All vehicles come with comprehensive insurance coverage' },
        { icon: <Clock size={32} />, title: '24/7 Support', description: 'Round-the-clock customer service for your peace of mind' },
        { icon: <Users size={32} />, title: '5,000+ Customers', description: 'Join our growing community of satisfied renters' },
        { icon: <MapPin size={32} />, title: 'Multiple Locations', description: 'Convenient pickup and drop-off locations nationwide' }
    ]

    const handleSearchChange = (field: string, value: string) => {
        setSearchParams(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleQuickSearch = () => {
        // This will navigate to vehicles page with search filters
        const params = new URLSearchParams()
        if (searchParams.location) params.append('location', searchParams.location)
        if (searchParams.pickupDate) params.append('pickupDate', searchParams.pickupDate)
        if (searchParams.returnDate) params.append('returnDate', searchParams.returnDate)
        
        window.location.href = `/vehicles?${params.toString()}`
    }

    // Get unique locations from vehicles for dropdown
    const locations = [...new Set(featuredVehicles
        .map(v => v.current_location)
        .filter(Boolean)
    )]

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Vehicles</h2>
                    <p className="text-gray-600">Please try again later</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar/>
            
            {/* Hero Section */}
            <section 
                className="relative py-20 text-white"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/50"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Find Your Perfect 
                                <span className="text-orange-500"> Ride</span>
                            </h1>
                            <p className="text-xl text-white/90 mb-8 leading-relaxed">
                                Discover premium vehicles at unbeatable prices. From eco-friendly electric cars to luxury SUVs, 
                                we have the perfect ride for every journey.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link 
                                    to="/vehicles"
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl text-center"
                                >
                                    Browse All Vehicles
                                </Link>
                                {/* CONDITIONAL RENDERING: Hide Create Account button when logged in */}
                                {!isAuthenticated && (
                                    <Link 
                                        to="/register"
                                        className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 text-center"
                                    >
                                        Create Account
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                                    <Search size={24} />
                                    Quick Search
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Pickup Location</label>
                                        <select 
                                            value={searchParams.location}
                                            onChange={(e) => handleSearchChange('location', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="">Select location</option>
                                            {locations.map(location => (
                                                <option key={location} value={location}>{location}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Pickup Date</label>
                                            <input 
                                                type="date"
                                                value={searchParams.pickupDate}
                                                onChange={(e) => handleSearchChange('pickupDate', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Return Date</label>
                                            <input 
                                                type="date"
                                                value={searchParams.returnDate}
                                                onChange={(e) => handleSearchChange('returnDate', e.target.value)}
                                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleQuickSearch}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Search size={20} />
                                        Search Vehicles
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">
                            Why Choose RentWheels
                        </h2>
                        <p className="text-lg text-blue-900 max-w-2xl mx-auto">
                            Experience the difference with our premium service and extensive fleet of well-maintained vehicles.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="text-blue-900 mb-4 flex justify-center">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vehicle Categories */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">
                            Browse by Category
                        </h2>
                        <p className="text-lg text-blue-900">
                            Find the perfect vehicle type for your needs
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categories.map((category, index) => (
                            <Link 
                                key={index}
                                to={`/vehicles?filter=${category.filter}`}
                                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 block"
                            >
                                <div className={`${category.color} mb-4`}>
                                    {category.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {category.name}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {category.count}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Vehicles - With Faded Background Image 🚗 */}
            <section className="py-16 relative overflow-hidden"> 
                {/* Faded Background Image Layer */}
                <div 
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                        backgroundImage: `url('${FEATURED_VEHICLES_BG}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: 'grayscale(100%) blur(2px)'
                    }}
                ></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">
                                Featured Vehicles
                            </h2>
                            <p className="text-lg text-blue-900">
                                {isLoading ? 'Loading vehicles...' : 'Our most popular and available vehicles'}
                            </p>
                        </div>
                        <Link 
                            to="/vehicles"
                            className="hidden lg:block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                        >
                            View All Vehicles
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                                    <div className="h-48 bg-gray-300"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                        <div className="h-10 bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredVehicles.map((vehicle: Vehicle) => (
                                <div key={vehicle.vehicle_id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
                                    {/* Vehicle Image - FIXED */}
                                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                                        {/* Vehicle Image */}
                                        {vehicle.specification.image_url ? (
                                            <img 
                                                src={vehicle.specification.image_url}
                                                alt={`${vehicle.specification.manufacturer} ${vehicle.specification.model}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-200 via-blue-100 to-indigo-200 flex items-center justify-center">
                                                <Car size={48} className="text-blue-400" />
                                            </div>
                                        )}
                                        
                                        {/* Premium Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                                        
                                        {/* Favorite Button */}
                                        <div className="absolute top-4 right-4 flex space-x-2">
                                            <button className="bg-white/90 hover:bg-white p-2 rounded-full transition-colors">
                                                <Heart size={18} className="text-gray-600 hover:text-red-500" />
                                            </button>
                                        </div>

                                        {/* Fuel Type Badge */}
                                        <div className="absolute bottom-4 left-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                vehicle.specification.fuel_type === 'Electric' ? 'bg-green-100 text-green-800' :
                                                vehicle.specification.fuel_type === 'Hybrid' ? 'bg-blue-100 text-blue-800' :
                                                vehicle.specification.transmission === 'Manual' ? 'bg-orange-100 text-orange-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                                {vehicle.specification.fuel_type === 'Electric' ? 'Electric' :
                                                vehicle.specification.fuel_type === 'Hybrid' ? 'Hybrid' :
                                                vehicle.specification.transmission}
                                            </span>
                                        </div>

                                        {/* Location */}
                                        {vehicle.current_location && (
                                            <div className="absolute bottom-4 right-4">
                                                <span className="bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                                                    <MapPin size={12} />
                                                    {vehicle.current_location}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vehicle Details */}
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                    {vehicle.specification.manufacturer} {vehicle.specification.model}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    {vehicle.specification.year} • {vehicle.specification.vehicle_type.replace('-', ' ')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-blue-900">
                                                    ${vehicle.rental_rate}<span className="text-sm text-gray-600">/day</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                {vehicle.specification.fuel_type}
                                            </span>
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                {vehicle.specification.transmission}
                                            </span>
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                {vehicle.specification.seating_capacity} Seats
                                            </span>
                                            {vehicle.specification.color && (
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                    {vehicle.specification.color}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-3">
                                            <Link 
                                                to={`/vehicles/${vehicle.vehicle_id}`}
                                                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition-colors text-sm text-center"
                                            >
                                                View Details
                                            </Link>
                                            <Link 
                                                to={`/bookings/new?vehicleId=${vehicle.vehicle_id}`}
                                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors text-sm text-center"
                                            >
                                                Rent Now
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Mobile View All Button */}
                    <div className="text-center mt-8 lg:hidden">
                        <Link 
                            to="/vehicles"
                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 inline-block"
                        >
                            View All Vehicles
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
                        Join thousands of satisfied customers who trust RentWheels for their transportation needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {/* CONDITIONAL RENDERING: Hide Create Account button when logged in */}
                        {!isAuthenticated && (
                            <Link 
                                to="/register"
                                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                            >
                                Create Account
                            </Link>
                        )}
                        <Link 
                            to="/contact"
                            className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
            <Footer/>
        </div>
    )
}

export default HomePage