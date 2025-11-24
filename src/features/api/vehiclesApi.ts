import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { VehiclesResponse, VehicleQueryParams, Vehicle } from '../../types/Types'
import { apiDomain } from '../../apiDomain/apiDomain'

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
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, value.toString())
                    }
                })
                return `?${queryParams.toString()}`
            },
            providesTags: ['Vehicles'],
        }),
        getVehicleById: builder.query<Vehicle, number>({
            query: (id) => `/${id}`,
            providesTags: ['Vehicles'],
        }),
        getVehicleLocations: builder.query<string[], void>({
            query: () => '/locations',
        }),
        getVehicleSpecifications: builder.query<any[], void>({
            query: () => '/specifications',
        }),
    }),
})

export const {
    useGetVehiclesQuery,
    useGetVehicleByIdQuery,
    useGetVehicleLocationsQuery,
    useGetVehicleSpecificationsQuery,
} = vehiclesApi