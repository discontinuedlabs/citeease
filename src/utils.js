import { useState } from "react";

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        const item = localStorage.getItem(key);
        if (item && item !== "undefined") {
            return JSON.parse(item);
        }
        return initialValue;
    });

    function setValue(value) {
        try {
            setStoredValue(value);
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(error);
        }
    }

    return [storedValue, setValue];
}
