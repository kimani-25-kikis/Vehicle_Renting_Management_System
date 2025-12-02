import { configureStore } from '@reduxjs/toolkit'
import { AuthApi } from '../features/api/AuthApi'
import { vehiclesApi } from '../features/api/vehiclesApi' 
import authSlice from '../features/slice/AuthSlice'
import storage from 'redux-persist/lib/storage' 
import { persistReducer, persistStore } from 'redux-persist';
import { userApi } from '../features/api/UserApi';
import { bookingsApi } from '../features/api/bookingsApi'
import { supportApi } from '../features/api/supportApi'
import { analyticsApi } from '../features/api/analyticApi'
import { paymentApi } from '../features/api/PaymentApi'

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['token', 'isAuthenticated', 'user'], 
};

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);

export const store = configureStore({
    reducer: {
        [AuthApi.reducerPath]: AuthApi.reducer,
        [vehiclesApi.reducerPath]: vehiclesApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [bookingsApi.reducerPath]: bookingsApi.reducer,
        [supportApi.reducerPath]: supportApi.reducer,
        [analyticsApi.reducerPath]: analyticsApi.reducer,
        [paymentApi.reducerPath]: paymentApi.reducer,
        authSlice: persistedAuthReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REGISTER'],
            },
        }).concat(
            AuthApi.middleware, 
            vehiclesApi.middleware, 
            userApi.middleware,
            bookingsApi.middleware,
            supportApi.middleware,
            analyticsApi.middleware,
            paymentApi.middleware
        ),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch