import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { VehiclesResponse, VehicleQueryParams, Vehicle } from '../../types/Types'

export const vehiclesApi = createApi({
    reducerPath: 'vehiclesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000/api',
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token')
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    tagTypes: ['Vehicles'],
    endpoints: (builder) => ({
        getVehicles: builder.query<VehiclesResponse, VehicleQueryParams>({
            query: (params) => {
                const queryParams = new URLSearchParams()
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        queryParams.append(key, value.toString())
                    }
                })
                // FIX: Add '/vehicles' to match your backend route
                return `/vehicles?${queryParams.toString()}`
            },
            providesTags: ['Vehicles'],
        }),
        getVehicleById: builder.query<Vehicle, number>({
            query: (id) => `/vehicles/${id}`, // FIX: Add '/vehicles'
            providesTags: ['Vehicles'],
        }),
        getVehicleLocations: builder.query<string[], void>({
            query: () => '/vehicles/locations', // FIX: Add '/vehicles'
        }),
        getVehicleSpecifications: builder.query<any[], void>({
            query: () => '/vehicles/specifications', // FIX: Add '/vehicles'
        }),
    }),
})

export const {
    useGetVehiclesQuery,
    useGetVehicleByIdQuery,
    useGetVehicleLocationsQuery,
    useGetVehicleSpecificationsQuery,
} = vehiclesApi