import { describe, expect, it } from 'vitest';

import { authSlice, resetAuthState, setAuthChecked, setUser } from './authSlice.ts';

import type { TUser } from '@utils/types.ts';

const user: TUser = {
  email: 'space@example.com',
  name: 'Космонавт',
};

describe('authSlice reducer', (): void => {
  it('возвращает начальное состояние для неизвестного action', (): void => {
    expect(authSlice.reducer(undefined, { type: 'unknown' })).toEqual({
      isAuthChecked: false,
      isAuthenticated: false,
      user: null,
    });
  });

  it('изменяет только признак завершённой проверки авторизации', (): void => {
    const authenticatedState = authSlice.reducer(undefined, setUser(user));

    expect(authSlice.reducer(authenticatedState, setAuthChecked(false))).toEqual({
      isAuthChecked: false,
      isAuthenticated: true,
      user,
    });
  });

  it('сохраняет пользователя и отмечает сессию авторизованной', (): void => {
    expect(authSlice.reducer(undefined, setUser(user))).toEqual({
      isAuthChecked: true,
      isAuthenticated: true,
      user,
    });
  });

  it('полностью сбрасывает авторизованное состояние', (): void => {
    const authenticatedState = authSlice.reducer(undefined, setUser(user));

    expect(authSlice.reducer(authenticatedState, resetAuthState())).toEqual({
      isAuthChecked: true,
      isAuthenticated: false,
      user: null,
    });
  });
});
