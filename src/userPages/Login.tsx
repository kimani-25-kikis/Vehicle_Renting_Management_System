import React from 'react'
import SignIn from '../assets/SignIn.webp'
import { Link, useNavigate } from 'react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { AuthApi } from '../features/api/AuthApi'
import { toast, Toaster } from 'sonner'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../features/slice/AuthSlice'

type LoginFormValues = {
  email: string
  password: string
}

const Login: React.FC = () => {
  const [loginUser, { isLoading }] = AuthApi.useLoginMutation()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLoginForm: SubmitHandler<LoginFormValues> = async (data) => {
    try {
      const response = await loginUser(data).unwrap()
      console.log('Login successful:', response)
      dispatch(setCredentials({ token: response.token, user: response.userInfo }))
      navigate('/')
    } catch (error: any) {
      console.error('Login failed:', error)
      toast.error(error.data.error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-navy-900">
      <Toaster position="top-right" richColors />

      <div className="flex-grow flex items-center justify-center py-10 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden w-full max-w-6xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-blue-200">

          {/* --- Left: Image Section --- */}
          <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-800 to-blue-600 p-10 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 animate-pulse"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-400 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400 rounded-full opacity-20 blur-xl"></div>
            
            <img
              src={SignIn}
              alt="Login Illustration"
              className="w-full max-w-sm drop-shadow-2xl hover:scale-105 transition-transform duration-500 z-10"
            />
            <h3 className="text-white text-2xl font-bold mt-6 text-center">
              Welcome Back to RentWheels 🚗
            </h3>
            <p className="text-blue-100 text-center text-sm mt-2 max-w-sm">
              Log in to access premium vehicles, exclusive deals, and manage your bookings.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center z-10">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">Premium Fleet</span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">24/7 Support</span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">Easy Booking</span>
            </div>
          </div>

          {/* --- Right: Form Section --- */}
          <div className="flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-blue-900 mb-2">
                  Sign In
                </h2>
                <p className="text-gray-600 text-base">
                  Access your RentWheels account
                </p>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleSubmit(handleLoginForm)}>
                {/* Email Field */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })}
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:bg-blue-50 focus:border-blue-600 outline-none transition-all focus:ring-2 focus:ring-blue-200"
                  />
                  {errors.email && <p className="mt-1 text-sm text-orange-600 font-medium">{errors.email.message}</p>}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    type="password"
                    id="password"
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:bg-blue-50 focus:border-blue-600 outline-none transition-all focus:ring-2 focus:ring-blue-200"
                  />
                  {errors.password && <p className="mt-1 text-sm text-orange-600 font-medium">{errors.password.message}</p>}
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    to="#"
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium hover:underline transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>

                {/* Footer Links */}
                <div className="text-center mt-6 space-y-3">
                  <Link
                    to="/"
                    className="text-blue-700 hover:text-blue-800 text-sm font-medium hover:underline block transition-colors"
                  >
                    🏡 Go to HomePage
                  </Link>
                  <div className="text-gray-600 text-sm">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-colors"
                    >
                      Register Here
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login