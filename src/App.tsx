import { RouterProvider, createBrowserRouter } from 'react-router'
import Login from './userPages/Login'
import Register from './userPages/Register'
import HomePage from './components/homePage'

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
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App