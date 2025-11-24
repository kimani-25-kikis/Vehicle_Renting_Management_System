import React from 'react'
import SignUp from '../assets/SignUp.png'
import { Link, useNavigate } from 'react-router'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { AuthApi } from '../features/api/AuthApi'
import { Toaster, toast } from 'sonner'

type RegisterFormValues = {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  password: string
}

const Register: React.FC = () => {
  // RTK Query mutation hook for registration
  const [registerUser, { isLoading }] = AuthApi.useRegisterMutation()
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>()
  const navigate = useNavigate()

  // Handle form submission
  const handleSubmitForm: SubmitHandler<RegisterFormValues> = async (data) => {
    try {
      const response = await registerUser(data).unwrap()
      console.log('Registration successful:', response)
      navigate('/login')
    } catch (error: any) {
      console.error('Registration failed:', error)
      toast.error(error.data.error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-navy-900">
      <Toaster position="top-right" richColors />

      <div className="flex-grow flex items-center justify-center py-10 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden w-full max-w-6xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-blue-200">
          
          {/* --- Left: Illustration Section --- */}
          <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-blue-800 to-blue-600 p-10 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 animate-pulse"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-400 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-400 rounded-full opacity-20 blur-xl"></div>
            
            <img
              src={SignUp}
              alt="Register"
              className="w-full max-w-sm drop-shadow-2xl hover:scale-105 transition-transform duration-500 z-10"
            />
            <h3 className="text-white text-2xl font-bold mt-6 text-center">
              Join RentWheels Today 🚗
            </h3>
            <p className="text-blue-100 text-center text-sm mt-2 max-w-sm">
              Experience premium car rental service with the best vehicles and exclusive deals.
            </p>
            
            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 mt-6 justify-center z-10">
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">Premium Vehicles</span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">24/7 Support</span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">Best Prices</span>
            </div>
          </div>

          {/* --- Right: Form Section --- */}
          <div className="flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-blue-900 mb-2">
                  Create Account
                </h2>
                <p className="text-gray-600 text-base">
                  Join the RentWheels community today
                </p>
              </div>

              <form className="flex flex-col gap-5" onSubmit={handleSubmit(handleSubmitForm)}>
                {/* Name Fields */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="first_name">
                      First Name
                    </label>
                    <input
                      {...register('first_name', { required: 'First name is required', minLength: { value: 2, message: 'First name must be at least 2 characters' } })}
                      type="text"
                      id="first_name"
                      placeholder="Joshua"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:bg-blue-50 focus:border-blue-600 outline-none transition-all focus:ring-2 focus:ring-blue-200"
                    />
                    {errors.first_name && <p className="mt-1 text-sm text-orange-600 font-medium">{errors.first_name.message}</p>}
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="last_name">
                      Last Name
                    </label>
                    <input
                      {...register('last_name', { required: 'Last name is required', minLength: { value: 2, message: 'Last name must be at least 2 characters' } })}
                      type="text"
                      id="last_name"
                      placeholder="Ngigi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:bg-blue-50 focus:border-blue-600 outline-none transition-all focus:ring-2 focus:ring-blue-200"
                    />
                    {errors.last_name && <p className="mt-1 text-sm text-orange-600 font-medium">{errors.last_name.message}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email
                  </label>
                  <input
                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })}
                    type="email"
                    id="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:bg-blue-50 focus:border-blue-600 outline-none transition-all focus:ring-2 focus:ring-blue-200"
                  />
                  {errors.email && <p className="mt-1 text-sm text-orange-600 font-medium">{errors.email.message}</p>}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone_number">
                    Phone Number
                  </label>
                  <input
                    {...register('phone_number', { required: 'Phone number is required', pattern: { value: /^[0-9]{10,15}$/, message: 'Invalid phone number' } })}
                    type="tel"
                    id="phone_number"
                    placeholder="0712345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:bg-blue-50 focus:border-blue-600 outline-none transition-all focus:ring-2 focus:ring-blue-200"
                  />
                  {errors.phone_number && <p className="mt-1 text-sm text-orange-600 font-medium">{errors.phone_number.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                    Password
                  </label>
                  <input
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                    type="password"
                    id="password"
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:bg-blue-50 focus:border-blue-600 outline-none transition-all focus:ring-2 focus:ring-blue-200"
                  />
                  {errors.password && <p className="mt-1 text-sm text-orange-600 font-medium">{errors.password.message}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Footer Links */}
                <div className="text-center mt-6 space-y-3">
                  <Link to="/" className="text-blue-700 hover:text-blue-800 text-sm font-medium hover:underline block transition-colors">
                    🏡 Go to HomePage
                  </Link>
                  <div className="text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-colors">
                      Login Here
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

export default Register