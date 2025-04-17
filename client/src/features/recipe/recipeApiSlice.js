import { apiSlice } from "../../redux/apiSlice";

export const recipeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecipe: builder.query({
      query: (recipeId) => `/recipes/${recipeId}`,
      providesTags: ["recipes"],
    }),
    getRecipes: builder.query({
      query: (filter) => ({
        url: "/recipes/list",
        method: "POST",
        body: { ...filter },
      }),
      providesTags: ["recipes"],
    }),
    getFavoriteRecipes: builder.query({
      query: (filter) => ({
        url: "/recipes/favoriteList",
        method: "POST",
        body: { ...filter },
      }),
      providesTags: ["recipes"],
    }),
    getMyRecipes: builder.query({
      query: () => ({
        url: "/recipes/ownList",
        method: "GET",
      }),
      providesTags: ["recipes"],
    }),
    searchRecipesByIngredients: builder.query({
      query: (ingredients) => {
        const params = new URLSearchParams();
        ingredients.forEach((ingredient) =>
          params.append("ingredients", ingredient)
        );
        return `/recipes/search?${params.toString()}`;
      },
      providesTags: ["recipes"],
    }),
    getAllRecipes: builder.query({
      query: () => ({
        url: "/recipes/list",
        method: "POST",
        body: { status: "ALL" },
      }),
      providesTags: ["recipes"],
    }),
    addRecipe: builder.mutation({
      query: (recipeData) => ({
        url: "/recipes/create",
        method: "POST",
        body: { ...recipeData },
      }),
      invalidatesTags: ["recipes"],
    }),
    updateRecipe: builder.mutation({
      query: (args) => {
        const { recipeId, ...recipeData } = args;
        return {
          url: `/recipes/${recipeId}`,
          method: "PUT",
          body: { ...recipeData },
        };
      },
      invalidatesTags: ["recipes"],
    }),
    rateRecipe: builder.mutation({
      query: (args) => {
        const { recipeId, rating } = args;
        return {
          url: `/recipes/rate/${recipeId}`,
          method: "PUT",
          body: { rating },
        };
      },
      invalidatesTags: ["recipes"],
    }),
    deleteRecipe: builder.mutation({
      query: (recipeId) => ({
        url: `/recipes/${recipeId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, recipeId) => [
        { type: "recipe", id: recipeId }, // Invalidate specific recipe cache after deletion
        "recipes", // Optionally invalidate the list of recipes
      ],
    }),
    publishDraftRecipe: builder.mutation({
      query: ({ recipeId }) => ({
        url: `/recipes/${recipeId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["recipes"],
    }),
    commentRecipe: builder.mutation({
      query: (args) => {
        const { recipeId, comment } = args;
        return {
          url: `/recipes/comment/${recipeId}`,
          method: "PUT",
          body: { comment },
        };
      },
      invalidatesTags: ["recipes"],
    }),
    flagRecipe: builder.mutation({
      query: (args) => {
        const { recipeId, message } = args;
        return {
          url: `/recipes/flag/${recipeId}`,
          method: "PUT",
          body: { message },
        };
      },
      invalidatesTags: ["recipes"],
    }),
    deleteCommentRecipe: builder.mutation({
      query: (args) => {
        const { _id, commentId } = args;
        console.log(
          "deleting comment id: " + commentId + ", for recipe: " + _id
        );
        return {
          url: `/recipes/comment/${_id}/${commentId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["recipes"],
    }),
    deleteFlagRecipe: builder.mutation({
      query: (args) => {
        const { _id, flagId } = args;
        console.log("deleting flag id: " + flagId + ", for recipe: " + _id);
        return {
          url: `/recipes/flag/${_id}/${flagId}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["recipes"],
    }),
    toggleFavorite: builder.mutation({
      query: ({ recipeId }) => {
        return {
          url: `/recipes/favorite/${recipeId}`,
          method: "PUT",
        };
      },
      invalidatesTags: ["recipes"],
    }),
  }),
});

export const {
  useGetRecipeQuery,
  useGetRecipesQuery,
  useGetMyRecipesQuery,
  useGetAllRecipesQuery,
  useSearchRecipesByIngredientsQuery,
  useAddRecipeMutation,
  useUpdateRecipeMutation,
  useRateRecipeMutation,
  useDeleteRecipeMutation,
  usePublishDraftRecipeMutation,
  useCommentRecipeMutation,
  useDeleteCommentRecipeMutation,
  useToggleFavoriteMutation,
  useGetFavoriteRecipesQuery,
  useFlagRecipeMutation,
  useDeleteFlagRecipeMutation,
} = recipeApiSlice;
