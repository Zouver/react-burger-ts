import { createSlice } from '@reduxjs/toolkit';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@services/store.ts';
import type { TIngredient } from '@utils/types.ts';

type TIngredientDetailsState = {
  selectedIngredient: TIngredient | null;
};

const initialState: TIngredientDetailsState = {
  selectedIngredient: null,
};

export const ingredientDetailsSlice = createSlice({
  initialState,
  name: 'ingredientDetails',
  reducers: {
    clearSelectedIngredient: (state) => {
      state.selectedIngredient = null;
    },
    setSelectedIngredient: (state, action: PayloadAction<TIngredient>) => {
      state.selectedIngredient = action.payload;
    },
  },
});

export const { clearSelectedIngredient, setSelectedIngredient } =
  ingredientDetailsSlice.actions;

export const selectSelectedIngredient = (state: RootState): TIngredient | null =>
  state.ingredientDetails.selectedIngredient;
