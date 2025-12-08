import { RouterProvider, createBrowserRouter } from 'react-router'

// User Pages
import Login from './userPages/Login'
import Register from './userPages/Register'

// Public Components
import HomePage from './components/homePage'
import VehiclesListing from './vehicles/vehiclesListing'
import VehicleDetails from './vehicles/VehicleDetails'
import BookingFlow from './Booking/BookingFlow'
import BookingConfirmation from './Booking/BookingConfirmation'
import MyBookings from './Booking/MyBooking'
import UserDashboard from './UserDashboard/userDashboard'

// Admin Components
import AdminDashboardLayout from './components/admin/AdminDashboardLayout'
import AdminOverview from './components/admin/AdminOverview'
import UserManagement from './components/admin/UserManagement'
import VehicleManagement from './components/admin/VehicleManagement'
import BookingManagement from './components/admin/BookingManagement'
import PaymentManagement from './components/admin/PaymentManagement'
import ReviewManagement from './components/admin/ReviewManagement'
import SupportTickets from './components/admin/SupportTickets'
import AdminSettings from './components/admin/AdminSettings'

import AdminRoute from './components/auth/AdminRoute'
import UserRoute from './components/auth/UserRoute'
import PublicRoute from './components/auth/PublicRoute'
import PaymentCallback from './UserDashboard/paymentCallBack'

// Notifications
import { Toaster } from 'sonner'

function App() {
  const router = createBrowserRouter([
    // ---------------------
    // PUBLIC ROUTES
    // ---------------------
    {
      path: '/',
      element: <HomePage />
    },
    {
      path: '/register',
      element: <PublicRoute><Register /></PublicRoute>
    },
    {
      path: '/login',
      element: <PublicRoute><Login /></PublicRoute>
    },
    {
      path: '/vehicles',
      element: <VehiclesListing />
    },
    {
      path: '/vehicles/:id',
      element: <VehicleDetails />
    },
    {
      path: '/bookings/new',
      element: <BookingFlow />
    },
    {
      path: '/booking-confirmation/:booking_id',
      element: <BookingConfirmation />
    },
    {
      path: '/my-bookings',
      element: <UserRoute><MyBookings /></UserRoute>
    },
    {
      path: '/dashboard',
      element: <UserRoute><UserDashboard /></UserRoute>
    },
    {
      path:'/payment-callback',
      element:<PaymentCallback />
    }, 

    // ---------------------
    // ADMIN ROUTES
    // ---------------------
    {
      path: '/admin',
      element: (
        <AdminRoute>
          <AdminDashboardLayout>
          <AdminOverview />
        </AdminDashboardLayout>
        </AdminRoute>
        
      )
    },
    {
      path: '/admin/users',
      element: (

         <AdminRoute>
          <AdminDashboardLayout>
          <UserManagement />
        </AdminDashboardLayout>
         </AdminRoute>
        
      )
    },
    {
      path: '/admin/vehicles',
      element: (

        <AdminRoute>
          <AdminDashboardLayout>
          <VehicleManagement />
        </AdminDashboardLayout>
        </AdminRoute>
        
      )
    },
    {
      path: '/admin/bookings',
      element: (

        <AdminRoute>
          <AdminDashboardLayout>
          <BookingManagement />
        </AdminDashboardLayout>
        </AdminRoute>
        
      )
    },
    {
      path: '/admin/payments',
      element: (
        <AdminRoute>
          <AdminDashboardLayout>
          <PaymentManagement />
        </AdminDashboardLayout>
        </AdminRoute>
        
      )
    },
    {
      path: '/admin/reviews',
      element: (

        <AdminRoute>
          <AdminDashboardLayout>
          <ReviewManagement />
        </AdminDashboardLayout>
        </AdminRoute>
        
      )
    },
    {
      path: '/admin/support',
      element: (

        <AdminRoute>
          <AdminDashboardLayout>
          <SupportTickets />
        </AdminDashboardLayout>
        </AdminRoute>
        
      )
    },
    {
      path: '/admin/settings',
      element: (
        <AdminDashboardLayout>
          <AdminSettings />
        </AdminDashboardLayout>
      )
    }
  ])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}

export default App
