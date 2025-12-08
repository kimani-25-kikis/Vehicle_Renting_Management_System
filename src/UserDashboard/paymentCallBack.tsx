import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const reference = searchParams.get('reference');
    const bookingId = searchParams.get('booking_id');
    const status = searchParams.get('status');

    if (status === 'success') {
      toast.success('Payment successful! Your booking is now pending approval.');
      // Redirect to booking confirmation or dashboard
      setTimeout(() => {
        navigate(`/my-bookings?payment_success=true&booking_id=${bookingId}`);
      }, 3000);
    } else {
      toast.error('Payment failed. Please try again.');
      setTimeout(() => {
        navigate('/my-bookings');
      }, 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
        <Loader className="mx-auto text-blue-600 animate-spin mb-4" size={48} />
        <h2 className="text-2xl font-bold mb-4">Processing Payment</h2>
        <p className="text-gray-600">Please wait while we verify your payment...</p>
      </div>
    </div>
  );
};

export default PaymentCallback;