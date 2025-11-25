import { RouterProvider, createBrowserRouter } from 'react-router'
import Login from './userPages/Login'
import Register from './userPages/Register'
import HomePage from './components/homePage'
import VehiclesListing from './vehicles/vehiclesListing'
import VehicleDetails from './vehicles/VehicleDetails'

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
    path: '/vehicles/:id',           // Add this route
    element: <VehicleDetails />
  },
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App