import { configureStore } from "@reduxjs/toolkit";
import bibsReducer from "./components/slices/bibsSlice";

const store = configureStore({
    reducer: { bibliographies: bibsReducer },
});

export default store;
