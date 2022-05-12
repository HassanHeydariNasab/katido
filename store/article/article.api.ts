import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { REHYDRATE } from "redux-persist";
import type { Article, User } from "@prisma/client";

export const articleApi = createApi({
  reducerPath: "articleApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
  }),
  extractRehydrationInfo(action, { reducerPath }) {
    if (action.type === REHYDRATE && action.payload) {
      return action.payload[reducerPath];
    }
  },
  endpoints: (builder) => ({
    getArticles: builder.query<{ results: Article[] }, void>({
      query: () => ({
        method: "GET",
        url: "/articles",
      }),
    }),
  }),
});

export const { useGetArticlesQuery } = articleApi;
