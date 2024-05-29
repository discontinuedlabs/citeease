import { useEffect, useState, useCallback } from "react";
import db from "./db";

// IMPORTANT: updateValue function does not accept the syntax "updateValue(prevValue => prevValue + 1)" like the setValue function from useState does
// export function useIndexedDB(key, initialValue = undefined) {
//     const queryClient = useQueryClient();

//     const {
//         data: value,
//         isLoading,
//         error,
//     } = useQuery({
//         queryKey: ["indexedDB", key],
//         queryFn: () => {
//             async function fetchData() {
//                 const item = await db.items.get(key);
//                 return item.value || initialValue;
//             }
//             return fetchData();
//         },
//     });

//     const mutation = useMutation({
//         mutationKey: ["indexedDB", key],
//         mutationFn: (newValue) => {
//             return db.items.put({ id: key, value: newValue });
//         },
//         onSuccess: () => queryClient.invalidateQueries(["indexedDB", key]),
//     });

//     function updateValue(newValue) {
//         mutation.mutate(newValue);
//     }

//     return [value || initialValue, updateValue, isLoading, error];
// }

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
