import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logOut } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_SERVER_BASE_URL,
  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.originalStatus === 403) {
    const refreshResult = await baseQuery("/auth/refresh", api, extraOptions);

    if (refreshResult?.data) {
      api.dispatch(setCredentials({ ...refreshResult.data }));

      result = await baseQuery(args, api, extraOptions);
    } else {
      const navigate = useNavigate();
      if (refreshResult?.error?.status === 403) {
        api.dispatch(logOut()); // Dispatch logout if refresh fails
        refreshResult.error.data.message = "Your login has expired.";
        navigate("/login");
        return refreshResult;
      }
      return refreshResult;
    }
  }
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({}),
});
