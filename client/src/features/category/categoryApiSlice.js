import { apiSlice } from "../../redux/apiSlice";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: (search) => `/category/search?search=${search}`, // Adjust endpoint accordingly
      providesTags: ["category"],
    }),
    addCategory: builder.mutation({
      query: (newCategory) => ({
        url: "/category/create",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: ["category"],
    }),
    getAllCategories: builder.query({
      query: () => ({
        url: "/category/search",
        method: "GET",
      }),
      providesTags: ["category"],
    }),
    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `/category/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["category"],
    }),
    getCategory: builder.query({
      query: (categoryId) => ({
        url: `/category/${categoryId}`,
        method: "GET",
      }),
      invalidatesTags: ["category"],
    }),
    updateCategory: builder.mutation({
      query: ({ categoryId, categoryName }) => ({
        url: `/category/edit/${categoryId}`,
        method: "PUT",
        body: { categoryName },
      }),
      invalidatesTags: ["category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useGetAllCategoriesQuery,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
  useGetCategoryQuery,
} = categoryApiSlice;
