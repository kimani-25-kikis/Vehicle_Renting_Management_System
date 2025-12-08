import React from 'react'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store/store'

interface UserRouteProps {
    children: React.ReactNode
}

const UserRoute: React.FC<UserRouteProps> = ({ children }) => {
    const { isAuthenticated, user } = useSelector((state: RootState) => state.authSlice)

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />
    }

    // Check if user is customer
    if (user.user_type !== 'customer') {

        if (user.user_type === 'admin') {
            return <Navigate to="/admin" replace />
        }
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

export default UserRoute