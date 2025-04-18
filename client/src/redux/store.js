import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import authReducer from "../features/auth/authSlice";
import recipeReducer from "../features/recipe/recipeSlice";
import ingredientReducer from "../features/ingredient/ingredientSlice"; // Fixed spelling
import categoryReducer from "../features/category/categorySlice";

import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Uses localStorage
import { combineReducers } from "redux";

// Define persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
};

// Combine reducers
const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  auth: authReducer, // Persisted
  recipe: recipeReducer,
  ingredient: ingredientReducer, // Fixed spelling
  category: categoryReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiSlice.middleware
    ),
  devTools: true, // Enable Redux DevTools
});

// Persistor
export const persistor = persistStore(store);
