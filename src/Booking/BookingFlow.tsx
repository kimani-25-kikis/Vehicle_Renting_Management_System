import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router'
import { useGetVehicleByIdQuery } from '../features/api/vehiclesApi'
import { useCreateBookingMutation } from '../features/api/bookingsApi'
import { 
    Car, Calendar, MapPin, CreditCard, Shield, Upload, 
    CheckCircle, ArrowLeft, ArrowRight, FileText, User,
    Clock, DollarSign, BadgeCheck, Camera, AlertCircle,
    Loader, XCircle, Info, Sparkles, X
} from 'lucide-react'
import Navbar from '../components/Navbar'
import type { BookingRequest } from '../features/api/bookingsApi'

// Interface for booking data structure
interface BookingData {
    pickupDate: string;
    returnDate: string;
    pickupLocation: string;
    returnLocation: string;
    driverLicense: {
        number: string;
        expiryDate: string;
        frontImage: File | null;
        backImage: File | null;
        frontImageUrl: string;
        backImageUrl: string;
        verified: boolean;
    };
    additionalDrivers: Array<{
        name: string;
        licenseNumber: string;
        licenseImage: File | null;
        licenseImageUrl: string;
    }>;
    insuranceType: 'basic' | 'premium' | 'comprehensive';
    additionalProtection: boolean;
    roadsideAssistance: boolean;
}

