import { createSlice } from "@reduxjs/toolkit";

const ingredientSlice = createSlice({
  name: "ingredient",
  initialState: {
    ingredients: null,
  },
  reducers: {
    setIngredients: (state, action) => {
      state.ingredients = action.payload;
    },
  },
});

export const { setIngredients } = ingredientSlice.actions;
export default ingredientSlice.reducer;

export const selectCurrentIngredients = (state) => state.ingredient.ingredients;
