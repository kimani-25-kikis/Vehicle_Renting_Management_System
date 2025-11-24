import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { User } from '../../types/Types';
import { apiDomain } from '../../apiDomain/apiDomain';

export const userApi = createApi({
    reducerPath: 'userApi',
    baseQuery: fetchBaseQuery({ baseUrl: apiDomain }),
    tagTypes: ['Users'],
    endpoints: (builder) => ({

        // Fetch all Users
        getAllUsers: builder.query<User[], void>({
            query: () => 'users',
            providesTags: ['Users'],
        }),        

        // Get user by id
        getUserById: builder.query<User, { user_id: number }>({
            query: ({ user_id }) => `users/${user_id}`,
            providesTags: ['Users'],
        }),

        // Update user details
        updateUsersDetails: builder.mutation<{ message: string }, { user_id: number } & Partial<Omit<User, 'user_id' | 'user_type' | 'created_at'>>>({
            query: ({ user_id, ...updateUser }) => ({
                url: `users/${user_id}`,
                method: 'PUT',
                body: updateUser,
            }),
            invalidatesTags: ['Users'],
        }),

        // Update user_type
        updateUserTypeStatus: builder.mutation<{message: string}, {user_id: number, user_type: string}>({
            query: ({user_id, ...updateUserType}) => ({
                url: `user/user-status/${user_id}`,
                method: 'PATCH',
                body: updateUserType,
            }),
            invalidatesTags: ['Users']
        }),

        // DELETE USER MUTATION 
        deleteUser: builder.mutation<{ message: string }, number>({
            query: (user_id) => ({
                url: `users/${user_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),

    }),
})

// Export the hooks with the delete mutation included
export const {
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useUpdateUsersDetailsMutation,
    useUpdateUserTypeStatusMutation,
    useDeleteUserMutation, 
} = userApi