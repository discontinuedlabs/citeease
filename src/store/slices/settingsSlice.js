import { createSlice } from "@reduxjs/toolkit";
import db from "../../db/dexie";

const initialState = {};

function saveToIndexedDB(newState) {
    const serializedState = JSON.stringify(newState);
    db.items.put({ id: "settings", value: serializedState });
}

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        changeSettings: (settings, action) => {
            const newState = settings;
            saveToIndexedDB(newState);
            return newState;
        },
    },
});

export const { changeSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
