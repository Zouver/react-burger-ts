import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { BURGER_API_URL } from '@utils/constants.ts';

import { resetAuthState, setAuthChecked, setUser } from '../auth/authSlice.ts';
import {
  clearPasswordResetRequested,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  markPasswordResetRequested,
  saveTokens,
} from '../auth/tokenStorage.ts';

import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import type { TIngredient, TUser } from '@utils/types.ts';

type TIngredientsResponse = {
  success: boolean;
  data: TIngredient[];
};

type TOrderResponse = {
  success: boolean;
  name: string;
  order: {
    number: number;
  };
};

export type TAuthResponse = {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: TUser;
};

export type TUserResponse = {
  success: boolean;
  user: TUser;
};

export type TMessageResponse = {
  success: boolean;
  message: string;
};

export type TLoginRequest = {
  email: string;
  password: string;
};

export type TRegisterRequest = TLoginRequest & {
  name: string;
};

export type TResetPasswordRequest = {
  password: string;
  token: string;
};

export type TUpdateUserRequest = {
  email: string;
  name: string;
  password: string;
};

type TRefreshResponse = {
  success: boolean;
  accessToken: string;
  refreshToken: string;
};

type TErrorData = {
  message?: string;
};

const TOKEN_ERROR_MESSAGES = new Set([
  'jwt expired',
  'jwt malformed',
  'invalid token',
  'Token is invalid',
  'You should be authorised',
]);

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BURGER_API_URL,
  prepareHeaders: (headers) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      headers.set('authorization', accessToken);
    }

    return headers;
  },
});

const isTokenError = (error?: FetchBaseQueryError): boolean => {
  const data = error?.data;

  if (typeof data !== 'object' || data === null || !('message' in data)) {
    return false;
  }

  const message = (data as TErrorData).message;

  return Boolean(message && TOKEN_ERROR_MESSAGES.has(message));
};

const isRefreshResponse = (data: unknown): data is TRefreshResponse =>
  typeof data === 'object' &&
  data !== null &&
  'success' in data &&
  data.success === true &&
  'accessToken' in data &&
  typeof data.accessToken === 'string' &&
  data.accessToken.length > 0 &&
  'refreshToken' in data &&
  typeof data.refreshToken === 'string' &&
  data.refreshToken.length > 0;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (!isTokenError(result.error)) {
    return result;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    api.dispatch(resetAuthState());
    return result;
  }

  const refreshResult = await rawBaseQuery(
    {
      body: { token: refreshToken },
      method: 'POST',
      url: '/auth/token',
    },
    api,
    extraOptions
  );

  if (!isRefreshResponse(refreshResult.data)) {
    clearTokens();
    api.dispatch(resetAuthState());
    return result;
  }

  saveTokens(refreshResult.data.accessToken, refreshResult.data.refreshToken);
  result = await rawBaseQuery(args, api, extraOptions);

  if (isTokenError(result.error)) {
    clearTokens();
    api.dispatch(resetAuthState());
  }

  return result;
};

export const stellarApi = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createOrder: builder.mutation<TOrderResponse, string[]>({
      query: (ingredients) => ({
        body: { ingredients },
        method: 'POST',
        url: '/orders',
      }),
      transformResponse: (response: TOrderResponse) => {
        if (!response.success) {
          throw new Error('Сервер вернул некорректный ответ.');
        }

        return response;
      },
    }),
    forgotPassword: builder.mutation<TMessageResponse, string>({
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          markPasswordResetRequested();
        } catch (_error) {
          // mutation hook handles the error state
        }
      },
      query: (email) => ({
        body: { email },
        method: 'POST',
        url: '/password-reset',
      }),
    }),
    getUser: builder.query<TUser, void>({
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          dispatch(setUser(data));
        } catch (_error) {
          dispatch(setAuthChecked(true));
        }
      },
      query: () => '/auth/user',
      transformResponse: (response: TUserResponse) => {
        if (!response.success) {
          throw new Error('Сервер вернул некорректный ответ.');
        }

        return response.user;
      },
    }),
    getIngredients: builder.query<TIngredient[], void>({
      query: () => '/ingredients',
      transformResponse: (response: TIngredientsResponse) => {
        if (!response.success) {
          throw new Error('Сервер вернул некорректный ответ.');
        }

        return response.data;
      },
    }),
    login: builder.mutation<TAuthResponse, TLoginRequest>({
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          saveTokens(data.accessToken, data.refreshToken);
          dispatch(setUser(data.user));
        } catch (_error) {
          // mutation hook handles the error state
        }
      },
      query: (body) => ({
        body,
        method: 'POST',
        url: '/auth/login',
      }),
    }),
    logout: builder.mutation<TMessageResponse, void>({
      async queryFn(_arg, api, extraOptions) {
        const token = getRefreshToken();

        if (!token) {
          return {
            data: { message: 'Local session cleared', success: true },
          };
        }

        const result = await rawBaseQuery(
          {
            body: { token },
            method: 'POST',
            url: '/auth/logout',
          },
          api,
          extraOptions
        );

        if (result.error) {
          return {
            error: result.error,
          };
        }

        return {
          data: result.data as TMessageResponse,
        };
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
        } finally {
          clearTokens();
          dispatch(resetAuthState());
        }
      },
    }),
    register: builder.mutation<TAuthResponse, TRegisterRequest>({
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          saveTokens(data.accessToken, data.refreshToken);
          dispatch(setUser(data.user));
        } catch (_error) {
          // mutation hook handles the error state
        }
      },
      query: (body) => ({
        body,
        method: 'POST',
        url: '/auth/register',
      }),
    }),
    resetPassword: builder.mutation<TMessageResponse, TResetPasswordRequest>({
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          clearPasswordResetRequested();
        } catch (_error) {
          // mutation hook handles the error state
        }
      },
      query: (body) => ({
        body,
        method: 'POST',
        url: '/password-reset/reset',
      }),
    }),
    updateUser: builder.mutation<TUser, TUpdateUserRequest>({
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;

          dispatch(setUser(data));
        } catch (_error) {
          // mutation hook handles the error state
        }
      },
      query: (body) => ({
        body,
        method: 'PATCH',
        url: '/auth/user',
      }),
      transformResponse: (response: TUserResponse) => {
        if (!response.success) {
          throw new Error('Сервер вернул некорректный ответ.');
        }

        return response.user;
      },
    }),
  }),
  reducerPath: 'stellarApi',
});

export const {
  useCreateOrderMutation,
  useForgotPasswordMutation,
  useGetIngredientsQuery,
  useLazyGetUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useUpdateUserMutation,
} = stellarApi;
