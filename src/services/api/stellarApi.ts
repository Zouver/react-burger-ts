import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { BURGER_API_URL } from '@utils/constants.ts';

import type { TIngredient } from '@utils/types.ts';

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

export const stellarApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: BURGER_API_URL }),
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
    getIngredients: builder.query<TIngredient[], void>({
      query: () => '/ingredients',
      transformResponse: (response: TIngredientsResponse) => {
        if (!response.success) {
          throw new Error('Сервер вернул некорректный ответ.');
        }

        return response.data;
      },
    }),
  }),
  reducerPath: 'stellarApi',
});

export const { useCreateOrderMutation, useGetIngredientsQuery } = stellarApi;
