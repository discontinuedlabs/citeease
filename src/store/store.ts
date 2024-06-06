import { configureStore, combineReducers } from "@reduxjs/toolkit";
import bibsReducer from "./slices/bibsSlice";
import settingsReducer from "./slices/settingsSlice";

export const rootReducer = combineReducers({
    bibliographies: bibsReducer,
    settings: settingsReducer,
});

const store = configureStore({
    reducer: rootReducer,
});

export default store;
export type RootState = ReturnType<typeof rootReducer>;
