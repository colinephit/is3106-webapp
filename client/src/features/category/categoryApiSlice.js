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
  }),
});

export const {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useGetAllCategoriesQuery,
} = categoryApiSlice;
