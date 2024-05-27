import { configureStore } from "@reduxjs/toolkit";
import bibliographiesReducer from "./bibliographiesReducer";

const store = configureStore({
    reducer: bibliographiesReducer,
});

export default store;
