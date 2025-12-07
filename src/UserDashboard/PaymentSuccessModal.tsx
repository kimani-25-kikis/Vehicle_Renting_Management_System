// PaymentSuccessModal.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle, Clock, AlertCircle, X,
  CreditCard, Shield, Mail, Phone,
  ArrowRight, ExternalLink, Loader,ChevronDown,ChevronUp
} from 'lucide-react'
import { toast } from 'sonner'

interface PaymentSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  paymentData?: {
    paymentId?: number
    bookingId?: number
    amount?: number
    transactionId?: string
  }
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  paymentData
}) => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(30) // Auto-close after 30 seconds
  const [showDetails, setShowDetails] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onClose])

  // Reset countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(30)
      setShowDetails(false)
    }
  }, [isOpen])

  // Handle view booking details
  const handleViewBooking = () => {
    if (paymentData?.bookingId) {
      navigate(`/booking-confirmation/${paymentData.bookingId}`)
    } else {
      navigate('/my-bookings')
    }
    onClose()
  }

  // Handle close
  const handleClose = () => {
    onClose()
    toast.info('You can always check payment status in "My Spending" tab')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl max-w-lg w-full border border-blue-200 overflow-hidden">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-white/50 rounded-full transition-all hover:scale-110"
          >
            <X size={20} className="text-gray-600" />
          </button>

          {/* Header - Success Confirmation */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-8"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 border-2 border-white/30 backdrop-blur-sm">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-green-100 text-lg">
                Your payment of ${paymentData?.amount?.toFixed(2) || '0.00'} has been received
              </p>
            </div>
          </div>

          {/* Body - Next Steps */}
          <div className="p-8">
            {/* Important Notice */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Awaiting Admin Approval</h3>
                  <p className="text-gray-600">Your booking is now pending verification</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <Shield className="text-yellow-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-2">What happens next?</h4>
                    <ul className="text-yellow-700 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Our team will verify your payment within 24 hours</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>You'll receive a confirmation email once approved</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Vehicle will be reserved upon approval</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details (Collapsible) */}
            <div className="mb-8">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="text-blue-600" size={20} />
                  <span className="font-semibold text-gray-900">Payment Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600">
                    {showDetails ? 'Hide' : 'Show'} details
                  </span>
                  {showDetails ? (
                    <ChevronUp size={16} className="text-blue-600" />
                  ) : (
                    <ChevronDown size={16} className="text-blue-600" />
                  )}
                </div>
              </button>

              {showDetails && (
                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                  {paymentData?.paymentId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-semibold">#{paymentData.paymentId}</span>
                    </div>
                  )}
                  {paymentData?.bookingId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID:</span>
                      <span className="font-semibold">#{paymentData.bookingId}</span>
                    </div>
                  )}
                  {paymentData?.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction:</span>
                      <span className="font-mono text-sm truncate max-w-[180px]">
                        {paymentData.transactionId}
                      </span>
                    </div>
                  )}
                  {paymentData?.amount && (
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="text-xl font-bold text-green-600">
                        ${paymentData.amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleViewBooking}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
              >
                <ExternalLink size={20} />
                View Booking Details
              </button>

              <button
                onClick={() => navigate('/my-bookings')}
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                <ArrowRight size={20} />
                Go to My Bookings
              </button>

              <button
                onClick={handleClose}
                className="w-full text-gray-600 hover:text-gray-800 py-3 rounded-2xl font-semibold transition-all"
              >
                Close ({countdown}s)
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <Mail className="text-gray-500" size={16} />
                  <span className="text-sm text-gray-600">support@rentwheels.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-gray-500" size={16} />
                  <span className="text-sm text-gray-600">+1 (555) 123-4567</span>
                </div>
              </div>
              <p className="text-center text-gray-500 text-sm mt-3">
                Need help? Contact our support team 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PaymentSuccessModal