import { apiSlice } from "../../redux/apiSlice";

export const ingredientApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getIngredients: builder.query({
      query: (search) => `/ingredient/search?search=${search}`, // Adjust endpoint accordingly
      providesTags: ["ingredient"],
    }),
    getAllIngredients: builder.query({
      query: () => ({
        url: "/ingredient/list",
        method: "GET",
      }),
      providesTags: ["recipes"],
    }),
    addIngredient: builder.mutation({
      query: (newIngredient) => ({
        url: "/ingredient/create",
        method: "POST",
        body: newIngredient,
      }),
      invalidatesTags: ["ingredient"],
    }),
    deleteIngredient: builder.mutation({
      query: (ingredientId) => ({
        url: `/ingredient/${ingredientId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ingredient"],
    }),
    // updateIngredient: builder.mutation({
    //   query: (args) => {
    //     const { ingredientId, ...ingredientData } = args;
    //     return {
    //       url: `/ingredient/${recipeId}`,
    //       method: "PUT",
    //       body: { ...ingredientData },
    //     };
    //   },
    //   invalidatesTags: ["ingredient"],
    // }),
  }),
});

export const {
  useGetIngredientsQuery,
  useAddIngredientMutation,
  useDeleteIngredientMutation,
  useGetAllIngredientsQuery,
} = ingredientApiSlice;
