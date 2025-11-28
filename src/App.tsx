import { RouterProvider, createBrowserRouter } from 'react-router'
import Login from './userPages/Login'
import Register from './userPages/Register'
import HomePage from './components/homePage'
import VehiclesListing from './vehicles/vehiclesListing'
import VehicleDetails from './vehicles/VehicleDetails'
import BookingFlow from './Booking/BookingFlow'
import BookingConfirmation from './Booking/BookingConfirmation'
import MyBookings from './Booking/MyBooking'
import { Toaster } from 'sonner'

function App() {
  const router = createBrowserRouter([
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
      path: "/my-bookings",
     element: <MyBookings  />
    },
  ])

  return (
    <>
    <RouterProvider router={router} />
    <Toaster position="top-center" richColors closeButton />
    </>
  )
}

export default App