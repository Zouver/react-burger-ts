import type { TIngredient } from '../../src/utils/types.ts';

const createIngredient = (
  id: string,
  name: string,
  type: TIngredient['type'],
  price: number
): TIngredient => ({
  __v: 0,
  _id: id,
  calories: 100,
  carbohydrates: 10,
  fat: 5,
  image: `/images/${id}.png`,
  image_large: `/images/${id}-large.png`,
  image_mobile: `/images/${id}-mobile.png`,
  name,
  price,
  proteins: 20,
  type,
});

export const bun = createIngredient('tests-bun', 'Космическая булка', 'bun', 1255);
export const main = createIngredient('tests-main', 'Метеоритная котлета', 'main', 988);
