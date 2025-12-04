// features/slice/AuthSlice.ts - UPDATED
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface User {
    user_id: number
    first_name: string
    last_name: string
    email: string
    user_type: string 
    created_at: string
    updated_at: string
    phone_number?: string
    address?: string
}

interface AuthState {
    isAuthenticated: boolean
    token: string | null
    user: User | null
}

const initialState: AuthState = {
    isAuthenticated: false,
    token: null,
    user: null,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set user credentials
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            
            // CRITICAL: Store token in localStorage
            // localStorage.setItem('token', action.payload.token);
            // console.log('✅ Token stored in localStorage');
        },
        
        // Clear user credentials
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            
            // CRITICAL: Remove token from localStorage
            // localStorage.removeItem('token');
        },
        
        // NEW: Initialize auth from localStorage on app load
        // initializeAuth: (state) => {
        //     const token = localStorage.getItem('token');
        //     if (token) {
        //         state.token = token;
        //         state.isAuthenticated = true;
        //         console.log('🔄 Auth initialized from localStorage');
        //     }
        // }
    },
})

export const { setCredentials, clearCredentials,  } = authSlice.actions
export default authSlice.reducer