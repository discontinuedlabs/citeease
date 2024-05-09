import { useEffect, useState, useCallback } from "react";
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

    console.log(key, value || defaultValue);

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
