import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
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
  }),
});

export const { useRequestOtpMutation, useVerifyOtpMutation } = userApi;
