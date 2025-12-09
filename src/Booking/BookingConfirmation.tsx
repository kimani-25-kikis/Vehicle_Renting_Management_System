import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGetBookingByIdQuery } from '../features/api/bookingsApi'
import { useGetVehicleByIdQuery } from '../features/api/vehiclesApi'
import {
  CheckCircle, Download, Printer, Share2, Home,
  Car, Shield, CreditCard, Phone, Mail, ArrowLeft,
  FileText, Settings, Calendar, Clock,
  Star, AlertTriangle, CreditCard as CardIcon,
  MapPin, UserCheck, Package, PhoneCall,
  Bell, Wrench, PhoneOff, ChevronRight
} from 'lucide-react'

const BookingConfirmation: React.FC = () => {
  const { booking_id } = useParams<{ booking_id: string }>()
  const navigate = useNavigate()

  const { data: booking, isLoading, error } = useGetBookingByIdQuery(Number(booking_id))
  const vehicle_id = booking?.booking.vehicle_id || 0
  const { data: vehicle } = useGetVehicleByIdQuery(vehicle_id, {
    skip: !vehicle_id
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleShare = async () => {
    if (navigator.share && vehicle) {
      try {
        await navigator.share({
          title: `My ${vehicle.specification.manufacturer} ${vehicle.specification.model} Booking`,
          text: `I've booked a car from RentWheels!`,
          url: window.location.href,
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const downloadPDF = () => {
    if (!booking || !vehicle) return

    const win = window.open('', '_blank')
    if (!win) return

    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>RentWheels Receipt #RW${String(booking?.booking.booking_id).padStart(6, '0')}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; background: white; color: #1f2937; line-height: 1.7; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { text-align: center; padding: 30px 0; border-bottom: 5px solid #3b82f6; margin-bottom: 40px; }
    .logo { font-size: 48px; font-weight: 800; background: linear-gradient(to right, #3b82f6, #8b5cf6); -webkit-background-clip: text; color: transparent; }
    .header h1 { font-size: 36px; color: #1e40af; margin: 12px 0 8px; }
    .header p { font-size: 18px; color: #4b5563; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin: 30px 0; }
    .card { background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; }
    .card h3 { margin: 0 0 10px; color: #1e40af; font-size: 17px; }
    .highlight { background: linear-gradient(135deg, #dbeafe, #ddd6fe); padding: 18px; border-radius: 14px; font-weight: 600; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 16px; }
    th { background: #eff6ff; padding: 14px; text-align: left; font-weight: 600; }
    td { padding: 14px; border-bottom: 1px solid #e5e7eb; }
    .total { font-size: 32px; font-weight: 700; color: #1d4ed8; text-align: right; margin: 30px 0; padding-top: 20px; border-top: 4px dashed #94a3b8; }
    .footer { text-align: center; margin-top: 70px; padding-top: 30px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 15px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">RentWheels</div>
      <h1>Official Receipt</h1>
      <p><strong>#RW${String(booking.booking.booking_id).padStart(6, '0')}</strong> • ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="grid">
      <div class="card"><h3>Customer</h3>Verified User</div>
      <div class="card"><h3>Status</h3><span style="color:#16a34a;font-weight:700;">${booking.booking.booking_status.toUpperCase()}</span></div>
      <div class="card"><h3>Vehicle</h3>${vehicle.specification.manufacturer} ${vehicle.specification.model} ${vehicle.specification.year}</div>
      <div class="card"><h3>Daily Rate</h3>$${vehicle.rental_rate}</div>
    </div>

    <div class="card">
      <h3>Vehicle Details</h3>
      <div class="highlight">${vehicle.specification.manufacturer} ${vehicle.specification.model} • ${vehicle.specification.year}</div>
      <p style="margin:12px 0 0;">${vehicle.specification.transmission} • ${vehicle.specification.fuel_type} • ${vehicle.specification.seating_capacity} seats</p>
    </div>

    <div class="card">
      <h3>Rental Period</h3>
      <p><strong>Pickup:</strong> ${new Date(booking.booking.pickup_date).toLocaleString()} @ ${booking.booking.pickup_location}</p>
      <p><strong>Return:</strong> ${new Date(booking.booking.return_date).toLocaleString()} @ ${booking.booking.return_location}</p>
    </div>

    <div class="card">
      <h3>Protection & Insurance</h3>
      <p>• Insurance: <strong style="color:#ea580c;">${booking.booking.insurance_type}</strong></p>
      <p>• Roadside Assistance: <strong>${booking.booking.roadside_assistance ? 'Included' : 'Not Included'}</strong></p>
      <p>• Additional Protection: <strong>${booking.booking.additional_protection ? 'Added' : 'Not Added'}</strong></p>
    </div>

    <div class="card">
      <h3>Payment Breakdown</h3>
      <table>
        <tr><th>Description</th><th style="text-align:right;">Amount</th></tr>
        <tr><td>Base Rental</td><td style="text-align:right;">$${(booking.booking.total_amount - 40).toFixed(2)}</td></tr>
        <tr><td>Insurance & Protection</td><td style="text-align:right;">$25.00</td></tr>
        <tr><td>Taxes & Fees</td><td style="text-align:right;">$15.00</td></tr>
      </table>
      <div class="total">TOTAL PAID: $${booking.booking.total_amount.toFixed(2)}</div>
    </div>

    <div class="footer">
      <p>Thank you for choosing <strong>RentWheels</strong> — Drive safely and come back soon!</p>
      <p>support@rentwheels.com • +1 (555) 123-4567 • www.rentwheels.com</p>
    </div>
  </div>
</body>
</html>
    `)

    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 1000)
  }

  const handlePrint = () => {
    const printWin = window.open('', '_blank')
    if (!printWin) return

    printWin.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Print Receipt - RentWheels</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 1.5cm; line-height: 1.6; color: #000; background: white; }
    .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 28px; color: #1e40af; }
    .info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; font-size: 15px; }
    .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
    th { background: #f0f7ff; }
    .total { font-size: 26px; font-weight: bold; text-align: right; color: #1e40af; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>RentWheels Receipt</h1>
    <p>#RW${String(booking?.booking.booking_id).padStart(6, '0')} • ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="info">
    <div><strong>Customer:</strong> Verified User</div>
    <div><strong>Status:</strong> ${booking?.booking.booking_status.toUpperCase()}</div>
    <div><strong>Vehicle:</strong> ${vehicle?.specification.manufacturer} ${vehicle?.specification.model} ${vehicle?.specification.year}</div>
    <div><strong>Total Paid:</strong> $${booking?.booking.total_amount}</div>
  </div>

  <div class="section">
    <strong>Pickup:</strong> ${booking && new Date(booking.booking.pickup_date).toLocaleString()} @ ${booking?.booking.pickup_location}<br>
    <strong>Return:</strong> ${booking && new Date(booking.booking.return_date).toLocaleString()} @ ${booking?.booking.return_location}
  </div>

  <div class="section">
    <strong>Protection:</strong> ${booking?.booking.insurance_type} • 
    Roadside: ${booking?.booking.roadside_assistance ? 'Yes' : 'No'} • 
    Extra: ${booking?.booking.additional_protection ? 'Yes' : 'No'}
  </div>

  <div class="total">Total Amount: $${booking?.booking.total_amount}</div>
</body>
</html>
    `)

    printWin.document.close()
    printWin.focus()
    setTimeout(() => printWin.print(), 800)
  }

  const getStatusColor = (s: string) => {
    const status = s.toLowerCase()
    if (['confirmed', 'approved'].includes(status)) return 'bg-green-100 text-green-800 border-green-200'
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (status === 'active') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (status === 'completed') return 'bg-gray-100 text-gray-800 border-gray-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  const getDynamicContent = () => {
    const status = booking?.booking.booking_status.toLowerCase() || ''
    
    return {
      // Success banner content
      successTitle: status === 'pending' ? 'Booking Reserved!' 
                 : status === 'confirmed' ? 'Booking Confirmed!' 
                 : status === 'active' ? 'Enjoy Your Trip!'
                 : status === 'completed' ? 'Trip Completed!'
                 : 'Booking Updated!',
      
      successMessage: status === 'pending' ? `Your ${vehicle?.specification.manufacturer} ${vehicle?.specification.model} is waiting for payment`
                    : status === 'confirmed' ? `Your ${vehicle?.specification.manufacturer} ${vehicle?.specification.model} is ready for pickup!`
                    : status === 'active' ? `You're currently driving your ${vehicle?.specification.manufacturer} ${vehicle?.specification.model}`
                    : status === 'completed' ? `Thank you for choosing ${vehicle?.specification.manufacturer} ${vehicle?.specification.model}`
                    : `Your booking is ${booking?.booking.booking_status}`,
      
      // Status-specific icon
      successIcon: status === 'pending' ? Clock 
                 : status === 'confirmed' ? CheckCircle
                 : status === 'active' ? Car
                 : status === 'completed' ? Star
                 : CheckCircle,
      
      // Main action button
      mainAction: status === 'pending' ? 'Complete Payment Now'
                : status === 'confirmed' ? 'View Pickup Instructions'
                : status === 'active' ? 'Extend Rental'
                : status === 'completed' ? 'Write Review'
                : 'View Details',
      
      // Main action color
      mainActionColor: status === 'pending' ? 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                     : status === 'confirmed' ? 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                     : status === 'active' ? 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                     : status === 'completed' ? 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                     : 'from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900',
    }
  }

  const dynamicContent = getDynamicContent()

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full animate-pulse flex items-center justify-center mb-4">
          <CheckCircle className="text-white" size={32} />
        </div>
        <p className="text-gray-600">Loading your booking...</p>
      </div>
    </div>
  )

  if (!booking || !vehicle) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center bg-white p-10 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
        <button onClick={() => navigate('/vehicles')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl">
          Browse Vehicles
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{
          backgroundImage: 'url("https://wallpapers.com/images/featured/cool-cars-cipxrabgpci91ils.jpg")'
        }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-lg border-b border-blue-100/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-3 hover:bg-white/50 rounded-xl transition-all hover:scale-105">
                  <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {dynamicContent.successTitle}
                  </h1>
                  <p className="text-gray-600">{vehicle.specification.manufacturer} {vehicle.specification.model} • {vehicle.specification.year}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">${vehicle.rental_rate}<span className="text-sm text-gray-600">/day</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="xl:col-span-8 space-y-8">
              {/* Success Banner */}
              <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-lg rounded-3xl p-8 text-white shadow-2xl border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                      <dynamicContent.successIcon className="text-white" size={40} />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold mb-2">{dynamicContent.successTitle}</h1>
                      <p className="text-blue-100 text-lg">{dynamicContent.successMessage}</p>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30">
                    <div className="text-2xl font-bold">#RW{booking.booking.booking_id.toString().padStart(6, '0')}</div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold border mt-2 ${getStatusColor(booking.booking.booking_status)}`}>
                      {booking.booking.booking_status}
                    </div>
                  </div>
                </div>
                <button className={`mt-6 bg-gradient-to-r ${dynamicContent.mainActionColor} text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:shadow-xl hover:scale-105 transition-all`}>
                  {dynamicContent.mainAction}
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Vehicle & Protection Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Vehicle & Trip */}
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Car className="text-blue-600" /> Vehicle & Trip Details
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Car className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{vehicle.specification.manufacturer} {vehicle.specification.model}</h3>
                        <p className="text-gray-600">{vehicle.specification.year}</p>
                        <p className="text-sm text-gray-500">{vehicle.specification.fuel_type} • {vehicle.specification.transmission}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-4 p-4 bg-green-50/50 rounded-2xl border border-green-100">
                        <Calendar className="text-green-600" size={24} />
                        <div>
                          <div className="font-semibold text-gray-900">Pickup</div>
                          <div className="text-gray-600">{formatDate(booking.booking.pickup_date)}</div>
                          <div className="text-sm text-gray-500">{formatTime(booking.booking.pickup_date)} • {booking.booking.pickup_location}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                        <Calendar className="text-purple-600" size={24} />
                        <div>
                          <div className="font-semibold text-gray-900">Return</div>
                          <div className="text-gray-600">{formatDate(booking.booking.return_date)}</div>
                          <div className="text-sm text-gray-500">{formatTime(booking.booking.return_date)} • {booking.booking.return_location}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Protection Plan */}
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Shield className="text-orange-500" /> Protection Plan
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                      <div className="flex justify-between">
                        <span className="font-semibold">Insurance</span>
                        <span className="text-orange-600 font-bold capitalize">{booking.booking.insurance_type}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div className="flex justify-between">
                        <span className="font-semibold">Roadside Assistance</span>
                        <span className={booking.booking.roadside_assistance ? 'text-green-600 font-bold' : 'text-gray-500'}>
                          {booking.booking.roadside_assistance ? 'Included' : 'Not Included'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                      <div className="flex justify-between">
                        <span className="font-semibold">Additional Protection</span>
                        <span className={booking.booking.additional_protection ? 'text-green-600 font-bold' : 'text-gray-500'}>
                          {booking.booking.additional_protection ? 'Added' : 'Not Added'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Next Steps */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Clock className="text-blue-600" /> Next Steps
                </h2>
                
                {(() => {
                  const status = booking.booking.booking_status.toLowerCase()
                  
                  switch(status) {
                    case 'pending':
                    case 'pending payment':
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            { 
                              step: 1, 
                              title: 'Complete Payment', 
                              desc: 'Secure your booking with payment', 
                              icon: '💰', 
                              color: 'yellow' 
                            },
                            { 
                              step: 2, 
                              title: 'Document Upload', 
                              desc: 'Submit your driver\'s license', 
                              icon: '📄', 
                              color: 'blue' 
                            },
                            { 
                              step: 3, 
                              title: 'Pickup Confirmation', 
                              desc: 'Receive pickup time & location', 
                              icon: '📍', 
                              color: 'green' 
                            }
                          ].map((item) => (
                            <div key={item.step} className="p-6 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                              <div className="text-3xl mb-4">{item.icon}</div>
                              <div className={`w-8 h-8 bg-${item.color}-100 text-${item.color}-600 rounded-full flex items-center justify-center text-sm font-bold mb-3`}>
                                {item.step}
                              </div>
                              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                              <p className="text-gray-600 text-sm">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      )
                      
                    case 'confirmed':
                    case 'approved':
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            { 
                              step: 1, 
                              title: 'Prepare Documents', 
                              desc: 'Bring ID, license & this confirmation', 
                              icon: '📋', 
                              color: 'blue' 
                            },
                            { 
                              step: 2, 
                              title: 'Vehicle Inspection', 
                              desc: 'Arrive 15 mins early for inspection', 
                              icon: '🔍', 
                              color: 'orange' 
                            },
                            { 
                              step: 3, 
                              title: 'Enjoy Your Ride', 
                              desc: 'Drive safely & contact 24/7 support', 
                              icon: '🚗', 
                              color: 'green' 
                            }
                          ].map((item) => (
                            <div key={item.step} className="p-6 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                              <div className="text-3xl mb-4">{item.icon}</div>
                              <div className={`w-8 h-8 bg-${item.color}-100 text-${item.color}-600 rounded-full flex items-center justify-center text-sm font-bold mb-3`}>
                                {item.step}
                              </div>
                              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                              <p className="text-gray-600 text-sm">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      )
                      
                    case 'active':
                    case 'in progress':
                      return (
                        <div className="space-y-6">
                          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                            <h3 className="font-bold text-blue-900 mb-3 text-lg">Currently On Trip</h3>
                            <p className="text-blue-700 mb-4">You're currently enjoying your {vehicle.specification.manufacturer} {vehicle.specification.model}!</p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-blue-700">
                                <Calendar size={16} />
                                <span>Return by: <strong>{formatDate(booking.booking.return_date)}</strong></span>
                              </div>
                              <div className="flex items-center gap-2 text-blue-700">
                                <Clock size={16} />
                                <span>Time: <strong>{formatTime(booking.booking.return_date)}</strong></span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                              <div className="text-xl mb-2">⏰</div>
                              <span className="font-semibold text-blue-700">Extend Rental</span>
                            </button>
                            <button className="p-4 bg-white border border-green-200 rounded-xl hover:bg-green-50 transition-colors">
                              <div className="text-xl mb-2">🆘</div>
                              <span className="font-semibold text-green-700">Need Help?</span>
                            </button>
                          </div>
                        </div>
                      )
                      
                    case 'completed':
                      return (
                        <div className="space-y-6">
                          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                            <h3 className="font-bold text-green-900 mb-3 text-lg">Trip Completed Successfully! 🎉</h3>
                            <p className="text-green-700">We hope you enjoyed your ride in the {vehicle.specification.manufacturer} {vehicle.specification.model}.</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors">
                              <div className="text-xl mb-2">⭐</div>
                              <span className="font-semibold text-purple-700">Rate Your Experience</span>
                            </button>
                            <button className="p-4 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                              <div className="text-xl mb-2">📁</div>
                              <span className="font-semibold text-blue-700">Download Receipt</span>
                            </button>
                          </div>
                        </div>
                      )
                      
                    default:
                      return (
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
                          <p className="text-gray-700">Your booking is currently in <strong>{booking.booking.booking_status}</strong> status.</p>
                        </div>
                      )
                  }
                })()}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="xl:col-span-4 space-y-8">
              {/* Payment & Status Summary */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CreditCard className="text-blue-600" /> Payment & Status
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Vehicle Rental</span>
                    <span className="font-semibold">${(booking.booking.total_amount - 40).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Insurance</span>
                    <span className="font-semibold">$25.00</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span className="font-semibold">$15.00</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-300">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">${booking.booking.total_amount}</span>
                  </div>
                </div>
                
                {/* Dynamic Status Message */}
                {(() => {
                  const status = booking.booking.booking_status.toLowerCase()
                  
                  switch(status) {
                    case 'pending':
                    case 'pending payment':
                      return (
                        <div className="mt-6 p-5 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                          <div className="flex items-center gap-3 mb-3">
                            <Clock className="text-yellow-600" size={24} />
                            <h4 className="font-bold text-yellow-800 text-lg">Payment Required</h4>
                          </div>
                          <p className="text-yellow-700 mb-4">
                            Your booking is reserved but requires payment to activate. Complete payment to secure your vehicle.
                          </p>
                          <Link 
                            to="/dashboard"
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3 rounded-xl font-bold text-center transition-all hover:shadow-lg block"
                          >
                            Complete Payment Now
                          </Link>
                        </div>
                      )
                      
                    case 'confirmed':
                    case 'approved':
                      return (
                        <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-center gap-3 mb-3">
                            <CheckCircle className="text-green-600" size={24} />
                            <h4 className="font-bold text-green-800 text-lg">Ready for Pickup!</h4>
                          </div>
                          <p className="text-green-700 mb-4">
                            Payment completed! Your {vehicle.specification.manufacturer} {vehicle.specification.model} is ready for you.
                          </p>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-green-700">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Pickup: {formatTime(booking.booking.pickup_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-green-700">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Location: {booking.booking.pickup_location}</span>
                            </div>
                          </div>
                        </div>
                      )
                      
                    case 'active':
                    case 'in progress':
                      return (
                        <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="flex items-center gap-3 mb-3">
                            <Car className="text-blue-600" size={24} />
                            <h4 className="font-bold text-blue-800 text-lg">Enjoy Your Ride!</h4>
                          </div>
                          <p className="text-blue-700 mb-4">
                            You're currently enjoying your {vehicle.specification.manufacturer} {vehicle.specification.model}. Drive safely!
                          </p>
                          <div className="flex items-center gap-2 text-blue-700 mb-3">
                            <Clock size={16} />
                            <span>Return by: {formatTime(booking.booking.return_date)}</span>
                          </div>
                          <button className="w-full border border-blue-600 text-blue-700 hover:bg-blue-50 py-2 rounded-lg font-semibold transition-colors">
                            Extend Return Time
                          </button>
                        </div>
                      )
                      
                    case 'completed':
                    return (
                      <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Star className="text-purple-600" size={24} />
                          <h4 className="font-bold text-purple-800 text-lg">Trip Completed!</h4>
                        </div>
                        <p className="text-purple-700 mb-4">
                          We hope you enjoyed your ride! Your rental has been successfully completed.
                        </p>
                        <button 
                          onClick={() => navigate('/dashboard?tab=reviews')}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold transition-all hover:shadow-lg"
                        >
                          Rate Your Experience
                        </button>
                      </div>
                    )
                                        
                    case 'cancelled':
                      return (
                        <div className="mt-6 p-5 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-3 mb-3">
                            <Clock className="text-gray-600" size={24} />
                            <h4 className="font-bold text-gray-800 text-lg">Booking Cancelled</h4>
                          </div>
                          <p className="text-gray-700 mb-4">
                            This booking has been cancelled. Any applicable refunds will be processed within 5-7 business days.
                          </p>
                        </div>
                      )
                      
                    default:
                      return (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                          <span className="text-gray-700">Status: {booking.booking.booking_status}</span>
                        </div>
                      )
                  }
                })()}
              </div>

              {/* Dynamic Quick Actions */}
              <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Settings className="text-purple-600" /> Quick Actions
                </h3>
                
                <div className="space-y-4">
                  {booking.booking.booking_status.toLowerCase() === 'pending' && (
                    <Link 
                      to='/dashboard'
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                    >
                      <CardIcon size={22} />
                      Complete Payment
                    </Link>
                  )}
                  
                  {booking.booking.booking_status.toLowerCase() === 'active' && (
                    <>
                      <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <Clock size={22} />
                        Extend Rental
                      </button>
                      <button className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <PhoneCall size={22} />
                        Emergency Support
                      </button>
                    </>
                  )}
                  
                  {booking.booking.booking_status.toLowerCase() === 'completed' && (
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                      <Star size={22} />
                      Write a Review
                    </button>
                  )}
                  
                  {/* Always show these */}
                  <button
                    onClick={downloadPDF}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <Download size={22} />
                    Download Receipt
                  </button>
                  
                  <button
                    onClick={handlePrint}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-all"
                  >
                    <Printer size={22} />
                    Print Receipt
                  </button>
                  
                  <button onClick={handleShare} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-all">
                    <Share2 size={20} /> Share Booking
                  </button>
                  
                  <Link to="/my-bookings" className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:scale-105 transition-all">
                    <FileText size={20} /> My Bookings
                  </Link>
                  
                  <Link to="/vehicles" className="w-full border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all">
                    <Car size={20} /> Rent Another
                  </Link>
                </div>
              </div>

              {/* Support */}
              <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-lg rounded-3xl p-8 text-white shadow-2xl border border-white/20">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <Phone className="text-orange-300" /> 24/7 Support
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/20 rounded-xl border border-white/30">
                    <Phone size={20} className="text-orange-300" />
                    <div><div className="font-semibold">Emergency Line</div><div className="text-blue-100">+1 (555) 123-4567</div></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/20 rounded-xl border border-white/30">
                    <Mail size={20} className="text-orange-300" />
                    <div><div className="font-semibold">Email Support</div><div className="text-blue-100">support@rentwheels.com</div></div>
                  </div>
                </div>
                <p className="text-blue-100 mt-4 text-sm text-center">We're here to help you 24/7</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-12 space-x-6">
            <button onClick={() => navigate(-1)} className="bg-white/90 backdrop-blur-lg hover:bg-white text-gray-800 px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 border border-gray-200 hover:shadow-lg hover:scale-105 transition-all">
              <ArrowLeft size={20} /> Back to Vehicle
            </button>
            <Link to="/" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 hover:shadow-lg hover:scale-105 transition-all">
              <Home size={20} /> Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmation