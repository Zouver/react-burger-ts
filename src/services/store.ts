import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { stellarApi } from './api/stellarApi.ts';
import { burgerConstructorSlice } from './burgerConstructor/burgerConstructorSlice.ts';
import { ingredientDetailsSlice } from './ingredientDetails/ingredientDetailsSlice.ts';

const rootReducer = combineSlices(
  burgerConstructorSlice,
  ingredientDetailsSlice,
  stellarApi
);

export const store = configureStore({
  devTools: import.meta.env.DEV,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(stellarApi.middleware),
  reducer: rootReducer,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
