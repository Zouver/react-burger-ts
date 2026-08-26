import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { stellarApi } from './api/stellarApi.ts';
import { authSlice } from './auth/authSlice.ts';
import { burgerConstructorSlice } from './burgerConstructor/burgerConstructorSlice.ts';

const rootReducer = combineSlices(authSlice, burgerConstructorSlice, stellarApi);

export const store = configureStore({
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(stellarApi.middleware),
  reducer: rootReducer,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
