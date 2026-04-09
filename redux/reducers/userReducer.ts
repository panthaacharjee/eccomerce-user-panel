// userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, UserState } from "../interfaces/userInterface";

const initialState: UserState = {
  isAuthenticated: false,
  status: false,
  loading: false,
  user: null,
  error: null,
  success: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    LoadUserRequest(state) {
      state.loading = true;
      state.isAuthenticated = false;
    },
    LoadUserSuccess(state, action: PayloadAction<User>) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    LoadUserFail(state, action: PayloadAction<string>) {
      state.loading = false;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
  },
});

export const { LoadUserRequest, LoadUserSuccess, LoadUserFail } =
  userSlice.actions;

export default userSlice.reducer;
