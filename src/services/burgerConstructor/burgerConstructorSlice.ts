import { createSelector, createSlice, nanoid } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@services/store.ts';
import type { TConstructorIngredient, TIngredient } from '@utils/types.ts';

type TBurgerConstructorState = {
  bun: TIngredient | null;
  ingredients: TConstructorIngredient[];
};

type TMoveIngredientPayload = {
  fromIndex: number;
  toIndex: number;
};

const initialState: TBurgerConstructorState = {
  bun: null,
  ingredients: [],
};

export const burgerConstructorSlice = createSlice({
  initialState,
  name: 'burgerConstructor',
  reducers: {
    addIngredient: {
      prepare: (ingredient: TIngredient) => ({
        payload:
          ingredient.type === 'bun'
            ? ingredient
            : { ...ingredient, constructorId: nanoid() },
      }),
      reducer: (state, action: PayloadAction<TIngredient | TConstructorIngredient>) => {
        if (action.payload.type === 'bun') {
          state.bun = action.payload;
          return;
        }

        state.ingredients.push(action.payload as TConstructorIngredient);
      },
    },
    clearBurgerConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
    },
    moveIngredient: (state, action: PayloadAction<TMoveIngredientPayload>) => {
      const { fromIndex, toIndex } = action.payload;
      const [movedIngredient] = state.ingredients.splice(fromIndex, 1);

      if (movedIngredient) {
        state.ingredients.splice(toIndex, 0, movedIngredient);
      }
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (ingredient) => ingredient.constructorId !== action.payload
      );
    },
  },
});

export const {
  addIngredient,
  clearBurgerConstructor,
  moveIngredient,
  removeIngredient,
} = burgerConstructorSlice.actions;

export const selectBurgerConstructor = (state: RootState): TBurgerConstructorState =>
  state.burgerConstructor;

export const selectConstructorBun = (state: RootState): TIngredient | null =>
  state.burgerConstructor.bun;

export const selectConstructorIngredients = (
  state: RootState
): TConstructorIngredient[] => state.burgerConstructor.ingredients;

export const selectConstructorTotalPrice = createSelector(
  [selectBurgerConstructor],
  ({ bun, ingredients }) =>
    (bun ? bun.price * 2 : 0) +
    ingredients.reduce((sum, ingredient) => sum + ingredient.price, 0)
);

export const selectIngredientCounters = createSelector(
  [selectBurgerConstructor],
  ({ bun, ingredients }) => {
    const counters: Record<string, number> = {};

    ingredients.forEach((ingredient) => {
      counters[ingredient._id] = (counters[ingredient._id] ?? 0) + 1;
    });

    if (bun) {
      counters[bun._id] = 2;
    }

    return counters;
  }
);
