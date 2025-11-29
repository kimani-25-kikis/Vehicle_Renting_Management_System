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
      element: <Register />
    },
    {
      path: '/login',
      element: <Login />
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
      element: <MyBookings />
    },
    {
      path: '/dashboard',
      element: <UserDashboard />
    },

    // ---------------------
    // ADMIN ROUTES
    // ---------------------
    {
      path: '/admin',
      element: (
        <AdminDashboardLayout>
          <AdminOverview />
        </AdminDashboardLayout>
      )
    },
    {
      path: '/admin/users',
      element: (
        <AdminDashboardLayout>
          <UserManagement />
        </AdminDashboardLayout>
      )
    },
    {
      path: '/admin/vehicles',
      element: (
        <AdminDashboardLayout>
          <VehicleManagement />
        </AdminDashboardLayout>
      )
    },
    {
      path: '/admin/bookings',
      element: (
        <AdminDashboardLayout>
          <BookingManagement />
        </AdminDashboardLayout>
      )
    },
    {
      path: '/admin/payments',
      element: (
        <AdminDashboardLayout>
          <PaymentManagement />
        </AdminDashboardLayout>
      )
    },
    {
      path: '/admin/reviews',
      element: (
        <AdminDashboardLayout>
          <ReviewManagement />
        </AdminDashboardLayout>
      )
    },
    {
      path: '/admin/support',
      element: (
        <AdminDashboardLayout>
          <SupportTickets />
        </AdminDashboardLayout>
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
