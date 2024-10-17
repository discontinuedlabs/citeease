import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { doc, setDoc } from "firebase/firestore";
import dexieDB from "../../db/dexie/dexie";
import builtinIcons from "../../../assets/json/icons.json";
import builtinTags from "../../../assets/json/tags.json";
import firestoreDB from "../../db/firebase/firebase";
import defaults from "../../../assets/json/defaults.json";

const defaultSettings = defaults.settings;
const initialState = {
    data: { theme: defaultSettings.theme, tags: builtinTags, icons: builtinIcons },
    loadedLocally: false,
};

function save(newState, currentUser = undefined) {
    const serializedSettings = JSON.stringify(newState.data);
    dexieDB.items.put({ id: "settings", value: serializedSettings });

    if (!currentUser) return;

    const parsedCurrentUser = JSON.parse(currentUser);
    if (parsedCurrentUser) {
        const userRef = doc(firestoreDB, "users", parsedCurrentUser?.uid);
        setDoc(userRef, { settings: JSON.stringify(newState.data) });
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
            if (!action.payload.settings) return state;
            const newState = action.payload.settings;
            save(newState);
            return newState;
        },
        updateSettingsField: (state, action) => {
            const { key, value } = action.payload;

            const newSettings = { ...state.data, [key]: value };

            const newState = { ...state, data: newSettings };
            save(newState);
            return newState;
        },
        resetAllSettings: () => {
            save(initialState);
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
