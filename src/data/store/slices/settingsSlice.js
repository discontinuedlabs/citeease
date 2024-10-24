import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { doc, setDoc } from "firebase/firestore";
import dexieDB from "../../db/dexie/dexie";
import firestoreDB from "../../db/firebase/firebase";
import defaults from "../../../assets/json/defaults.json";

const initialState = {
    data: defaults.settings,
    loadedLocally: false,
};

async function save(newState, currentUser = undefined) {
    const serializedSettings = JSON.stringify(newState.data);
    await dexieDB.items.put({ id: "settings", value: serializedSettings });
    const bibs = await dexieDB.items.get("bibliographies");

    if (!currentUser) return;

    const parsedCurrentUser = JSON.parse(currentUser);
    if (parsedCurrentUser) {
        const userRef = doc(firestoreDB, "users", parsedCurrentUser?.uid);
        setDoc(userRef, { bibliographies: bibs.value, settings: JSON.stringify(newState.data) });
    }
}

export const loadFromIndexedDB = createAsyncThunk("settings/loadFromIndexedDB", async () => {
    const loadedSettings = await dexieDB.items.get("settings");
    const parsedSettings = await JSON.parse(loadedSettings.value);
    return parsedSettings;
});

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        replaceAllSettings: (state, action) => {
            const { settings, currentUser } = action.payload;

            const newState = { ...state, data: { ...state.data, ...settings } };
            save(newState, currentUser);
            return newState;
        },
        updateSettingsField: (state, action) => {
            const { key, value, currentUser } = action.payload;

            const newSettings = { ...state.data, [key]: value };

            const newState = { ...state, data: newSettings };
            save(newState, currentUser);
            return newState;
        },
        resetAllSettings: (_, action) => {
            const { currentUser } = action.payload;
            save(initialState, currentUser);
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loadFromIndexedDB.fulfilled, (state, action) => {
            return { ...state, data: { ...state.data, ...action?.payload }, loadedLocally: true };
        });
    },
});

export const { replaceAllSettings, updateSettingsField, resetAllSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
