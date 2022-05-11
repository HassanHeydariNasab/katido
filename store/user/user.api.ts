import { User } from "@prisma/client";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { REHYDRATE } from "redux-persist";
import { RootState } from "store/store";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    prepareHeaders(headers, { getState }) {
      if (headers.get("Authorization") === "placeholder") {
        const { token } = (getState() as RootState).userSlice;
        headers.set("Authorization", token);
      }
      return headers;
    },
  }),
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE) {
      return action.payload[reducerPath];
    }
  },
  endpoints: (builder) => ({
    requestOtp: builder.mutation<
      { isUserExists: boolean },
      { body: { email: string } }
    >({
      query: ({ body }) => ({
        method: "POST",
        url: "/request-otp",
        body,
      }),
    }),
    verifyOtp: builder.mutation<
      { token: string },
      { body: { otp: string; email: string; name?: string } }
    >({
      query: ({ body }) => ({
        method: "POST",
        url: "/verify-otp",
        body,
      }),
    }),
    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: "/current-user",
        headers: [["Authorization", "placeholder"]],
      }),
    }),
  }),
});

export const {
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useGetCurrentUserQuery,
} = userApi;
