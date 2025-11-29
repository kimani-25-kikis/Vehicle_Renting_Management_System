import React, { useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router'
import { useGetVehicleByIdQuery } from '../features/api/vehiclesApi'
import { useCreateBookingMutation } from '../features/api/bookingsApi'
import { 
    Car, Calendar, MapPin, CreditCard, Shield, Upload, 
    CheckCircle, ArrowLeft, ArrowRight, FileText, User,
    Clock, DollarSign, BadgeCheck, Camera, AlertCircle,
    Loader
} from 'lucide-react'
import Navbar from '../components/Navbar'

const BookingFlow: React.FC = () => {
    const [searchParams] = useSearchParams()
    const vehicleId = searchParams.get('vehicleId') || useParams().id
    const navigate = useNavigate()
    const [currentStep, setCurrentStep] = useState(1)
    const [errors, setErrors] = useState<{[key: string]: string}>({})
    const [uploadProgress, setUploadProgress] = useState<{[key: string]: boolean}>({})
    
    const [bookingData, setBookingData] = useState({
        // Step 1: Trip Details
        pickupDate: '',
        returnDate: '',
        pickupLocation: '',
        returnLocation: '',
        
        // Step 2: Driver Information
        driverLicense: {
            number: '',
            expiryDate: '',
            frontImage: null as File | null,
            backImage: null as File | null,
            frontImageUrl: '', // NEW: Store server URL after upload
            backImageUrl: '', // NEW: Store server URL after upload
            verified: false
        },
        additionalDrivers: [] as Array<{
            name: string
            licenseNumber: string
            licenseImage: File | null
            licenseImageUrl: string
        }>,
        
        // Step 3: Insurance & Protection
        insuranceType: 'basic',
        additionalProtection: false,
        roadsideAssistance: true
    })

    const { data: vehicle, isLoading, error } = useGetVehicleByIdQuery(Number(vehicleId))
    const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation()

    const steps = [
        { number: 1, title: 'Trip Details', icon: <Calendar size={20} /> },
        { number: 2, title: 'Driver Info', icon: <User size={20} /> },
        { number: 3, title: 'Protection', icon: <Shield size={20} /> },
        { number: 4, title: 'Payment', icon: <CreditCard size={20} /> }
    ]

    // NEW: File upload function to send to server
    const uploadLicenseImage = async (file: File, type: 'front' | 'back', licenseNumber: string): Promise<{url: string, fileName: string}> => {
    try {
        setUploadProgress(prev => ({ ...prev, [type]: true }))
        
        // Extract token from Redux persist storage
        const persistAuth = localStorage.getItem('persist:auth')
        // console.log('🔍 DEBUG - persist:auth value:', persistAuth)
        
        if (!persistAuth) {
            throw new Error('Authentication required - no auth data found')
        }

        // Parse the persisted auth state
        const authState = JSON.parse(persistAuth)
        // console.log('🔍 DEBUG - Parsed auth state:', authState)
        
        // Get the token from authState.token (it's wrapped in quotes and includes "Bearer ")
        const tokenWithBearer = authState.token
        // console.log('🔍 DEBUG - Raw token value:', tokenWithBearer)
        
       
        const cleanToken = tokenWithBearer.replace(/^"Bearer /, '').replace(/"$/, '')
        //console.log('🔍 DEBUG - Clean token:', cleanToken ? '***' + cleanToken.slice(-10) : 'null')

        if (!cleanToken) {
            throw new Error('Authentication required - no token found in auth state')
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
        
        if (bookingData.pickupDate && bookingData.returnDate) {
            const start = new Date(bookingData.pickupDate)
            const end = new Date(bookingData.returnDate)
            if (end <= start) {
                newErrors.returnDate = 'Return date must be after pickup date'
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
        return true
    }

    const validateStep4 = () => {
        return true
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
        if (!bookingData.pickupDate || !bookingData.returnDate) return null
        
        const start = new Date(bookingData.pickupDate)
        const end = new Date(bookingData.returnDate)
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        const baseCost = days * (vehicle?.rental_rate || 0)
        
        // Insurance costs
        const insuranceCost = bookingData.insuranceType === 'premium' ? days * 15 : 
                             bookingData.insuranceType === 'comprehensive' ? days * 25 : 0
        
        const protectionCost = bookingData.additionalProtection ? days * 10 : 0
        const assistanceCost = bookingData.roadsideAssistance ? days * 5 : 0
        
        const total = baseCost + insuranceCost + protectionCost + assistanceCost
        
        return {
            days,
            baseCost,
            insuranceCost,
            protectionCost,
            assistanceCost,
            total
        }
    }

    const tripDetails = calculateTripDetails()

    // UPDATED: License upload handler that sends to server
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

    // UPDATED: Booking submission with server URLs
 const handleSubmitBooking = async () => {
    try {
        // Ensure both images have been uploaded to server
        if (!bookingData.driverLicense.frontImageUrl || !bookingData.driverLicense.backImageUrl) {
            alert('Please complete license image uploads before submitting')
            return
        }

        // Get user ID from Redux persist storage
        const persistAuth = localStorage.getItem('persist:auth')
        let userId = null
        if (persistAuth) {
            const authState = JSON.parse(persistAuth)
            const userData = JSON.parse(authState.user || '{}')
            userId = userData.user_id
        }

        if (!userId) {
            throw new Error('User not authenticated')
        }

        const bookingPayload = {
            user_id: userId,
            vehicle_id: Number(vehicleId),
            pickup_location: bookingData.pickupLocation,
            return_location: bookingData.returnLocation,
            pickup_date: bookingData.pickupDate,
            return_date: bookingData.returnDate,
            booking_date: new Date().toISOString(),
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
            
            // Status (will be 'Pending' by default)
            booking_status: 'Pending'
        }

        console.log('📦 Complete booking payload:', bookingPayload)
        
        // Use type assertion to handle the API response structure mismatch
        const result = await createBooking(bookingPayload).unwrap() as any
        
        // Extract booking ID from the actual API response structure
        // Your API returns: { success: true, message: string, data: any, booking_id: number }
        const bookingId = result.booking_id
        
        if (bookingId) {
            console.log('✅ Booking ID found:', bookingId)
            navigate(`/booking-confirmation/${bookingId}`)
        } else {
            console.error('❌ No booking ID found in response:', result)
            // Fallback: redirect to bookings list
            navigate('/my-bookings')
        }
        
    } catch (error: any) {
        console.error('❌ Booking failed:', error)
        
        if (error.data) {
            console.error('🔍 Server error response:', error.data)
            alert(`Booking failed: ${error.data.error || 'Please check required fields'}`)
        } else if (error.message) {
            console.error('🔍 Error message:', error.message)
            alert(`Booking failed: ${error.message}`)
        } else {
            alert('Booking failed: Unknown error occurred')
        }
    }
}

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
                            {/* Step 1: Trip Details - UNCHANGED */}
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
                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                            <h3 className="font-semibold text-blue-900 mb-2">Trip Summary</h3>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <span>Duration:</span>
                                                <span className="font-semibold">{tripDetails.days} days</span>
                                                <span>Base rate:</span>
                                                <span className="font-semibold">${tripDetails.baseCost}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Driver Information with SERVER UPLOAD */}
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

                                        {/* UPDATED: License Upload Section with Server Integration */}
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
                                                                <p className="text-xs text-gray-600">{bookingData.driverLicense.frontImage.name}</p>
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
                                                                <p className="text-xs text-gray-600">{bookingData.driverLicense.backImage.name}</p>
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

                                        {/* UPDATED: Upload Tips */}
                                        <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                                            <h4 className="font-semibold text-orange-800 mb-2">📝 Upload Tips</h4>
                                            <ul className="text-sm text-orange-700 space-y-1">
                                                <li>• Ensure all text is clear and readable</li>
                                                <li>• Take photo in well-lit area</li>
                                                <li>• Avoid glare and shadows</li>
                                                <li>• Include all edges of the license</li>
                                                <li>• Files are securely stored on our servers</li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Additional Drivers - UNCHANGED */}
                                    <div className="border-t pt-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-semibold text-gray-900">Additional Drivers</h3>
                                            <button
                                                onClick={handleAddDriver}
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-semibold text-sm transition-colors hover:text-orange-600"
                                            >
                                                + Add Driver
                                            </button>
                                        </div>
                                        
                                        {bookingData.additionalDrivers.map((driver, index) => (
                                            <div key={index} className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                                                <h4 className="font-medium text-gray-900 mb-3">Driver {index + 1}</h4>
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

                            {/* Step 3: Protection & Insurance - UNCHANGED */}
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
                                            { id: 'basic', name: 'Basic Coverage', price: 0, features: ['Third-party liability', 'Basic protection'] },
                                            { id: 'premium', name: 'Premium Coverage', price: 15, features: ['Full collision coverage', 'Theft protection', 'Reduced deductible'] },
                                            { id: 'comprehensive', name: 'Comprehensive', price: 25, features: ['Zero deductible', 'Personal accident', 'Roadside assistance included'] }
                                        ].map((plan) => (
                                            <div
                                                key={plan.id}
                                                onClick={() => setBookingData(prev => ({ ...prev, insuranceType: plan.id }))}
                                                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                                                    bookingData.insuranceType === plan.id
                                                        ? 'border-orange-500 bg-orange-50'
                                                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {plan.features.slice(0, 2).join(' • ')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-blue-600">
                                                            ${plan.price}<span className="text-sm text-gray-600">/day</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Additional Protection */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-gray-900">Additional Protection</h3>
                                        
                                        {[
                                            { id: 'additional', name: 'Extra Protection', price: 10, description: 'Additional coverage for peace of mind' },
                                            { id: 'roadside', name: '24/7 Roadside Assistance', price: 5, description: 'Towing, lockout service, tire change' }
                                        ].map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center p-4 border border-gray-200 rounded-2xl hover:border-orange-300 transition-colors duration-300"
                                            >
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                                    <p className="text-sm text-gray-600">{item.description}</p>
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

                            {/* Step 4: Payment & Review - UNCHANGED */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                        <CreditCard className="text-blue-600" />
                                        Review & Payment
                                    </h2>

                                    {/* Trip Summary */}
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                        <h3 className="font-semibold text-gray-900 mb-4">Trip Summary</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span>Vehicle:</span>
                                                <span className="font-semibold">{vehicle.specification.manufacturer} {vehicle.specification.model}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Duration:</span>
                                                <span className="font-semibold">{tripDetails?.days} days</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Pickup:</span>
                                                <span className="font-semibold">{bookingData.pickupLocation}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Return:</span>
                                                <span className="font-semibold">{bookingData.returnLocation}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                                        <h3 className="font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Base rate ({tripDetails?.days} days × ${vehicle.rental_rate})</span>
                                                <span>${tripDetails?.baseCost}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Insurance</span>
                                                <span>${tripDetails?.insuranceCost}</span>
                                            </div>
                                            {bookingData.additionalProtection && (
                                                <div className="flex justify-between">
                                                    <span>Additional Protection</span>
                                                    <span>${tripDetails?.protectionCost}</span>
                                                </div>
                                            )}
                                            {bookingData.roadsideAssistance && (
                                                <div className="flex justify-between">
                                                    <span>Roadside Assistance</span>
                                                    <span>${tripDetails?.assistanceCost}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-2 mt-2">
                                                <div className="flex justify-between font-bold text-lg">
                                                    <span>Total</span>
                                                    <span className="text-orange-600">${tripDetails?.total}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="border-t pt-6">
                                        <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <button className="border-2 border-gray-300 rounded-2xl p-4 text-left hover:border-orange-500 hover:bg-orange-25 transition-all duration-300">
                                                <div className="font-semibold">Credit/Debit Card</div>
                                                <div className="text-sm text-gray-600">Pay with Visa, Mastercard, etc.</div>
                                            </button>
                                            <button className="border-2 border-gray-300 rounded-2xl p-4 text-left hover:border-orange-500 hover:bg-orange-25 transition-all duration-300">
                                                <div className="font-semibold">Mobile Money</div>
                                                <div className="text-sm text-gray-600">M-Pesa, Airtel Money, etc.</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* UPDATED: Navigation Buttons */}
                            <div className="flex justify-between pt-6 border-t">
                                <button
                                    onClick={handlePreviousStep}
                                    disabled={currentStep === 1}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:text-orange-600"
                                >
                                    <ArrowLeft size={20} />
                                    Back
                                </button>
                                
                                {currentStep < steps.length ? (
                                    <button
                                        onClick={handleNextStep}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 hover:shadow-lg hover:shadow-blue-200"
                                    >
                                        Continue
                                        <ArrowRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubmitBooking}
                                        disabled={isCreatingBooking || !bookingData.driverLicense.frontImageUrl || !bookingData.driverLicense.backImageUrl}
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 hover:shadow-lg hover:shadow-orange-200"
                                    >
                                        {isCreatingBooking ? 'Processing...' : 'Complete Booking'}
                                        <CheckCircle size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Summary Sidebar - UNCHANGED */}
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
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Fuel Type:</span>
                                    <span className="font-semibold">{vehicle.specification.fuel_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Transmission:</span>
                                    <span className="font-semibold">{vehicle.specification.transmission}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Seats:</span>
                                    <span className="font-semibold">{vehicle.specification.seating_capacity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Location:</span>
                                    <span className="font-semibold">{vehicle.current_location}</span>
                                </div>
                            </div>

                            {tripDetails && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-semibold text-blue-900">Total Cost:</span>
                                        <span className="text-2xl font-bold text-blue-600">${tripDetails.total}</span>
                                    </div>
                                    <p className="text-sm text-blue-700">
                                        for {tripDetails.days} day{tripDetails.days !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}

                            {/* Support Info */}
                            <div className="mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="text-orange-600" size={20} />
                                    <span className="font-semibold text-orange-800">Fully Insured</span>
                                </div>
                                <p className="text-sm text-orange-700">
                                    All rentals include basic insurance coverage and 24/7 support.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingFlow