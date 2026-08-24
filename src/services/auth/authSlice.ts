import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@services/store.ts';
import type { TUser } from '@utils/types.ts';

type TAuthState = {
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  user: TUser | null;
};

const initialState: TAuthState = {
  isAuthChecked: false,
  isAuthenticated: false,
  user: null,
};

export const authSlice = createSlice({
  initialState,
  name: 'auth',
  reducers: {
    resetAuthState: (state) => {
      state.isAuthChecked = true;
      state.isAuthenticated = false;
      state.user = null;
    },
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.isAuthChecked = action.payload;
    },
    setUser: (state, action: PayloadAction<TUser>) => {
      state.isAuthChecked = true;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
  },
});

export const { resetAuthState, setAuthChecked, setUser } = authSlice.actions;

export const selectAuth = (state: RootState): TAuthState => state.auth;
export const selectIsAuthChecked = (state: RootState): boolean =>
  state.auth.isAuthChecked;
export const selectIsAuthenticated = (state: RootState): boolean =>
  state.auth.isAuthenticated;
export const selectUser = (state: RootState): TUser | null => state.auth.user;
