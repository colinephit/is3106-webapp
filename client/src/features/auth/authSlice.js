import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null, // Add user details here
  },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.accessToken; // Store token
      state.user = action.payload.user; // Store user details
    },
    logOut: (state) => {
      state.token = null;
      state.user = null; // Clear user details on logout
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentUser = (state) => state.auth.user; // Add selector for user
