import { apiSlice } from "../../redux/apiSlice";

export const recipeApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRecipe: builder.query({
            query: (recipeId) => `/recipes/${recipeId}`,
            providesTags: ["recipes"],
        }),
        getRecipes: builder.query({
            query: () => ({
                url: "/recipes/list",
                method: "POST",
                body: { status: "Published" },
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
            invalidatesTags: ["recipes"],
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
        deleteCommentRecipe: builder.mutation({
            query: (args) => {
                const { recipeId, commentId } = args;
                console.log(
                    "deleting comment id: " + commentId + ", for recipe: " + recipeId
                );
                return {
                    url: `/recipes/comment/${recipeId}/${commentId}`,
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
    useAddRecipeMutation,
    useUpdateRecipeMutation,
    useRateRecipeMutation,
    useDeleteRecipeMutation,
    usePublishDraftRecipeMutation,
    useCommentRecipeMutation,
    useDeleteCommentRecipeMutation,
    useToggleFavoriteMutation,
} = recipeApiSlice;
