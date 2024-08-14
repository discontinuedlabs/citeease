import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import db from "../../db/dexie/dexie";
import builtinIcons from "../../../assets/json/icons.json";

export const TAG_COLORS = {
    YELLOW: "yellow",
    ORANGE: "orange",
    RED: "red",
    PINK: "pink",
    PURPLE: "purple",
    BLUE: "blue",
    CYAN: "cyan",
    GREEN: "green",
    TEAL: "teal",
    GRAY: "gray",
    BROWN: "brown",
};

export const TAG_COLOR_VALUES = {
    [TAG_COLORS.YELLOW]: "rgb(251,176,5)",
    [TAG_COLORS.ORANGE]: "rgb(243,105,68)",
    [TAG_COLORS.RED]: "rgb(223,49,48)",
    [TAG_COLORS.PINK]: "rgb(156,54,181)",
    [TAG_COLORS.PURPLE]: "rgb(104,65,218)",
    [TAG_COLORS.BLUE]: "rgb(19,110,189)",
    [TAG_COLORS.CYAN]: "rgb(19,163,189)",
    [TAG_COLORS.GREEN]: "rgb(13,166,120)",
    [TAG_COLORS.TEAL]: "rgb(13,166,151)",
    [TAG_COLORS.GRAY]: "rgb(127,140,159)",
    [TAG_COLORS.BROWN]: "rgb(173,105,68)",
};

const BUILTIN_TAGS = [
    { label: "Completed", color: TAG_COLORS.GREEN, id: "builtin-completed" },
    { label: "In progress", color: TAG_COLORS.YELLOW, id: "builtin-inProgress" },
    { label: "Pending Review", color: TAG_COLORS.ORANGE, id: "builtin-pendingReview" },
    { label: "High priority", color: TAG_COLORS.RED, id: "builtin-highPriority" },
    { label: "Low priority", color: TAG_COLORS.BLUE, id: "builtin-lowPriority" },
    { label: "Research topic", color: TAG_COLORS.PURPLE, id: "builtin-researchTopic" },
    { label: "Course project", color: TAG_COLORS.CYAN, id: "builtin-courseProject" },
    { label: "Personal project", color: TAG_COLORS.PINK, id: "builtin-personalProject" },
    { label: "Collaborative", color: TAG_COLORS.TEAL, id: "builtin-collaborative" },
    { label: "Archived", color: TAG_COLORS.BROWN, id: "builtin-archived" },
    { label: "Discontinued", color: TAG_COLORS.GRAY, id: "builtin-discontinued" },
];

const initialState = { tags: BUILTIN_TAGS, icons: builtinIcons, tryingToJoinBib: null };

async function saveToIndexedDB(newState) {
    const serializedState = JSON.stringify(newState);
    await db.items.put({ id: "settings", value: serializedState });
}

export const loadFromIndexedDB = createAsyncThunk("settings/loadFromIndexedDB", async () => {
    const loadedSettings = await db.items.get("settings");
    const parsedSettings = await JSON.parse(loadedSettings.value);
    return parsedSettings;
});

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        replaceAllSettings: (settings, action) => {
            if (!action.payload.settings) return settings;
            const newState = action.payload.settings;
            saveToIndexedDB(newState);
            return newState;
        },
        restoreDefaultTags: (settings) => {
            const sTagIds = settings.tags.map((tag) => tag.id);
            const newState = {
                ...settings,
                tags: [
                    ...(settings.tags ? settings.tags : []),
                    ...BUILTIN_TAGS.filter((pTag) => !sTagIds.includes(pTag.id)),
                ],
            };
            saveToIndexedDB(newState);
            return newState;
        },
        addTag: (settings, action) => {
            const newState = { ...settings, tags: [...(settings.tags ? settings.tags : []), action.payload.tag] };
            saveToIndexedDB(newState);
            return newState;
        },
        deleteTag: (settings, action) => {
            const newState = { ...settings, tags: settings.tags?.filter((tag) => tag.id !== action.payload.tagId) };
            saveToIndexedDB(newState);
            return newState;
        },
        restoreDefaultIcons: (settings) => {
            const newState = {
                ...settings,
                icons: [...settings.icons, ...builtinIcons.filter((icon) => !settings.icons.includes(icon))],
            };
            saveToIndexedDB(newState);
            return newState;
        },
        addIcon: (settings, action) => {
            const newState = { ...settings, icons: [...settings.icons, action.payload.icon] };
            saveToIndexedDB(newState);
            return newState;
        },
        deleteIcon: (settings, action) => {
            console.log(action);
            const newState = { ...settings, icons: settings.icons?.filter((icon) => icon !== action.payload.icon) };
            saveToIndexedDB(newState);
            return newState;
        },
        setTryingToJoinBib: (settings, action) => {
            const newState = { ...settings, tryingToJoinBib: action.payload.bibId };
            return newState;
        },
        resetAllSettings: () => {
            saveToIndexedDB(initialState);
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loadFromIndexedDB.fulfilled, (state, action) => {
            return { ...state, ...action?.payload };
        });
    },
});

export const {
    replaceAllSettings,
    restoreDefaultTags,
    addTag,
    deleteTag,
    restoreDefaultIcons,
    addIcon,
    deleteIcon,
    setTryingToJoinBib,
    resetAllSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
