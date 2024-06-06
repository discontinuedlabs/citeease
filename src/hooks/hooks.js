import { useState, useEffect, useCallback } from "react";
import db from "../db/dexie";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { TAG_COLOR_VALUES } from "../store/slices/settingsSlice";

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

export function useReducerWithIndexedDB(key, reducer, initialValue = undefined) {
    const [state, updateState, isLoading, error] = useIndexedDB(key, initialValue);

    const dispatch = useCallback(
        (action) => {
            updateState(reducer(state, action));
        },
        [state, updateState, reducer]
    );

    return [state, dispatch, isLoading, error];
}

export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        let currentValue;

        try {
            currentValue = JSON.parse(localStorage.getItem(key)) || initialValue;
        } catch (error) {
            currentValue = initialValue;
        }

        return currentValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, key]);

    return [value, setValue];
}

export function useReducerWithLocalStorage(key, reducer, initialValue) {
    const [state, setState] = useLocalStorage(key, initialValue);

    const dispatch = useCallback(
        (action) => {
            const newState = reducer(state, action);
            setState(newState);
        },
        [state, setState, reducer]
    );

    return [state, dispatch];
}

export function useFindBib() {
    const { bibId: bibliographyId } = useParams();
    const bibliographies = useSelector((state) => state.bibliographies);
    const bibliography = bibliographies?.find((bib) => bib.id === bibliographyId);
    return bibliography;
}

export function useFindCheckedCitations() {
    const bibliography = useFindBib();
    return bibliography?.citations.filter((cit) => cit?.isChecked);
}

export function useTagBgColor(color) {
    const TAG_BG_IDLE_TRANSPARENCY = 0.2;
    const TAG_BG_HOVER_TRANSPARENCY = 0.3;
    const TAG_BG_CLICK_TRANSPARENCY = 0.4;

    const idle = `rgba(${TAG_COLOR_VALUES[color]?.slice(4, -1)}, ${TAG_BG_IDLE_TRANSPARENCY})`;
    const hover = `rgba(${TAG_COLOR_VALUES[color]?.slice(4, -1)}, ${TAG_BG_HOVER_TRANSPARENCY})`;
    const click = `rgba(${TAG_COLOR_VALUES[color]?.slice(4, -1)}, ${TAG_BG_CLICK_TRANSPARENCY})`;

    return [idle, hover, click];
}
