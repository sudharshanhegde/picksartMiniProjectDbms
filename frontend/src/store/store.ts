import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';

console.log('Configuring Redux store...');

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

console.log('Redux store configured successfully');

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 