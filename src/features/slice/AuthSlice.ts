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
    profile_picture?: string           
    profile_picture_public_id?: string
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
            
        },
        
        // Clear user credentials
        clearCredentials: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            
        },

        updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = {
                    ...state.user,
                    ...action.payload
                };
            }
        },
        
        
    },
})

export const { setCredentials, clearCredentials, updateUserProfile  } = authSlice.actions
export default authSlice.reducer