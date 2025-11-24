import { configureStore } from '@reduxjs/toolkit'
import { AuthApi } from '../features/api/AuthApi'
import { vehiclesApi } from '../features/api/vehiclesApi' // Import vehiclesApi
import authSlice from '../features/slice/AuthSlice'
import storage from 'redux-persist/lib/storage' 
import { persistReducer, persistStore } from 'redux-persist';
import { userApi } from '../features/api/UserApi';

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['token', 'isAuthenticated', 'user'], 
};

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);

export const store = configureStore({
    reducer: {
        [AuthApi.reducerPath]: AuthApi.reducer,
        [vehiclesApi.reducerPath]: vehiclesApi.reducer, // Add vehiclesApi reducer
        [userApi.reducerPath]: userApi.reducer,
        authSlice: persistedAuthReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REGISTER'],
            },
        }).concat(
            AuthApi.middleware, 
            vehiclesApi.middleware, // Add vehiclesApi middleware
            userApi.middleware,
        ),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch