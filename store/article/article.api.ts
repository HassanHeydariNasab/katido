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
  tagTypes: ["article", "articleXlf"],
  endpoints: (builder) => ({
    getArticle: builder.query<Article, { id: number }>({
      query: ({ id }) => ({
        method: "GET",
        url: `/articles/${id}`,
      }),
      providesTags: (result, error, { id }) => [{ type: "article", id }],
    }),

    updateArticle: builder.mutation<
      void,
      { id: number; body: Partial<Article> }
    >({
      query: ({ id, body }) => ({
        method: "PATCH",
        url: `/articles/${id}`,
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "article", id }],
    }),

    getArticleXlf: builder.query<{ xlf: string }, { id: number }>({
      query: ({ id }) => ({
        method: "GET",
        url: `/articles/${id}/xlf`,
      }),
      providesTags: (result, error, { id }) => [{ type: "articleXlf", id }],
    }),

    replaceArticleXlf: builder.mutation<
      void,
      { id: number; body: { xlf: string } }
    >({
      query: ({ id, body }) => ({
        method: "PUT",
        url: `/articles/${id}/xlf`,
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "articleXlf", id }],
    }),

    translatePhrase: builder.mutation<
      { tt: string },
      { body: { st: string; from: string; to: string } }
    >({
      query: ({ body }) => ({
        method: "POST",
        url: "/translate",
        body,
      }),
    }),
  }),
});

export const {
  useGetArticleQuery,
  useUpdateArticleMutation,
  useGetArticleXlfQuery,
  useReplaceArticleXlfMutation,
  useTranslatePhraseMutation,
} = articleApi;