const BookingFlow: React.FC = () => {
    const [searchParams] = useSearchParams()
    const vehicleId = searchParams.get('vehicleId') || useParams().id
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [errors, setErrors] = useState<{[key: string]: string}>({})
    const [uploadProgress, setUploadProgress] = useState<{[key: string]: boolean}>({})
    const [dateAvailability, setDateAvailability] = useState<{
        isAvailable: boolean | null;
        message: string;
    }>({ isAvailable: null, message: '' })
    const [checkingAvailability, setCheckingAvailability] = useState(false)
    const [showSuccessPopup, setShowSuccessPopup] = useState(false)
    const [showWarningPopup, setShowWarningPopup] = useState(false)
    
    const [bookingData, setBookingData] = useState<BookingData>({
        // Step 1: Trip Details
        pickupDate: '',
        returnDate: '',
        pickupLocation: '',
        returnLocation: '',
        
        // Step 2: Driver Information
        driverLicense: {
            number: '',
            expiryDate: '',
            frontImage: null,
            backImage: null,
            frontImageUrl: '',
            backImageUrl: '',
            verified: false
        },
        additionalDrivers: [],
        
        // Step 3: Insurance & Protection
        insuranceType: 'basic',
        additionalProtection: false,
        roadsideAssistance: true
    })

    // Get vehicle details
    const { data: vehicle, isLoading, error } = useGetVehicleByIdQuery(Number(vehicleId))
    
    // Create booking mutation
    const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation()

    // Steps configuration
    const steps = [
        { number: 1, title: 'Trip Details', icon: <Calendar size={20} /> },
        { number: 2, title: 'Driver Info', icon: <User size={20} /> },
        { number: 3, title: 'Protection', icon: <Shield size={20} /> },
        { number: 4, title: 'Payment', icon: <CreditCard size={20} /> }
    ]

    // Check date availability whenever dates change
    useEffect(() => {
        const checkAvailability = async () => {
            if (!bookingData.pickupDate || !bookingData.returnDate || !vehicle) {
                setDateAvailability({ isAvailable: null, message: '' })
                return
            }

            setCheckingAvailability(true)
            
            // Simulate API delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300))
            
            const selectedStart = new Date(bookingData.pickupDate)
            const selectedEnd = new Date(bookingData.returnDate)
            const today = new Date()
            
            // Check if dates are in the past
            if (selectedStart < today) {
                setDateAvailability({ 
                    isAvailable: false, 
                    message: 'Pickup date cannot be in the past.' 
                })
                setCheckingAvailability(false)
                return
            }

            // Check if vehicle is available (from vehicle status)
            if (vehicle.status === 'rented' || vehicle.status === 'maintenance') {
                setDateAvailability({ 
                    isAvailable: false, 
                    message: `This vehicle is currently ${vehicle.status === 'rented' ? 'rented' : 'under maintenance'}.` 
                })
                setCheckingAvailability(false)
                return
            }

            // For demo purposes - you would normally call your API here
            // In a real app, you would call: GET /api/vehicles/${vehicleId}/availability?start=${start}&end=${end}
            
            // Simulate checking against existing bookings
            // This is where you would integrate with your backend to check actual availability
            try {
                // For now, simulate random availability (80% chance available)
                const isAvailable = Math.random() > 0.2
                
                if (isAvailable) {
                    setDateAvailability({ 
                        isAvailable: true, 
                        message: 'Perfect! This vehicle is available for your selected dates.' 
                    })
                    setShowSuccessPopup(true)
                    setTimeout(() => setShowSuccessPopup(false), 3000)
                } else {
                    setDateAvailability({ 
                        isAvailable: false, 
                        message: 'Sorry, this vehicle is already booked for your selected dates. Please choose different dates.' 
                    })
                    setShowWarningPopup(true)
                }
            } catch (error) {
                setDateAvailability({ 
                    isAvailable: null, 
                    message: 'Unable to check availability at this moment. Please try again.' 
                })
            }
            
            setCheckingAvailability(false)
        }

        const timer = setTimeout(checkAvailability, 500)
        return () => clearTimeout(timer)
    }, [bookingData.pickupDate, bookingData.returnDate, vehicle])

    // File upload function to send to server
    const uploadLicenseImage = async (file: File, type: 'front' | 'back', licenseNumber: string): Promise<{url: string, fileName: string}> => {
        try {
            setUploadProgress(prev => ({ ...prev, [type]: true }))
            
            const persistAuth = localStorage.getItem('persist:auth')
            
            if (!persistAuth) {
                throw new Error('Authentication required - please log in')
            }

            const authState = JSON.parse(persistAuth)
            const tokenWithBearer = authState.token
            
            // Clean the token
            let cleanToken = ''
            if (tokenWithBearer) {
                // Remove quotes and "Bearer " prefix if present
                cleanToken = tokenWithBearer.replace(/^"Bearer /, '').replace(/"$/g, '')
            }

            if (!cleanToken) {
                throw new Error('Authentication required - no token found')
            }

            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', type)
            formData.append('licenseNumber', licenseNumber)

            const response = await fetch('http://localhost:3000/api/uploads/driver-license', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cleanToken}`
                },
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Upload failed')
            }

            const result = await response.json()
            
            if (!result.success) {
                throw new Error(result.error || 'Upload failed')
            }

            return {
                url: result.data.url,
                fileName: result.data.fileName
            }

        } catch (error) {
            console.error(`Upload error for ${type}:`, error)
            throw error
        } finally {
            setUploadProgress(prev => ({ ...prev, [type]: false }))
        }
    }

    // Validation functions for each step
    const validateStep1 = () => {
        const newErrors: {[key: string]: string} = {}
        
        if (!bookingData.pickupDate) newErrors.pickupDate = 'Pickup date is required'
        if (!bookingData.returnDate) newErrors.returnDate = 'Return date is required'
        if (!bookingData.pickupLocation) newErrors.pickupLocation = 'Pickup location is required'
        if (!bookingData.returnLocation) newErrors.returnLocation = 'Return location is required'
        
        // Add date availability check
        if (dateAvailability.isAvailable === false) {
            newErrors.dateAvailability = 'Vehicle not available for selected dates'
        }
        
        if (bookingData.pickupDate && bookingData.returnDate) {
            const start = new Date(bookingData.pickupDate)
            const end = new Date(bookingData.returnDate)
            if (end <= start) {
                newErrors.returnDate = 'Return date must be after pickup date'
            }
            
            // Check minimum rental period (e.g., at least 1 hour)
            const hoursDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            if (hoursDiff < 1) {
                newErrors.returnDate = 'Minimum rental period is 1 hour'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateStep2 = () => {
        const newErrors: {[key: string]: string} = {}
        
        if (!bookingData.driverLicense.number) newErrors.licenseNumber = 'License number is required'
        if (!bookingData.driverLicense.expiryDate) newErrors.licenseExpiry = 'Expiry date is required'
        if (!bookingData.driverLicense.frontImage) newErrors.licenseFront = 'Front license image is required'
        if (!bookingData.driverLicense.backImage) newErrors.licenseBack = 'Back license image is required'
        
        // Validate expiry date
        if (bookingData.driverLicense.expiryDate) {
            const expiry = new Date(bookingData.driverLicense.expiryDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0) // Remove time for date-only comparison
            if (expiry <= today) {
                newErrors.licenseExpiry = 'License must not be expired'
            }
        }

        // Validate additional drivers
        bookingData.additionalDrivers.forEach((driver, index) => {
            if (!driver.name) newErrors[`driver${index}Name`] = `Driver ${index + 1} name is required`
            if (!driver.licenseNumber) newErrors[`driver${index}License`] = `Driver ${index + 1} license is required`
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateStep3 = () => {
        return true // Insurance is always valid
    }

    const validateStep4 = () => {
        return true // Payment step validation would go here
    }

    const stepValidators = [validateStep1, validateStep2, validateStep3, validateStep4]

    const handleNextStep = () => {
        if (stepValidators[currentStep - 1]()) {
            setCurrentStep(prev => prev + 1)
            setErrors({})
        }
    }

    const handlePreviousStep = () => {
        setCurrentStep(prev => prev - 1)
        setErrors({})
    }

    // Calculate rental duration and total cost
    const calculateTripDetails = () => {
        if (!bookingData.pickupDate || !bookingData.returnDate || !vehicle) return null
        
        const start = new Date(bookingData.pickupDate)
        const end = new Date(bookingData.returnDate)
        const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60))
        const days = Math.ceil(hours / 24)
        const baseCost = days * (vehicle?.rental_rate || 0)
        
        // Insurance costs
        const insuranceCost = bookingData.insuranceType === 'premium' ? days * 15 : 
                             bookingData.insuranceType === 'comprehensive' ? days * 25 : 0
        
        const protectionCost = bookingData.additionalProtection ? days * 10 : 0
        const assistanceCost = bookingData.roadsideAssistance ? days * 5 : 0
        
        const total = baseCost + insuranceCost + protectionCost + assistanceCost
        
        return {
            days,
            hours,
            baseCost,
            insuranceCost,
            protectionCost,
            assistanceCost,
            total
        }
    }

    const tripDetails = calculateTripDetails()

    // License upload handler that sends to server
    const handleLicenseUpload = async (side: 'front' | 'back', file: File) => {
        try {
            // Validate license number is provided
            if (!bookingData.driverLicense.number) {
                setErrors(prev => ({ ...prev, licenseNumber: 'License number is required before uploading images' }))
                return
            }

            // Upload to server
            const result = await uploadLicenseImage(file, side, bookingData.driverLicense.number)
            
            // Update local state with both file and server URL
            setBookingData(prev => ({
                ...prev,
                driverLicense: {
                    ...prev.driverLicense,
                    [`${side}Image`]: file,
                    [`${side}ImageUrl`]: result.url
                }
            }))

            // Clear any previous errors
            if (errors[`license${side.charAt(0).toUpperCase() + side.slice(1)}`]) {
                setErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors[`license${side.charAt(0).toUpperCase() + side.slice(1)}`]
                    return newErrors
                })
            }

        } catch (error: any) {
            console.error('Upload failed:', error)
            setErrors(prev => ({ 
                ...prev, 
                [`license${side.charAt(0).toUpperCase() + side.slice(1)}`]: error.message || 'Failed to upload image. Please try again.' 
            }))
        }
    }

    const handleAddDriver = () => {
        setBookingData(prev => ({
            ...prev,
            additionalDrivers: [
                ...prev.additionalDrivers,
                { name: '', licenseNumber: '', licenseImage: null, licenseImageUrl: '' }
            ]
        }))
    }

    const handleRemoveDriver = (index: number) => {
        setBookingData(prev => ({
            ...prev,
            additionalDrivers: prev.additionalDrivers.filter((_, i) => i !== index)
        }))
    }

    // Booking submission with server URLs
    const handleSubmitBooking = async () => {
        try {
            // Final validation
            if (dateAvailability.isAvailable === false) {
                alert('This vehicle is not available for the selected dates. Please choose different dates.')
                return
            }

            // Ensure both images have been uploaded to server
            if (!bookingData.driverLicense.frontImageUrl || !bookingData.driverLicense.backImageUrl) {
                alert('Please complete license image uploads before submitting')
                return
            }

            // Get user ID from Redux persist storage
            const persistAuth = localStorage.getItem('persist:auth')
            let userId = null
            if (persistAuth) {
                try {
                    const authState = JSON.parse(persistAuth)
                    const userData = JSON.parse(authState.user || '{}')
                    userId = userData.user_id || userData.id
                } catch (error) {
                    console.error('Error parsing auth data:', error)
                }
            }

            if (!userId) {
                alert('Please log in to complete your booking')
                navigate('/login')
                return
            }

            const bookingPayload: BookingRequest = {
                user_id: Number(userId),
                vehicle_id: Number(vehicleId),
                pickup_location: bookingData.pickupLocation,
                return_location: bookingData.returnLocation,
                pickup_date: bookingData.pickupDate,
                return_date: bookingData.returnDate,
                booking_date: new Date().toISOString().split('T')[0],
                total_amount: tripDetails?.total || 0,
                
                // Driver License Info
                driver_license_number: bookingData.driverLicense.number,
                driver_license_expiry: bookingData.driverLicense.expiryDate,
                driver_license_front_url: bookingData.driverLicense.frontImageUrl,
                driver_license_back_url: bookingData.driverLicense.backImageUrl,
                
                // Insurance & Protection
                insurance_type: bookingData.insuranceType,
                additional_protection: bookingData.additionalProtection,
                roadside_assistance: bookingData.roadsideAssistance,
                
                // Status - must match BookingRequest type exactly
                booking_status: 'Pending'
            }
            
            console.log('📦 Booking payload:', bookingPayload)
            
            const result = await createBooking(bookingPayload).unwrap() as any
            
            // Extract booking ID from response
            const bookingId = result.booking?.booking_id || result.booking_id || result.data?.booking_id
            
            if (bookingId) {
                console.log('✅ Booking created successfully, ID:', bookingId)
                navigate(`/booking-confirmation/${bookingId}`)
            } else {
                console.error('❌ No booking ID in response:', result)
                // Fallback navigation
                navigate('/my-bookings')
            }
            
        } catch (error: any) {
            console.error('❌ Booking failed:', error)
            
            let errorMessage = 'Booking failed. Please try again.'
            
            if (error.data) {
                console.error('🔍 Server error response:', error.data)
                errorMessage = error.data.error || error.data.message || errorMessage
            } else if (error.message) {
                console.error('🔍 Error message:', error.message)
                errorMessage = error.message
            }
            
            alert(`Booking failed: ${errorMessage}`)
        }
    }

    // Render loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <Car size={48} className="mx-auto text-blue-600 mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading vehicle details...</p>
                </div>
            </div>
        )
    }

    // Render error state
    if (error || !vehicle) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md">
                    <Car size={64} className="mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
                    <p className="text-gray-600 mb-6">The vehicle you're looking for is not available.</p>
                    <button 
                        onClick={() => navigate('/vehicles')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                        Browse Vehicles
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Navbar/>
            
            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                        <CheckCircle size={24} />
                        <div>
                            <p className="font-semibold">Perfect! Dates Available</p>
                            <p className="text-sm opacity-90">You're lucky! This vehicle is available for your selected dates.</p>
                        </div>
                        <button 
                            onClick={() => setShowSuccessPopup(false)}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Warning Popup */}
            {showWarningPopup && (
                <div className="fixed top-4 right-4 z-50 animate-slide-in">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
                        <AlertCircle size={24} />
                        <div>
                            <p className="font-semibold">Vehicle Unavailable</p>
                            <p className="text-sm opacity-90">This vehicle is already booked for the selected dates.</p>
                        </div>
                        <button 
                            onClick={() => setShowWarningPopup(false)}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg border-b border-blue-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors hover:text-orange-500"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-blue-900">
                                    Book Your Ride
                                </h1>
                                <p className="text-gray-600">
                                    {vehicle.specification.manufacturer} {vehicle.specification.model} {vehicle.specification.year}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                                ${vehicle.rental_rate}<span className="text-sm text-gray-600">/day</span>
                            </div>
                            {vehicle.status && (
                                <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                                    vehicle.status === 'available' 
                                        ? 'bg-green-100 text-green-800' 
                                        : vehicle.status === 'rented'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex justify-center mt-8">
                        <div className="flex items-center space-x-8">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                                        currentStep >= step.number
                                            ? 'bg-blue-600 border-blue-600 text-white'
                                            : 'border-gray-300 text-gray-400'
                                    }`}>
                                        {currentStep > step.number ? <CheckCircle size={20} /> : step.icon}
                                    </div>
                                    <span className={`ml-3 font-semibold ${
                                        currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
                                    }`}>
                                        {step.title}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className={`w-16 h-0.5 mx-4 ${
                                            currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Booking Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
                            {/* Step 1: Trip Details */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        <Calendar className="text-blue-600" />
                                        When and Where?
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Pickup Date & Time
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={bookingData.pickupDate}
                                                onChange={(e) => {
                                                    setBookingData(prev => ({ ...prev, pickupDate: e.target.value }))
                                                    if (errors.pickupDate) {
                                                        setErrors(prev => ({ ...prev, pickupDate: '' }))
                                                    }
                                                }}
                                                className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                    errors.pickupDate 
                                                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                                                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300'
                                                }`}
                                                min={new Date().toISOString().slice(0, 16)}
                                            />
                                            {errors.pickupDate && (
                                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    {errors.pickupDate}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Return Date & Time
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={bookingData.returnDate}
                                                onChange={(e) => {
                                                    setBookingData(prev => ({ ...prev, returnDate: e.target.value }))
                                                    if (errors.returnDate) {
                                                        setErrors(prev => ({ ...prev, returnDate: '' }))
                                                    }
                                                }}
                                                className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                    errors.returnDate 
                                                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                                                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300'
                                                }`}
                                                min={bookingData.pickupDate || new Date().toISOString().slice(0, 16)}
                                            />
                                            {errors.returnDate && (
                                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    {errors.returnDate}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Date Availability Status */}
                                    <div className={`p-4 rounded-xl border transition-all duration-300 ${
                                        checkingAvailability
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                                            : dateAvailability.isAvailable === false
                                            ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                                            : dateAvailability.isAvailable === true
                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${
                                                checkingAvailability
                                                    ? 'bg-blue-100'
                                                    : dateAvailability.isAvailable === false
                                                    ? 'bg-red-100'
                                                    : dateAvailability.isAvailable === true
                                                    ? 'bg-green-100'
                                                    : 'bg-blue-100'
                                            }`}>
                                                {checkingAvailability ? (
                                                    <Loader size={20} className="text-blue-600 animate-spin" />
                                                ) : dateAvailability.isAvailable === false ? (
                                                    <XCircle size={20} className="text-red-600" />
                                                ) : dateAvailability.isAvailable === true ? (
                                                    <CheckCircle size={20} className="text-green-600" />
                                                ) : (
                                                    <Info size={20} className="text-blue-600" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`font-semibold ${
                                                    checkingAvailability
                                                        ? 'text-blue-800'
                                                        : dateAvailability.isAvailable === false
                                                        ? 'text-red-800'
                                                        : dateAvailability.isAvailable === true
                                                        ? 'text-green-800'
                                                        : 'text-blue-800'
                                                }`}>
                                                    {checkingAvailability 
                                                        ? 'Checking availability...' 
                                                        : dateAvailability.isAvailable === false 
                                                        ? 'Vehicle Unavailable'
                                                        : dateAvailability.isAvailable === true
                                                        ? 'Vehicle Available!'
                                                        : 'Select dates to check availability'
                                                    }
                                                </h4>
                                                {dateAvailability.message && (
                                                    <p className={`text-sm mt-1 ${
                                                        checkingAvailability
                                                            ? 'text-blue-700'
                                                            : dateAvailability.isAvailable === false
                                                            ? 'text-red-700'
                                                            : dateAvailability.isAvailable === true
                                                            ? 'text-green-700'
                                                            : 'text-blue-700'
                                                    }`}>
                                                        {dateAvailability.message}
                                                    </p>
                                                )}
                                            </div>
                                            {dateAvailability.isAvailable === true && (
                                                <Sparkles className="text-yellow-500" size={20} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <MapPin className="text-blue-600" size={16} />
                                                Pickup Location
                                            </label>
                                            <select
                                                value={bookingData.pickupLocation}
                                                onChange={(e) => {
                                                    setBookingData(prev => ({ ...prev, pickupLocation: e.target.value }))
                                                    if (errors.pickupLocation) {
                                                        setErrors(prev => ({ ...prev, pickupLocation: '' }))
                                                    }
                                                }}
                                                className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                    errors.pickupLocation 
                                                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                                                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300'
                                                }`}
                                            >
                                                <option value="">Select pickup location</option>
                                                <option value="Nairobi CBD">Nairobi CBD</option>
                                                <option value="Jomo Kenyatta Airport">JKIA</option>
                                                <option value="Westlands">Westlands</option>
                                                <option value="Karen">Karen</option>
                                            </select>
                                            {errors.pickupLocation && (
                                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    {errors.pickupLocation}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <MapPin className="text-green-600" size={16} />
                                                Return Location
                                            </label>
                                            <select
                                                value={bookingData.returnLocation}
                                                onChange={(e) => {
                                                    setBookingData(prev => ({ ...prev, returnLocation: e.target.value }))
                                                    if (errors.returnLocation) {
                                                        setErrors(prev => ({ ...prev, returnLocation: '' }))
                                                    }
                                                }}
                                                className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                    errors.returnLocation 
                                                        ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                                                        : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300'
                                                }`}
                                            >
                                                <option value="">Select return location</option>
                                                <option value="Nairobi CBD">Nairobi CBD</option>
                                                <option value="Jomo Kenyatta Airport">JKIA</option>
                                                <option value="Westlands">Westlands</option>
                                                <option value="Karen">Karen</option>
                                            </select>
                                            {errors.returnLocation && (
                                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle size={14} />
                                                    {errors.returnLocation}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {tripDetails && (
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                                <Calendar className="text-blue-600" size={16} />
                                                Trip Summary
                                            </h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span className="text-gray-600">Duration:</span>
                                                <span className="font-semibold text-blue-700">{tripDetails.days} day{tripDetails.days !== 1 ? 's' : ''} ({tripDetails.hours} hours)</span>
                                                <span className="text-gray-600">Base rate:</span>
                                                <span className="font-semibold text-blue-700">${tripDetails.baseCost.toFixed(2)}</span>
                                                <span className="text-gray-600">Daily rate:</span>
                                                <span className="font-semibold text-blue-700">${vehicle.rental_rate}/day</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Driver Information */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        <User className="text-blue-600" />
                                        Driver Information
                                    </h2>

                                    {/* Main Driver License Upload */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <BadgeCheck className="text-blue-600" />
                                            Primary Driver's License
                                        </h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    License Number
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter license number"
                                                    value={bookingData.driverLicense.number}
                                                    onChange={(e) => {
                                                        setBookingData(prev => ({
                                                            ...prev,
                                                            driverLicense: { ...prev.driverLicense, number: e.target.value }
                                                        }))
                                                        if (errors.licenseNumber) {
                                                            setErrors(prev => ({ ...prev, licenseNumber: '' }))
                                                        }
                                                    }}
                                                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                        errors.licenseNumber 
                                                            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                                                            : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300'
                                                    }`}
                                                />
                                                {errors.licenseNumber && (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                        <AlertCircle size={14} />
                                                        {errors.licenseNumber}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expiry Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={bookingData.driverLicense.expiryDate}
                                                    onChange={(e) => {
                                                        setBookingData(prev => ({
                                                            ...prev,
                                                            driverLicense: { ...prev.driverLicense, expiryDate: e.target.value }
                                                        }))
                                                        if (errors.licenseExpiry) {
                                                            setErrors(prev => ({ ...prev, licenseExpiry: '' }))
                                                        }
                                                    }}
                                                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                        errors.licenseExpiry 
                                                            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                                                            : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300'
                                                    }`}
                                                />
                                                {errors.licenseExpiry && (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                        <AlertCircle size={14} />
                                                        {errors.licenseExpiry}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* License Upload Section */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Front Side Upload */}
                                            <div className="text-center">
                                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                    📷 Front Side
                                                </label>
                                                <div className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
                                                    bookingData.driverLicense.frontImage
                                                        ? 'border-green-500 bg-green-50'
                                                        : errors.licenseFront
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                                                }`}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleLicenseUpload('front', e.target.files[0])}
                                                        className="hidden"
                                                        id="front-license"
                                                        disabled={uploadProgress.front}
                                                    />
                                                    <label htmlFor="front-license" className="cursor-pointer">
                                                        {uploadProgress.front ? (
                                                            <div className="text-center">
                                                                <Loader className="mx-auto text-blue-500 mb-2 animate-spin" size={32} />
                                                                <p className="text-sm text-blue-700 font-medium">Uploading...</p>
                                                            </div>
                                                        ) : bookingData.driverLicense.frontImage ? (
                                                            <div className="text-center">
                                                                <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                                                                <p className="text-sm text-green-700 font-medium">Front uploaded</p>
                                                                <p className="text-xs text-gray-600 truncate">{bookingData.driverLicense.frontImage.name}</p>
                                                                {bookingData.driverLicense.frontImageUrl && (
                                                                    <p className="text-xs text-green-600 mt-1">✓ Saved to server</p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <Camera className={`mx-auto mb-2 ${errors.licenseFront ? 'text-red-400' : 'text-gray-400'}`} size={32} />
                                                                <p className={`text-sm ${errors.licenseFront ? 'text-red-700' : 'text-gray-700'}`}>
                                                                    {errors.licenseFront ? 'Front image required' : 'Click to upload front'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">JPG, PNG (Max 5MB)</p>
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                                {errors.licenseFront && !bookingData.driverLicense.frontImage && (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1 justify-center">
                                                        <AlertCircle size={14} />
                                                        {errors.licenseFront}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Back Side Upload */}
                                            <div className="text-center">
                                                <label className="block text-sm font-semibold text-gray-900 mb-3">
                                                    📷 Back Side
                                                </label>
                                                <div className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
                                                    bookingData.driverLicense.backImage
                                                        ? 'border-green-500 bg-green-50'
                                                        : errors.licenseBack
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                                                }`}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => e.target.files?.[0] && handleLicenseUpload('back', e.target.files[0])}
                                                        className="hidden"
                                                        id="back-license"
                                                        disabled={uploadProgress.back}
                                                    />
                                                    <label htmlFor="back-license" className="cursor-pointer">
                                                        {uploadProgress.back ? (
                                                            <div className="text-center">
                                                                <Loader className="mx-auto text-blue-500 mb-2 animate-spin" size={32} />
                                                                <p className="text-sm text-blue-700 font-medium">Uploading...</p>
                                                            </div>
                                                        ) : bookingData.driverLicense.backImage ? (
                                                            <div className="text-center">
                                                                <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                                                                <p className="text-sm text-green-700 font-medium">Back uploaded</p>
                                                                <p className="text-xs text-gray-600 truncate">{bookingData.driverLicense.backImage.name}</p>
                                                                {bookingData.driverLicense.backImageUrl && (
                                                                    <p className="text-xs text-green-600 mt-1">✓ Saved to server</p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <Camera className={`mx-auto mb-2 ${errors.licenseBack ? 'text-red-400' : 'text-gray-400'}`} size={32} />
                                                                <p className={`text-sm ${errors.licenseBack ? 'text-red-700' : 'text-gray-700'}`}>
                                                                    {errors.licenseBack ? 'Back image required' : 'Click to upload back'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">JPG, PNG (Max 5MB)</p>
                                                            </div>
                                                        )}
                                                    </label>
                                                </div>
                                                {errors.licenseBack && !bookingData.driverLicense.backImage && (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1 justify-center">
                                                        <AlertCircle size={14} />
                                                        {errors.licenseBack}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Upload Tips */}
                                        <div className="mt-6 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4">
                                            <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                                <Info size={16} />
                                                Upload Tips
                                            </h4>
                                            <ul className="text-sm text-orange-700 space-y-1">
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle size={12} className="text-green-500" />
                                                    Ensure all text is clear and readable
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle size={12} className="text-green-500" />
                                                    Take photo in well-lit area
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle size={12} className="text-green-500" />
                                                    Avoid glare and shadows
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <CheckCircle size={12} className="text-green-500" />
                                                    Include all edges of the license
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Shield size={12} className="text-blue-500" />
                                                    Files are securely stored on our servers
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Additional Drivers */}
                                    <div className="border-t pt-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold text-gray-900">Additional Drivers</h3>
                                            <button
                                                onClick={handleAddDriver}
                                                className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:text-blue-800 border border-blue-200"
                                            >
                                                + Add Driver
                                            </button>
                                        </div>
                                        
                                        {bookingData.additionalDrivers.map((driver, index) => (
                                            <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-4 border border-gray-200">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="font-medium text-gray-900">Driver {index + 1}</h4>
                                                    <button
                                                        onClick={() => handleRemoveDriver(index)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <input
                                                            type="text"
                                                            placeholder="Full name"
                                                            value={driver.name}
                                                            onChange={(e) => {
                                                                const newDrivers = [...bookingData.additionalDrivers]
                                                                newDrivers[index].name = e.target.value
                                                                setBookingData(prev => ({ ...prev, additionalDrivers: newDrivers }))
                                                                if (errors[`driver${index}Name`]) {
                                                                    setErrors(prev => {
                                                                        const newErrors = { ...prev }
                                                                        delete newErrors[`driver${index}Name`]
                                                                        return newErrors
                                                                    })
                                                                }
                                                            }}
                                                            className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                                errors[`driver${index}Name`]
                                                                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                                                    : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300'
                                                            }`}
                                                        />
                                                        {errors[`driver${index}Name`] && (
                                                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                                <AlertCircle size={14} />
                                                                {errors[`driver${index}Name`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <input
                                                            type="text"
                                                            placeholder="License number"
                                                            value={driver.licenseNumber}
                                                            onChange={(e) => {
                                                                const newDrivers = [...bookingData.additionalDrivers]
                                                                newDrivers[index].licenseNumber = e.target.value
                                                                setBookingData(prev => ({ ...prev, additionalDrivers: newDrivers }))
                                                                if (errors[`driver${index}License`]) {
                                                                    setErrors(prev => {
                                                                        const newErrors = { ...prev }
                                                                        delete newErrors[`driver${index}License`]
                                                                        return newErrors
                                                                    })
                                                                }
                                                            }}
                                                            className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 transition-all duration-300 ${
                                                                errors[`driver${index}License`]
                                                                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                                                                    : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300'
                                                            }`}
                                                        />
                                                        {errors[`driver${index}License`] && (
                                                            <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                                <AlertCircle size={14} />
                                                                {errors[`driver${index}License`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Protection & Insurance */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        <Shield className="text-blue-600" />
                                        Choose Your Protection
                                    </h2>

                                    {/* Insurance Options */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">Insurance Coverage</h3>
                                        
                                        {[
                                            { id: 'basic' as const, name: 'Basic Coverage', price: 0, features: ['Third-party liability', 'Basic protection'], icon: '🛡️' },
                                            { id: 'premium' as const, name: 'Premium Coverage', price: 15, features: ['Full collision coverage', 'Theft protection', 'Reduced deductible'], icon: '⭐' },
                                            { id: 'comprehensive' as const, name: 'Comprehensive', price: 25, features: ['Zero deductible', 'Personal accident', 'Roadside assistance included'], icon: '👑' }
                                        ].map((plan) => (
                                            <div
                                                key={plan.id}
                                                onClick={() => setBookingData(prev => ({ ...prev, insuranceType: plan.id }))}
                                                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                                    bookingData.insuranceType === plan.id
                                                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg'
                                                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl">{plan.icon}</span>
                                                            <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {plan.features.join(' • ')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-blue-600">
                                                            ${plan.price}<span className="text-sm text-gray-600">/day</span>
                                                        </div>
                                                        {plan.id === bookingData.insuranceType && (
                                                            <div className="text-xs text-green-600 font-medium mt-1">✓ Selected</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Additional Protection */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">Additional Protection</h3>
                                        
                                        {[
                                            { id: 'additional', name: 'Extra Protection', price: 10, description: 'Additional coverage for peace of mind', icon: '🛡️' },
                                            { id: 'roadside', name: '24/7 Roadside Assistance', price: 5, description: 'Towing, lockout service, tire change', icon: '🛟' }
                                        ].map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center p-4 border border-gray-200 rounded-2xl hover:border-orange-300 transition-all duration-300 hover:shadow-md"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{item.icon}</span>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                        <p className="text-sm text-gray-600">{item.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="font-bold text-blue-600">
                                                            ${item.price}<span className="text-sm text-gray-600">/day</span>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        checked={item.id === 'additional' ? bookingData.additionalProtection : bookingData.roadsideAssistance}
                                                        onChange={(e) => {
                                                            if (item.id === 'additional') {
                                                                setBookingData(prev => ({ ...prev, additionalProtection: e.target.checked }))
                                                            } else {
                                                                setBookingData(prev => ({ ...prev, roadsideAssistance: e.target.checked }))
                                                            }
                                                        }}
                                                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 hover:ring-orange-200 transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Payment & Review */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        <CreditCard className="text-blue-600" />
                                        Review & Payment
                                    </h2>

                                    {/* Trip Summary */}
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <Calendar className="text-blue-600" size={18} />
                                            Trip Summary
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Vehicle:</span>
                                                <span className="font-semibold">{vehicle.specification.manufacturer} {vehicle.specification.model}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Duration:</span>
                                                <span className="font-semibold">{tripDetails?.days} day{tripDetails?.days !== 1 ? 's' : ''}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Pickup:</span>
                                                <span className="font-semibold">{bookingData.pickupLocation}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Return:</span>
                                                <span className="font-semibold">{bookingData.returnLocation}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <DollarSign className="text-green-600" size={18} />
                                            Cost Breakdown
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-600">Base rate ({tripDetails?.days} days × ${vehicle.rental_rate})</span>
                                                <span className="font-medium">${tripDetails?.baseCost.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-600">Insurance</span>
                                                <span className="font-medium">${tripDetails?.insuranceCost.toFixed(2)}</span>
                                            </div>
                                            {bookingData.additionalProtection && (
                                                <div className="flex justify-between py-1">
                                                    <span className="text-gray-600">Additional Protection</span>
                                                    <span className="font-medium">${tripDetails?.protectionCost.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {bookingData.roadsideAssistance && (
                                                <div className="flex justify-between py-1">
                                                    <span className="text-gray-600">Roadside Assistance</span>
                                                    <span className="font-medium">${tripDetails?.assistanceCost.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-3 mt-3">
                                                <div className="flex justify-between font-bold text-lg">
                                                    <span>Total Amount</span>
                                                    <span className="text-orange-600">${tripDetails?.total.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="border-t pt-6">
                                        <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                                                'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <CreditCard className="text-blue-600" size={24} />
                                                    <div>
                                                        <div className="font-semibold">Credit/Debit Card</div>
                                                        <div className="text-sm text-gray-600">Pay with Visa, Mastercard, etc.</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                                                'border-gray-300 hover:border-green-500 hover:bg-green-50'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <FileText className="text-green-600" size={24} />
                                                    <div>
                                                        <div className="font-semibold">Mobile Money</div>
                                                        <div className="text-sm text-gray-600">M-Pesa, Airtel Money, etc.</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Important Notes */}
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                                        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            Important Notes
                                        </h4>
                                        <ul className="text-sm text-yellow-700 space-y-1">
                                            <li>• Full payment is required to confirm your booking</li>
                                            <li>• Cancellations made 48 hours before pickup receive full refund</li>
                                            <li>• A security deposit of $200 will be held and released after return</li>
                                            <li>• Please bring your original driver's license at pickup</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-6 border-t mt-6">
                                <button
                                    onClick={handlePreviousStep}
                                    disabled={currentStep === 1}
                                    className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:text-orange-600 border border-gray-200"
                                >
                                    <ArrowLeft size={20} />
                                    Back
                                </button>
                                
                                {currentStep < steps.length ? (
                                    <button
                                        onClick={handleNextStep}
                                        disabled={dateAvailability.isAvailable === false}
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:shadow-blue-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        Continue
                                        <ArrowRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitBooking}
                                        disabled={isCreatingBooking || dateAvailability.isAvailable === false || !bookingData.driverLicense.frontImageUrl || !bookingData.driverLicense.backImageUrl}
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center gap-2 hover:shadow-lg hover:shadow-orange-200 transform hover:-translate-y-0.5 disabled:transform-none"
                                    >
                                        {isCreatingBooking ? (
                                            <>
                                                <Loader className="animate-spin" size={20} />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                Complete Booking
                                                <CheckCircle size={20} />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 sticky top-24">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                    <Car size={40} className="text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {vehicle.specification.manufacturer} {vehicle.specification.model}
                                </h3>
                                <p className="text-gray-600">{vehicle.specification.year}</p>
                                <div className={`mt-2 text-sm font-medium px-3 py-1 rounded-full inline-block ${
                                    vehicle.status === 'available'
                                        ? 'bg-green-100 text-green-800'
                                        : vehicle.status === 'rented'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {vehicle.status ? vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1) : 'Available Now'}
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Fuel Type:</span>
                                    <span className="font-semibold">{vehicle.specification.fuel_type}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Transmission:</span>
                                    <span className="font-semibold">{vehicle.specification.transmission}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Seats:</span>
                                    <span className="font-semibold">{vehicle.specification.seating_capacity}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Location:</span>
                                    <span className="font-semibold">{vehicle.current_location}</span>
                                </div>
                            </div>

                            {tripDetails && (
                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-blue-900">Total Cost:</span>
                                        <span className="text-2xl font-bold text-blue-600">${tripDetails.total.toFixed(2)}</span>
                                    </div>
                                    <p className="text-sm text-blue-700">
                                        for {tripDetails.days} day{tripDetails.days !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}

                            {/* Support Info */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="text-orange-600" size={20} />
                                    <span className="font-semibold text-orange-800">Fully Insured</span>
                                </div>
                                <p className="text-sm text-orange-700">
                                    All rentals include basic insurance coverage and 24/7 customer support.
                                </p>
                            </div>

                            {/* Need Help? */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="text-indigo-600" size={18} />
                                    <span className="font-semibold text-indigo-800">Need Help?</span>
                                </div>
                                <p className="text-sm text-indigo-700 mb-2">
                                    Questions about your booking?
                                </p>
                                <button className="text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                                    Contact Support →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}

export default BookingFlow