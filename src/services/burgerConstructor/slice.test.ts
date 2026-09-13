import { describe, expect, it } from 'vitest';

import {
  addIngredient,
  burgerConstructorSlice,
  clearBurgerConstructor,
  moveIngredient,
  removeIngredient,
} from './burgerConstructorSlice.ts';

import type { TConstructorIngredient, TIngredient } from '@utils/types.ts';

const createIngredient = (id: string, type: TIngredient['type']): TIngredient => ({
  __v: 0,
  _id: id,
  calories: 100,
  carbohydrates: 10,
  fat: 5,
  image: `/images/${id}.png`,
  image_large: `/images/${id}-large.png`,
  image_mobile: `/images/${id}-mobile.png`,
  name: id,
  price: 100,
  proteins: 20,
  type,
});

const bun = createIngredient('bun', 'bun');
const main = createIngredient('main', 'main');
const sauce = createIngredient('sauce', 'sauce');

describe('burgerConstructorSlice reducer', (): void => {
  it('возвращает начальное состояние и заменяет булку при повторном добавлении', (): void => {
    expect(burgerConstructorSlice.reducer(undefined, { type: 'unknown' })).toEqual({
      bun: null,
      ingredients: [],
    });

    const stateWithBun = burgerConstructorSlice.reducer(undefined, addIngredient(bun));
    expect(stateWithBun).toEqual({ bun, ingredients: [] });

    const secondBun = createIngredient('second-bun', 'bun');
    expect(
      burgerConstructorSlice.reducer(stateWithBun, addIngredient(secondBun))
    ).toEqual({ bun: secondBun, ingredients: [] });
  });

  it('добавляет обычные ингредиенты с уникальными constructorId', (): void => {
    const stateWithIngredients = burgerConstructorSlice.reducer(
      burgerConstructorSlice.reducer(undefined, addIngredient(main)),
      addIngredient(main)
    );
    const [first, second] = stateWithIngredients.ingredients;

    expect(first).toMatchObject(main);
    expect(second).toMatchObject(main);
    expect(first.constructorId).toEqual(expect.any(String));
    expect(second.constructorId).toEqual(expect.any(String));
    expect(first.constructorId.length).toBeGreaterThan(0);
    expect(second.constructorId.length).toBeGreaterThan(0);
    expect(first.constructorId).not.toBe(second.constructorId);
  });

  it('удаляет выбранный ингредиент и очищает конструктор', (): void => {
    const state = [bun, main, sauce].reduce(
      (currentState, ingredient) =>
        burgerConstructorSlice.reducer(currentState, addIngredient(ingredient)),
      burgerConstructorSlice.reducer(undefined, { type: 'unknown' })
    );
    const firstIngredient = state.ingredients[0];

    const stateWithoutFirst = burgerConstructorSlice.reducer(
      state,
      removeIngredient(firstIngredient.constructorId)
    );

    expect(stateWithoutFirst.bun).toEqual(bun);
    expect(stateWithoutFirst.ingredients).toHaveLength(1);
    expect(stateWithoutFirst.ingredients[0]).toMatchObject(sauce);
    expect(
      burgerConstructorSlice.reducer(stateWithoutFirst, clearBurgerConstructor())
    ).toEqual({ bun: null, ingredients: [] });
  });

  it('переставляет ингредиенты и не меняет состояние при неверном индексе', (): void => {
    const first: TConstructorIngredient = { ...main, constructorId: 'first' };
    const second: TConstructorIngredient = { ...sauce, constructorId: 'second' };
    const third: TConstructorIngredient = { ...main, constructorId: 'third' };
    const state = { bun: null, ingredients: [first, second, third] };

    expect(
      burgerConstructorSlice.reducer(state, moveIngredient({ fromIndex: 0, toIndex: 2 }))
    ).toEqual({ bun: null, ingredients: [second, third, first] });
    expect(
      burgerConstructorSlice.reducer(
        state,
        moveIngredient({ fromIndex: 99, toIndex: 0 })
      )
    ).toEqual(state);
  });
});
