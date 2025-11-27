// src/components/BookingCalendar.tsx
import React, { useState } from 'react'
import { useGetMyBookingsQuery } from '../features/api/bookingsApi'
import { useGetVehicleByIdQuery } from '../features/api/vehiclesApi'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Helper component that fetches and shows vehicle name
const VehicleBadge: React.FC<{ vehicleId: number }> = ({ vehicleId }) => {
  const { data: vehicle, isLoading } = useGetVehicleByIdQuery(vehicleId)

  if (isLoading) return <div className="text-xs text-gray-400">...</div>
  if (!vehicle) return null

  const name = `${vehicle.specification.manufacturer} ${vehicle.specification.model}`

  return (
    <div
      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded truncate font-medium"
      title={name}
    >
      {name}
    </div>
  )
}

const BookingCalendar: React.FC = () => {
  const { data: bookings = [] } = useGetMyBookingsQuery()
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay()

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1))
      return newDate
    })
  }

  const getBookingsForDay = (day: number) => {
    return bookings.filter(booking => {
      const pickup = new Date(booking.pickup_date)
      return (
        pickup.getDate() === day &&
        pickup.getMonth() === currentDate.getMonth() &&
        pickup.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)

  return (
    <div className="bg-white rounded-3xl p-6 shadow-2xl border border-white/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Your Bookings</h3>
        <div className="flex items-center gap-4">
          <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells before month starts */}
        {[...Array(firstDay)].map((_, i) => (
          <div key={`empty-${i}`} className="h-20 border border-gray-200 rounded-lg" />
        ))}

        {/* Days */}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1
          const dayBookings = getBookingsForDay(day)

          return (
            <div
              key={day}
              className="h-20 border border-gray-200 rounded-lg p-2 hover:bg-blue-50 transition-colors flex flex-col"
            >
              <div className="text-sm font-semibold text-gray-700 mb-1">{day}</div>
              <div className="flex-1 overflow-y-auto space-y-1 text-xs">
                {dayBookings.slice(0, 3).map(booking => (
                  <VehicleBadge key={booking.booking_id} vehicleId={booking.vehicle_id} />
                ))}
                {dayBookings.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayBookings.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BookingCalendar