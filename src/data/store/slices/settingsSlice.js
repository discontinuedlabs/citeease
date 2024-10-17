import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { doc, setDoc } from "firebase/firestore";
import dexieDB from "../../db/dexie/dexie";
import builtinIcons from "../../../assets/json/icons.json";
import builtinTags from "../../../assets/json/tags.json";
import firestoreDB from "../../db/firebase/firebase";

const initialState = { data: { theme: "auto", tags: builtinTags, icons: builtinIcons }, loadedLocally: false };

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
        addTag: (settings, action) => {
            const newState = { ...settings, tags: [...(settings.tags ? settings.tags : []), action.payload.tag] };
            save(newState);
            return newState;
        },
        deleteTag: (settings, action) => {
            const { id } = action.payload;
            const newState = { ...settings, tags: settings.tags?.filter((tag) => tag.id !== id) };
            save(newState);
            return newState;
        },
        restoreDefaultIcons: (settings) => {
            const newState = {
                ...settings,
                icons: [...settings.icons, ...builtinIcons.filter((icon) => !settings.icons.includes(icon))],
            };
            save(newState);
            return newState;
        },
        addIcon: (settings, action) => {
            const newState = { ...settings, icons: [...settings.icons, action.payload.icon] };
            save(newState);
            return newState;
        },
        deleteIcon: (settings, action) => {
            console.log(action);
            const newState = { ...settings, icons: settings.icons?.filter((icon) => icon !== action.payload.icon) };
            save(newState);
            return newState;
        },
        setTryingToJoinBib: (settings, action) => {
            const newState = { ...settings, tryingToJoinBib: action.payload.bibId };
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

export const { replaceAllSettings, updateSettingsField, restoreDefaultIcons, addIcon, deleteIcon, resetAllSettings } =
    settingsSlice.actions;

export default settingsSlice.reducer;
