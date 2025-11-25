import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { useGetVehicleByIdQuery, useGetVehiclesQuery } from '../features/api/vehiclesApi'
import { 
    Car, Fuel, Users, Settings, MapPin, Heart, 
    Star, Zap, Calendar, Shield, Gauge, Palette,
    ArrowLeft, Clock, CheckCircle, AlertCircle,
    Wifi, Snowflake, Music, Navigation,
    ShieldCheck, Battery, Cog, Gem,
    Wrench, Activity, FileText,
    Award, ThumbsUp, Star as StarIcon
} from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const VehicleDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const vehicleId = parseInt(id || '0')
    
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const [activeTab, setActiveTab] = useState('overview')
    const [bookingDates, setBookingDates] = useState({
        pickupDate: '',
        returnDate: ''
    })

    // Fetch the main vehicle data
    const { data: vehicle, isLoading, error } = useGetVehicleByIdQuery(vehicleId)
    
    // Fetch ALL vehicles for random selection (we'll filter client-side)
    const { data: allVehiclesData } = useGetVehiclesQuery({})
    const allVehicles = allVehiclesData?.vehicles || []

    // Get 5 random vehicles (excluding current vehicle)
    const getRandomVehicles = () => {
        if (allVehicles.length <= 1) return []
        
        const otherVehicles = allVehicles.filter(v => v.vehicle_id !== vehicleId)
        const shuffled = [...otherVehicles].sort(() => 0.5 - Math.random())
        return shuffled.slice(0, 5)
    }

    const relatedVehicles = getRandomVehicles()

    // Calculate rental duration and total
    const calculateRentalDetails = () => {
        if (!bookingDates.pickupDate || !bookingDates.returnDate) return null
        
        const pickup = new Date(bookingDates.pickupDate)
        const returnDate = new Date(bookingDates.returnDate)
        const timeDiff = returnDate.getTime() - pickup.getTime()
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24))
        
        if (days <= 0) return null
        
        const dailyRate = vehicle?.rental_rate || 0
        const subtotal = days * dailyRate
        const insurance = 15
        const tax = subtotal * 0.08
        const total = subtotal + insurance + tax
        
        return { days, subtotal, insurance, tax, total }
    }

    const rentalDetails = calculateRentalDetails()

    // Generate vehicle images - FIXED: Use actual image_url from specification
    const generateVehicleImages = () => {
        if (!vehicle) return []
        
        const mainImage = vehicle.specification.image_url
        if (!mainImage) {
            // Fallback images if no image_url is provided
            return [
                'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ]
        }

        // If we have a main image, use it and add some placeholder variations
        return [
            mainImage,
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]
    }

    const vehicleImages = generateVehicleImages()

    // Categorize features from the database
    const categorizeFeatures = (featuresString: string) => {
        if (!featuresString) return {}
        
        const features = featuresString.split(',').map(f => f.trim())
        const categories: { [key: string]: string[] } = {
            comfort: [],
            entertainment: [],
            safety: [],
            technology: [],
            exterior: []
        }

        features.forEach(feature => {
            const lowerFeature = feature.toLowerCase()
            if (lowerFeature.includes('ac') || lowerFeature.includes('climate') || lowerFeature.includes('leather') || lowerFeature.includes('heated')) {
                categories.comfort.push(feature)
            } else if (lowerFeature.includes('bluetooth') || lowerFeature.includes('audio') || lowerFeature.includes('sound') || lowerFeature.includes('entertainment')) {
                categories.entertainment.push(feature)
            } else if (lowerFeature.includes('airbag') || lowerFeature.includes('camera') || lowerFeature.includes('sensor') || lowerFeature.includes('alarm')) {
                categories.safety.push(feature)
            } else if (lowerFeature.includes('navigation') || lowerFeature.includes('gps') || lowerFeature.includes('display') || lowerFeature.includes('connect')) {
                categories.technology.push(feature)
            } else {
                categories.exterior.push(feature)
            }
        })

        return categories
    }

    const featureCategories = vehicle?.specification.features ? categorizeFeatures(vehicle.specification.features) : {}

    // Mock maintenance data (in real app, this would come from your API)
    const maintenanceHistory = [
        {
            id: 1,
            type: 'Routine Service',
            date: '2024-01-15',
            description: 'Full service including oil change, filter replacement, and brake inspection',
            cost: 120,
            mileage: 15000,
            nextService: '2024-07-15',
            performedBy: 'AutoCare Center'
        },
        {
            id: 2,
            type: 'Tire Replacement',
            date: '2023-11-20',
            description: 'Replaced all four tires with premium all-season tires',
            cost: 450,
            mileage: 12000,
            nextService: '2025-11-20',
            performedBy: 'Tire Masters'
        },
        {
            id: 3,
            type: 'Brake Service',
            date: '2023-08-10',
            description: 'Brake pad replacement and rotor resurfacing',
            cost: 280,
            mileage: 8000,
            nextService: '2024-08-10',
            performedBy: 'Brake Experts'
        }
    ]

    // Mock vehicle history
    const vehicleHistory = [
        {
            id: 1,
            event: 'Vehicle Purchase',
            date: '2023-01-15',
            description: 'Purchased new from dealership',
            mileage: 0
        },
        {
            id: 2,
            event: 'First Service',
            date: '2023-04-15',
            description: 'Initial 5,000 km service completed',
            mileage: 5000
        },
        {
            id: 3,
            event: 'Major Service',
            date: '2023-10-20',
            description: '15,000 km comprehensive service',
            mileage: 15000
        }
    ]

    const getFeatureIcon = (category: string, feature: string) => {
        switch (category) {
            case 'comfort':
                if (feature.toLowerCase().includes('ac')) return <Snowflake size={18} className="text-blue-500" />
                return <Gem size={18} className="text-purple-500" />
            case 'entertainment':
                return <Music size={18} className="text-green-500" />
            case 'safety':
                return <ShieldCheck size={18} className="text-red-500" />
            case 'technology':
                if (feature.toLowerCase().includes('navigation')) return <Navigation size={18} className="text-indigo-500" />
                return <Wifi size={18} className="text-cyan-500" />
            default:
                return <Cog size={18} className="text-gray-500" />
        }
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

    const getMaintenanceIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'routine service': return <Wrench className="text-blue-500" />
            //case 'tire replacement': return <Tool className="text-orange-500" />
            case 'brake service': return <Activity className="text-red-500" />
            case 'oil change': return <Zap className="text-yellow-500" />
            default: return <FileText className="text-gray-500" />
        }
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
                <Navbar />
                <div className="flex items-center justify-center p-8">
                    <div className="text-center bg-white rounded-2xl p-8 shadow-xl border border-blue-100 max-w-md">
                        <Car size={64} className="mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
                        <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist or has been removed.</p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => navigate(-1)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-semibold transition-colors"
                            >
                                Go Back
                            </button>
                            <Link 
                                to="/vehicles"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-center"
                            >
                                Browse Vehicles
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="h-96 bg-gray-300 rounded-2xl"></div>
                                <div className="grid grid-cols-4 gap-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-20 bg-gray-300 rounded-lg"></div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                <div className="h-32 bg-gray-300 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (!vehicle) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
            {/* Fixed Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>

            {/* Back Navigation */}
            <div className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-semibold"
                    >
                        <ArrowLeft size={20} />
                        Back to Vehicles
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Vehicle Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {vehicle.specification.manufacturer} {vehicle.specification.model}
                            </h1>
                            <p className="text-xl text-gray-600">
                                {vehicle.specification.year} • {vehicle.specification.vehicle_type.replace('-', ' ')}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                    ${vehicle.rental_rate}
                                    <span className="text-lg text-gray-600">/day</span>
                                </div>
                                <div className={`flex items-center gap-2 text-sm font-semibold ${
                                    vehicle.availability ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {vehicle.availability ? (
                                        <>
                                            <CheckCircle size={16} />
                                            Available Now
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle size={16} />
                                            Currently Booked
                                        </>
                                    )}
                                </div>
                            </div>
                            <button className="p-3 bg-white rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                                <Heart size={24} className="text-gray-400 hover:text-red-500 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Images & Details */}
                    <div className="space-y-6">
                        {/* Main Image */}
                        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                            <div className="relative h-80 lg:h-96">
                                <img 
                                    src={vehicleImages[selectedImageIndex]} 
                                    alt={`${vehicle.specification.manufacturer} ${vehicle.specification.model}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback if image fails to load
                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
                                    }}
                                />
                                {/* Availability Badge */}
                                <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg ${
                                    vehicle.availability 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                        : 'bg-gradient-to-r from-red-500 to-pink-600'
                                }`}>
                                    {vehicle.availability ? 'AVAILABLE' : 'BOOKED'}
                                </div>
                            </div>
                            
                            {/* Image Thumbnails */}
                            <div className="grid grid-cols-4 gap-2 p-4">
                                {vehicleImages.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                                            selectedImageIndex === index 
                                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                    >
                                        <img 
                                            src={image} 
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tabs Navigation - Added Maintenance & History */}
                        <div className="bg-white rounded-2xl shadow-lg border border-blue-100">
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-8 px-6 overflow-x-auto">
                                    {['overview', 'features', 'specifications', 'maintenance', 'history', 'location'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                                                activeTab === tab
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === 'overview' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Vehicle Overview</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Experience the perfect blend of performance and comfort with the {vehicle.specification.manufacturer} {vehicle.specification.model}. 
                                            This {vehicle.specification.year} model features {vehicle.specification.fuel_type.toLowerCase()} efficiency and {vehicle.specification.transmission.toLowerCase()} transmission 
                                            for a smooth driving experience.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${getFuelTypeColor(vehicle.specification.fuel_type)}`}>
                                                    <Fuel size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Fuel Type</p>
                                                    <p className="font-semibold text-gray-900">{vehicle.specification.fuel_type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-600">
                                                    <Settings size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Transmission</p>
                                                    <p className="font-semibold text-gray-900">{vehicle.specification.transmission}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600">
                                                    <Users size={20} className="text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Seating</p>
                                                    <p className="font-semibold text-gray-900">{vehicle.specification.seating_capacity} People</p>
                                                </div>
                                            </div>
                                            {vehicle.specification.engine_capacity && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500">
                                                        <Gauge size={20} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Engine</p>
                                                        <p className="font-semibold text-gray-900">{vehicle.specification.engine_capacity}L</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'features' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Features & Amenities</h3>
                                        {Object.entries(featureCategories).map(([category, features]) => (
                                            features.length > 0 && (
                                                <div key={category}>
                                                    <h4 className="font-semibold text-gray-800 mb-3 capitalize">{category}</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {features.map((feature, index) => (
                                                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                                {getFeatureIcon(category, feature)}
                                                                <span className="text-sm text-gray-700">{feature}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                )}

                                {activeTab === 'specifications' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Technical Specifications</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2">Basic Info</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Manufacturer</span>
                                                            <span className="font-semibold">{vehicle.specification.manufacturer}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Model</span>
                                                            <span className="font-semibold">{vehicle.specification.model}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Year</span>
                                                            <span className="font-semibold">{vehicle.specification.year}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Vehicle Type</span>
                                                            <span className="font-semibold">{vehicle.specification.vehicle_type.replace('-', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2">Performance</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Fuel Type</span>
                                                            <span className="font-semibold">{vehicle.specification.fuel_type}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Transmission</span>
                                                            <span className="font-semibold">{vehicle.specification.transmission}</span>
                                                        </div>
                                                        {vehicle.specification.engine_capacity && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Engine Capacity</span>
                                                                <span className="font-semibold">{vehicle.specification.engine_capacity}L</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2">Dimensions & Capacity</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Seating Capacity</span>
                                                            <span className="font-semibold">{vehicle.specification.seating_capacity} People</span>
                                                        </div>
                                                        {vehicle.specification.color && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Color</span>
                                                                <span className="font-semibold capitalize">{vehicle.specification.color}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-2">Rental Information</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Daily Rate</span>
                                                            <span className="font-semibold">${vehicle.rental_rate}/day</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Availability</span>
                                                            <span className={`font-semibold ${vehicle.availability ? 'text-green-600' : 'text-red-600'}`}>
                                                                {vehicle.availability ? 'Available' : 'Not Available'}
                                                            </span>
                                                        </div>
                                                        {vehicle.current_location && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Location</span>
                                                                <span className="font-semibold">{vehicle.current_location}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'maintenance' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Maintenance History</h3>
                                        <div className="space-y-4">
                                            {maintenanceHistory.map((maintenance) => (
                                                <div key={maintenance.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                                                                {getMaintenanceIcon(maintenance.type)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">{maintenance.type}</h4>
                                                                <p className="text-sm text-gray-600">{maintenance.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-green-600">${maintenance.cost}</p>
                                                            <p className="text-sm text-gray-600">{maintenance.mileage} km</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-700 mb-2">{maintenance.description}</p>
                                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                                        <span>Performed by: {maintenance.performedBy}</span>
                                                        <span>Next service: {maintenance.nextService}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'history' && (
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-semibold text-gray-900">Vehicle History</h3>
                                        <div className="space-y-4">
                                            {vehicleHistory.map((history) => (
                                                <div key={history.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-semibold text-gray-900">{history.event}</h4>
                                                        <span className="text-sm text-gray-600">{history.date}</span>
                                                    </div>
                                                    <p className="text-gray-700 mb-1">{history.description}</p>
                                                    <p className="text-sm text-gray-600">Mileage: {history.mileage} km</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'location' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Pickup Location</h3>
                                        {vehicle.current_location ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                                                    <MapPin size={24} className="text-blue-600" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{vehicle.current_location}</p>
                                                        <p className="text-sm text-gray-600">Available for pickup and return</p>
                                                    </div>
                                                </div>
                                                <div className="h-64 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl flex items-center justify-center">
                                                    <div className="text-center">
                                                        <MapPin size={48} className="mx-auto text-blue-600 mb-2" />
                                                        <p className="text-gray-700 font-semibold">Map View</p>
                                                        <p className="text-sm text-gray-600">Interactive map coming soon</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                                                <p className="text-gray-600">Location information not available</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Booking Widget */}
                    <div className="space-y-6">
                        {/* Booking Widget - Made Sticky */}
                        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-6 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Book This Vehicle</h3>
                            
                            {/* Date Selection */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Date</label>
                                    <input
                                        type="date"
                                        value={bookingDates.pickupDate}
                                        onChange={(e) => setBookingDates(prev => ({ ...prev, pickupDate: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Return Date</label>
                                    <input
                                        type="date"
                                        value={bookingDates.returnDate}
                                        onChange={(e) => setBookingDates(prev => ({ ...prev, returnDate: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min={bookingDates.pickupDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            {/* Rental Summary */}
                            {rentalDetails && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                    <h4 className="font-semibold text-gray-800 mb-3">Rental Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">{rentalDetails.days} days × ${vehicle.rental_rate}/day</span>
                                            <span className="font-semibold">${rentalDetails.subtotal}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Insurance</span>
                                            <span className="font-semibold">${rentalDetails.insurance}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tax (8%)</span>
                                            <span className="font-semibold">${rentalDetails.tax.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2">
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total</span>
                                                <span className="text-blue-600">${rentalDetails.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons - Updated Colors */}
                            <div className="space-y-3">
                                <Link 
                                    to={`/bookings/new?vehicleId=${vehicle.vehicle_id}&pickupDate=${bookingDates.pickupDate}&returnDate=${bookingDates.returnDate}`}
                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 text-center block ${
                                        vehicle.availability && bookingDates.pickupDate && bookingDates.returnDate
                                            ? 'bg-orange-500 hover:bg-sky-500 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {vehicle.availability ? 'Proceed to Book' : 'Not Available'}
                                </Link>
                                
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                    <Shield size={16} className="text-green-500" />
                                    Fully insured • 24/7 Support • Free Cancellation
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
                            <h4 className="font-semibold text-gray-900 mb-4">Why Choose Us</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <ShieldCheck size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Full Coverage Insurance</p>
                                        <p className="text-sm text-gray-600">Comprehensive protection included</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Clock size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">24/7 Roadside Assistance</p>
                                        <p className="text-sm text-gray-600">Help whenever you need it</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <CheckCircle size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">Free Cancellation</p>
                                        <p className="text-sm text-gray-600">Cancel up to 24 hours before</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Vehicles - Now shows 5 random vehicles */}
                {relatedVehicles.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {relatedVehicles.map((relatedVehicle) => (
                                <Link 
                                    key={relatedVehicle.vehicle_id}
                                    to={`/vehicles/${relatedVehicle.vehicle_id}`}
                                    className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div className="h-32 bg-gradient-to-br from-blue-200 to-indigo-200 relative">
                                        {/* Vehicle Image */}
                                        <img 
                                            src={relatedVehicle.specification.image_url || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'}
                                            alt={`${relatedVehicle.specification.manufacturer} ${relatedVehicle.specification.model}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
                                            }}
                                        />
                                        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white ${
                                            relatedVehicle.availability 
                                                ? 'bg-green-500' 
                                                : 'bg-red-500'
                                        }`}>
                                            {relatedVehicle.availability ? 'Available' : 'Booked'}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-semibold text-gray-900 mb-1 truncate text-sm">
                                            {relatedVehicle.specification.manufacturer} {relatedVehicle.specification.model}
                                        </h3>
                                        <p className="text-gray-600 text-xs mb-2">{relatedVehicle.specification.year}</p>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-blue-600">
                                                ${relatedVehicle.rental_rate}
                                                <span className="text-xs text-gray-600">/day</span>
                                            </span>
                                            <div className="text-xs text-gray-500">
                                                {relatedVehicle.specification.fuel_type}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}

export default VehicleDetails