import { configureStore } from "@reduxjs/toolkit";
import bibsReducer from "../store/slices/bibsSlice";
import settingsReducer from "../store/slices/settingsSlice";

const store = configureStore({
    reducer: { bibliographies: bibsReducer, Settings: settingsReducer },
});

export default store;
