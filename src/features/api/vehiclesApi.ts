import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { VehiclesResponse, VehicleQueryParams, Vehicle } from '../../types/Types'

// Helper function to get token from Redux persist storage
const getAuthToken = (): string | null => {
    try {
        const persistAuth = localStorage.getItem('persist:auth')
        if (!persistAuth) return null

        const authState = JSON.parse(persistAuth)
        const tokenWithBearer = authState.token
        if (!tokenWithBearer) return null

        return tokenWithBearer.replace(/^"Bearer /, '').replace(/"$/, '')
    } catch (error) {
        console.error('Error getting auth token:', error)
        return null
    }
}

// Create Vehicle Request Type
export interface CreateVehicleRequest {
    rental_rate: number
    current_location: string
    availability?: boolean  
    vehicle_spec_id?: number
    manufacturer?: string
    model?: string
    year?: number
    fuel_type?: string
    engine_capacity?: number
    transmission?: string
    seating_capacity?: number
    color?: string
    features?: string
    vehicle_type?: string
    image_url?: string
    imageFile?: File  
}

// Update Vehicle Request Type
export interface UpdateVehicleRequest {
    rental_rate?: number
    availability?: boolean
    current_location?: string
}

export interface VehicleImageUploadResponse {
    success: boolean
    message: string
    image_url?: string
    images?: Array<{
        secure_url: string
        public_id: string
        format: string
        width: number
        height: number
    }>
}

export const vehiclesApi = createApi({
    reducerPath: 'vehiclesApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3000/api',
        prepareHeaders: (headers) => {
            const token = getAuthToken()
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    tagTypes: ['Vehicles', 'VehicleImages'],
    endpoints: (builder) => ({
        // GET all vehicles with filters
        getVehicles: builder.query<VehiclesResponse, VehicleQueryParams>({
            query: (params) => {
                const queryParams = new URLSearchParams()
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        queryParams.append(key, value.toString())
                    }
                })
                
                return `/vehicles?${queryParams.toString()}`
            },
            providesTags: ['Vehicles'],
        }),
        
        // GET vehicle by ID
        getVehicleById: builder.query<Vehicle, number>({
            query: (id) => `/vehicles/${id}`,
            providesTags: ['Vehicles'],
        }),
        
        // GET available locations
        getVehicleLocations: builder.query<string[], void>({
            query: () => '/vehicles/locations',
        }),
        
        // GET vehicle specifications
        getVehicleSpecifications: builder.query<any[], void>({
            query: () => '/vehicles/specifications',
        }),
        
        // CREATE vehicle
        createVehicle: builder.mutation<{ message: string; vehicle: Vehicle }, FormData | CreateVehicleRequest>({
            query: (vehicleData) => {
                // Check if it's FormData (file upload) or JSON
                const isFormData = vehicleData instanceof FormData
                
                return {
                    url: '/vehicles',
                    method: 'POST',
                    body: vehicleData,
                    headers: isFormData ? undefined : { 'Content-Type': 'application/json' }
                }
            },
            invalidatesTags: ['Vehicles'],
        }),
        
        // UPDATE vehicle
        updateVehicle: builder.mutation<{ message: string; updated_vehicle: Vehicle }, {
            vehicle_id: number
            data: UpdateVehicleRequest
        }>({
            query: ({ vehicle_id, data }) => ({
                url: `/vehicles/${vehicle_id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['Vehicles'],
        }),
        
        // DELETE vehicle
        deleteVehicle: builder.mutation<{ message: string; deleted_vehicle: Vehicle }, number>({
            query: (vehicle_id) => ({
                url: `/vehicles/${vehicle_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Vehicles'],
        }),
        
        // UPDATE vehicle availability
        updateVehicleAvailability: builder.mutation<{ 
            message: string; 
            updated_vehicle: Vehicle 
        }, {
            vehicle_id: number
            availability: boolean
        }>({
            query: ({ vehicle_id, availability }) => ({
                url: `/vehicles/${vehicle_id}/availability`,
                method: 'PATCH',
                body: { availability },
            }),
            invalidatesTags: ['Vehicles'],
        }),

            // NEW: Upload vehicle image
        uploadVehicleImage: builder.mutation<VehicleImageUploadResponse, {
            vehicle_spec_id: number
            image: File
        }>({
            query: ({ vehicle_spec_id, image }) => {
                const formData = new FormData()
                formData.append('image', image)
                
                return {
                    url: `/vehicles/${vehicle_spec_id}/image`,
                    method: 'POST',
                    body: formData,
                }
            },
            invalidatesTags: ['Vehicles', 'VehicleImages'],
        }),
        
        // NEW: Upload multiple vehicle images
        uploadVehicleImages: builder.mutation<VehicleImageUploadResponse, {
            vehicle_spec_id: number
            images: File[]
        }>({
            query: ({ vehicle_spec_id, images }) => {
                const formData = new FormData()
                images.forEach((image, index) => {
                    formData.append('images', image)
                })
                
                return {
                    url: `/vehicles/${vehicle_spec_id}/images`,
                    method: 'POST',
                    body: formData,
                }
            },
            invalidatesTags: ['Vehicles', 'VehicleImages'],
        }),
        
        // NEW: Create vehicle with image upload (all-in-one)
        createVehicleWithImage: builder.mutation<{ message: string; vehicle: Vehicle }, {
            vehicleData: Omit<CreateVehicleRequest, 'image_url'>
            imageFile?: File
        }>({
            query: ({ vehicleData, imageFile }) => {
                const formData = new FormData()
                
                // Add all vehicle data to FormData
                Object.entries(vehicleData).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, value.toString())
                    }
                })
                
                // Add image file if provided
                if (imageFile) {
                    formData.append('image', imageFile)
                }
                
                return {
                    url: '/vehicles',
                    method: 'POST',
                    body: formData,
                }
            },
            invalidatesTags: ['Vehicles'],
        }),

        
    }),

    
})

export const {
    useGetVehiclesQuery,
    useGetVehicleByIdQuery,
    useGetVehicleLocationsQuery,
    useGetVehicleSpecificationsQuery,
    useCreateVehicleMutation,
    useUpdateVehicleMutation,
    useDeleteVehicleMutation,
    useUpdateVehicleAvailabilityMutation,
    useUploadVehicleImageMutation,      
    useUploadVehicleImagesMutation,     
    useCreateVehicleWithImageMutation,  
} = vehiclesApi