import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {}
const userInitialState = {};

export const userSlice = createSlice({
  name: "userSlice",
  initialState: userInitialState,
  reducers: {},
});
