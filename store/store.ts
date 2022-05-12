import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistReducer, persistStore } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
// @ts-ignore
import storage from "redux-persist-indexeddb-storage";
import { rtkQueryErrorMiddleware } from "./middlewares";
import { userApi } from "./user/user.api";
import { userSlice } from "./user/user.slice";
import { articleApi } from "./article/article.api";

const reducer = combineReducers({
  [userApi.reducerPath]: userApi.reducer,
  [userSlice.name]: userSlice.reducer,
  [articleApi.reducerPath]: articleApi.reducer,
});

export const store = configureStore({
  reducer: persistReducer(
    {
      key: "redux",
      storage: storage("redux"),
      stateReconciler: autoMergeLevel2,
      debug: true,
    },
    reducer
  ),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      rtkQueryErrorMiddleware,
      userApi.middleware,
      articleApi.middleware,
    ]),
});

setupListeners(store.dispatch);
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export const useTypedDispatch = () => useDispatch<AppDispatch>();
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
