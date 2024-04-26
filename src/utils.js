import { useEffect, useState, useCallback } from "react";

export function useLocalStorage(key, defaultValue) {
    const [value, setValue] = useState(() => {
        let currentValue;

        try {
            currentValue = JSON.parse(localStorage.getItem(key)) || String(defaultValue);
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
