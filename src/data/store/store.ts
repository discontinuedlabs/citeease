import { configureStore, combineReducers } from "@reduxjs/toolkit";
import bibsReducer from "./slices/bibsSlice";
import settingsReducer from "./slices/settingsSlice";

export const rootReducer = combineReducers({
    bibliographies: bibsReducer,
    settings: settingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

// const debugMiddleware: Middleware<object, RootState> = (storeApi) => (next) => (action) => {
//     const before = storeApi.getState();
//     const result = next(action);
//     const after = storeApi.getState();
//     console.log({ before, action, after });
//     return result;
// };

const store = configureStore({
    reducer: rootReducer,
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(debugMiddleware),
});

export default store;
