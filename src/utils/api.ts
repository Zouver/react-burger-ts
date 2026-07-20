import { INGREDIENTS_ENDPOINT } from '@utils/constants.ts';

import type { TIngredient } from '@utils/types.ts';

type TIngredientsResponse = {
  success: boolean;
  data: TIngredient[];
};

export const getIngredients = async (signal?: AbortSignal): Promise<TIngredient[]> => {
  const response = await fetch(INGREDIENTS_ENDPOINT, { signal });

  if (!response.ok) {
    throw new Error('Не удалось загрузить ингредиенты. Попробуйте позже.');
  }

  const data = (await response.json()) as TIngredientsResponse;

  if (!data.success) {
    throw new Error('Сервер вернул некорректный ответ.');
  }

  return data.data;
};
