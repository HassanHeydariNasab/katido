import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  token: string | null;
}
const userInitialState = {
  token: null,
};

export const userSlice = createSlice({
  name: "userSlice",
  initialState: userInitialState,
  reducers: {
    setToken(state, action: PayloadAction<{ token: UserState["token"] }>) {
      state.token = action.payload.token;
    },
  },
});
