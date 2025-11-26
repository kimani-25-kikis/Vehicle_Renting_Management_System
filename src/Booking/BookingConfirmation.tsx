import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useGetBookingByIdQuery } from '../features/api/bookingsApi'
import { useGetVehicleByIdQuery } from '../features/api/vehiclesApi'
import { 
    CheckCircle, Download, MapPin, Calendar, Clock, 
    CreditCard, User, Shield, Car, ArrowLeft,
    Phone, Mail, Star, Share2, Printer, Home,
    FileText, BadgeCheck, Settings
} from 'lucide-react'

const BookingConfirmation: React.FC = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [isPrinting, setIsPrinting] = useState(false)

    const { data: booking, isLoading, error } = useGetBookingByIdQuery(Number(id))
    const { data: vehicle } = useGetVehicleByIdQuery(booking?.vehicle_id || 0)

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const handlePrint = () => {
        setIsPrinting(true)
        setTimeout(() => {
            window.print()
            setIsPrinting(false)
        }, 500)
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `My ${vehicle?.specification.manufacturer} ${vehicle?.specification.model} Booking`,
                    text: `I've booked a ${vehicle?.specification.manufacturer} ${vehicle?.specification.model} from RentWheels!`,
                    url: window.location.href,
                })
            } catch (error) {
                console.log('Error sharing:', error)
            }
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert('Booking link copied to clipboard!')
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <CheckCircle className="text-white" size={32} />
                    </div>
                    <p className="text-gray-600">Loading your booking confirmation...</p>
                </div>
            </div>
        )
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-red-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find your booking details.</p>
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className={`min-h-screen ${isPrinting ? 'print:bg-white' : ''}`}>
            {/* Background Image Section */}
            <div className="fixed inset-0 z-0">
                <div 
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: 'url("https://wallpapers.com/images/featured/cool-cars-cipxrabgpci91ils.jpg")'
                    }}
                >
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
                </div>
            </div>

            {/* Main Content - Floating Cards */}
            <div className="relative z-10 min-h-screen">
                {/* Header Section */}
                <div className="bg-white/90 backdrop-blur-lg border-b border-blue-100/50 shadow-lg">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => navigate(-1)}
                                    className="p-3 hover:bg-white/50 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                                >
                                    <ArrowLeft size={24} className="text-gray-700" />
                                </button>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Booking Confirmed
                                    </h1>
                                    <p className="text-gray-600">
                                        {vehicle?.specification.manufacturer} {vehicle?.specification.model} • {vehicle?.specification.year}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                    ${vehicle?.rental_rate}<span className="text-sm text-gray-600">/day</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                        {/* Left Column - Main Content */}
                        <div className="xl:col-span-8 space-y-8">
                            {/* Success Banner */}
                            <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-lg rounded-3xl p-8 text-white shadow-2xl border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                            <CheckCircle className="text-white" size={40} />
                                        </div>
                                        <div>
                                            <h1 className="text-4xl font-bold mb-2">
                                                Booking Confirmed! 🎉
                                            </h1>
                                            <p className="text-blue-100 text-lg">
                                                Your {vehicle?.specification.manufacturer} {vehicle?.specification.model} is reserved
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30">
                                        <div className="text-2xl font-bold">
                                            #RW{booking.booking_id.toString().padStart(6, '0')}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm font-semibold border mt-2 ${getStatusColor(booking.booking_status)}`}>
                                            {booking.booking_status}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Details Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Vehicle & Trip Info */}
                                <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        <Car className="text-blue-600" />
                                        Vehicle & Trip Details
                                    </h2>
                                    
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Car className="text-white" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {vehicle?.specification.manufacturer} {vehicle?.specification.model}
                                                </h3>
                                                <p className="text-gray-600">{vehicle?.specification.year}</p>
                                                <p className="text-sm text-gray-500">{vehicle?.specification.fuel_type} • {vehicle?.specification.transmission}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex items-center gap-4 p-4 bg-green-50/50 rounded-2xl border border-green-100">
                                                <Calendar className="text-green-600 flex-shrink-0" size={24} />
                                                <div>
                                                    <div className="font-semibold text-gray-900">Pickup</div>
                                                    <div className="text-gray-600">{formatDate(booking.pickup_date)}</div>
                                                    <div className="text-sm text-gray-500">{formatTime(booking.pickup_date)} • {booking.pickup_location}</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                                                <Calendar className="text-purple-600 flex-shrink-0" size={24} />
                                                <div>
                                                    <div className="font-semibold text-gray-900">Return</div>
                                                    <div className="text-gray-600">{formatDate(booking.return_date)}</div>
                                                    <div className="text-sm text-gray-500">{formatTime(booking.return_date)} • {booking.return_location}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Insurance & Protection */}
                                <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        <Shield className="text-orange-500" />
                                        Protection Plan
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900">Insurance</span>
                                                <span className="text-orange-600 font-bold capitalize">{booking.insurance_type}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900">Roadside Assistance</span>
                                                <span className="text-green-600 font-bold">{booking.roadside_assistance ? 'Included' : 'Not Included'}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900">Additional Protection</span>
                                                <span className="text-green-600 font-bold">{booking.additional_protection ? 'Added' : 'Not Added'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <Clock className="text-blue-600" />
                                    What's Next?
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { step: 1, title: 'Prepare Documents', desc: 'Bring your license and confirmation', color: 'blue' },
                                        { step: 2, title: 'Vehicle Inspection', desc: '15 mins early for inspection', color: 'orange' },
                                        { step: 3, title: 'Enjoy Your Ride', desc: 'Drive safely and contact support', color: 'green' }
                                    ].map((item) => (
                                        <div key={item.step} className={`p-6 rounded-2xl border bg-${item.color}-50/50 border-${item.color}-100 text-center transition-transform duration-300 hover:scale-105`}>
                                            <div className={`w-12 h-12 bg-${item.color}-500 rounded-full flex items-center justify-center mx-auto mb-4`}>
                                                <span className="text-white font-bold text-lg">{item.step}</span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                            <p className="text-gray-600 text-sm">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="xl:col-span-4 space-y-8">
                            {/* Total Cost Card */}
                            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <CreditCard className="text-blue-600" />
                                    Payment Summary
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Vehicle Rental</span>
                                        <span className="font-semibold">${booking.total_amount - 40}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Insurance</span>
                                        <span className="font-semibold">$25.00</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                        <span className="text-gray-600">Taxes & Fees</span>
                                        <span className="font-semibold">$15.00</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-300">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-blue-600">${booking.total_amount}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                                    <div className="flex items-center gap-2 justify-center">
                                        <CheckCircle className="text-green-600" size={20} />
                                        <span className="text-green-800 font-semibold">Payment Completed</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <Settings className="text-purple-600" />
                                    Quick Actions
                                </h3>
                                
                                <div className="space-y-4">
                                    <button
                                        onClick={handlePrint}
                                        className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg hover:scale-105"
                                    >
                                        <Printer size={20} />
                                        Print Receipt
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg hover:scale-105"
                                    >
                                        <Share2 size={20} />
                                        Share Booking
                                    </button>
                                    <Link
                                        to="/my-bookings"
                                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg hover:scale-105"
                                    >
                                        <FileText size={20} />
                                        My Bookings
                                    </Link>
                                    <Link
                                        to="/vehicles"
                                        className="w-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-lg hover:scale-105"
                                    >
                                        <Car size={20} />
                                        Rent Another
                                    </Link>
                                </div>
                            </div>

                            {/* Support Card */}
                            <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-lg rounded-3xl p-8 text-white shadow-2xl border border-white/20">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                                    <Phone className="text-orange-300" />
                                    24/7 Support
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-white/20 rounded-xl border border-white/30">
                                        <Phone size={20} className="text-orange-300" />
                                        <div>
                                            <div className="font-semibold">Emergency Line</div>
                                            <div className="text-blue-100">+1 (555) 123-4567</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white/20 rounded-xl border border-white/30">
                                        <Mail size={20} className="text-orange-300" />
                                        <div>
                                            <div className="font-semibold">Email Support</div>
                                            <div className="text-blue-100">support@rentwheels.com</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-blue-100 mt-4 text-sm text-center">
                                    We're here to help you 24/7
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Navigation */}
                    <div className="flex justify-center mt-12 space-x-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-white/90 backdrop-blur-lg hover:bg-white text-gray-800 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 hover:shadow-lg hover:scale-105 border border-gray-200"
                        >
                            <ArrowLeft size={20} />
                            Back to Vehicle
                        </button>
                        <Link
                            to="/"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 hover:shadow-lg hover:scale-105"
                        >
                            <Home size={20} />
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .print\\:bg-white { background: white !important; }
                    .print\\:border-b { border-bottom: 1px solid #e5e7eb !important; }
                }
            `}</style>
        </div>
    )
}

export default BookingConfirmation