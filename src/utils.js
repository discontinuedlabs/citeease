import { useEffect, useState, useCallback, useRef } from "react";
import Dexie from "dexie";

export const db = new Dexie("CiteEaseDB");
db.version(1).stores({
    items: "++id,name,value",
});

export function useIndexedDB(key, defaultValue) {
    const [value, setValue] = useState(() => {
        async function fetchData() {
            const item = await db.items.get(key);
            if (item) setValue(item.value);
        }
        fetchData();
    });
    useEffect(() => {
        async function saveData() {
            await db.items.put({ id: key, value });
        }
        saveData();
    }, [key, value]);

    return [value || defaultValue, setValue];
}

export function useReducerWithIndexedDB(key, reducer, initialState) {
    const [state, setState] = useIndexedDB(key, initialState);

    const dispatch = useCallback(
        (action) => {
            const newState = reducer(state, action);
            setState(newState);
        },
        [state, setState, reducer]
    );

    return [state, dispatch];
}

export function useLocalStorage(key, defaultValue) {
    const [value, setValue] = useState(() => {
        let currentValue;

        try {
            currentValue = JSON.parse(localStorage.getItem(key)) || defaultValue;
        } catch (error) {
            currentValue = defaultValue;
        }

        return currentValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, key]);

    return [value, setValue];
}

export function useReducerWithLocalStorage(key, reducer, initialState) {
    const [state, setState] = useLocalStorage(key, initialState);

    const dispatch = useCallback(
        (action) => {
            const newState = reducer(state, action);
            setState(newState);
        },
        [state, setState, reducer]
    );

    return [state, dispatch];
}

export function useDocumentTitle(title) {
    useEffect(() => {
        document.title = `${title} - CiteEase`;
    }, [title]);
}

export function timeAgo(dateString) {
    const now = new Date();
    const then = new Date(dateString);

    const diffInSeconds = Math.floor((now - then) / 1000);

    let formattedTime;

    if (diffInSeconds < 60) {
        // Less than a minute
        formattedTime = "just now";
    } else if (diffInSeconds < 3600) {
        // Less than an hour
        formattedTime = `${Math.floor(diffInSeconds / 60)} ${
            Math.floor(diffInSeconds / 60) === 1 ? "mintute" : "minutes"
        } ago`;
    } else if (diffInSeconds < 86400) {
        // Less than 24 hours
        formattedTime = `${Math.floor(diffInSeconds / 3600)} ${
            Math.floor(diffInSeconds / 3600) === 1 ? "hour" : "hours"
        } ago`;
    } else if (diffInSeconds < 604800) {
        // Less than a week
        formattedTime = `${Math.floor(diffInSeconds / 86400)} ${
            Math.floor(diffInSeconds / 86400) === 1 ? "day" : "days"
        } ago`;
    } else if (diffInSeconds < 1209600) {
        // More than a week but less than two weeks
        formattedTime = `${Math.floor(diffInSeconds / 604800)} ${
            Math.floor(diffInSeconds / 604800) === 1 ? "week" : "weeks"
        } ago`;
    } else if (diffInSeconds < 31536000) {
        // More than two weeks but less than a year
        formattedTime = `${then.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    } else {
        // More than a year
        formattedTime = `${then.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
    }

    return formattedTime;
}
