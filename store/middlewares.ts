import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { MiddlewareAPI, Middleware } from "@reduxjs/toolkit";

export const rtkQueryErrorMiddleware: Middleware =
  ({ dispatch, getState }: MiddlewareAPI) =>
  (next) =>
  (action) => {
    if (isRejectedWithValue(action)) {
      console.log(JSON.stringify(action));
      let message = action.payload.data?.message;
      if (!message) {
        if (action.payload.status) {
          message = action.payload.status.toString();
        } else {
          message = "Unknown Error";
        }
      }
      if (action.payload.status === 401) {
        window.location.pathname = "/login";
      }
    }
    return next(action);
  };
