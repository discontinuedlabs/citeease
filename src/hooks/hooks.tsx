import React, { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { User } from "firebase/auth";
import { Location, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { doc, onSnapshot } from "firebase/firestore";
import { Bibliography } from "../types/types.ts";
import { RootState } from "../data/store/store.ts";
import { useAuth } from "../context/AuthContext";
import retrieveUserData from "../utils/dataUtils.ts";
import { deleteBib, mergeWithCurrentBibs, replaceAllBibs } from "../data/store/slices/bibsSlice";
import { replaceAllSettings } from "../data/store/slices/settingsSlice";
import db from "../data/db/firebase/firebase";

/**
 * Custom hook to synchronize user data including bibliographies and settings.
 */
export function useUserDataSync(): void {
    const { loadedLocally: bibsLoaded } = useSelector((state: RootState) => state.bibliographies);
    const { currentUser }: { currentUser: User } = useAuth();
    const dispatch = useDispatch();

    const getCollaborativeBibIds = useCallback((bibs: Bibliography[]): string[] => {
        return bibs.filter((bib) => bib?.collab?.open).map((bib) => bib.collab!.id);
    }, []);

    useEffect(() => {
        if (!currentUser || !bibsLoaded) return;

        // Synchronizes user data (bibliographies and settings) and sets up real-time updates for collaborative bibliographies.
        async function syncUserData() {
            try {
                const { bibliographies, settings } = await retrieveUserData(currentUser);

                if (bibliographies) {
                    dispatch(replaceAllBibs({ bibs: bibliographies }));
                }
                if (settings) {
                    dispatch(replaceAllSettings({ settings }));
                }

                const coBibsIds = getCollaborativeBibIds(bibliographies || []);

                const unsubscribeList = coBibsIds.map((id) => {
                    return onSnapshot(doc(db, "coBibs", id), (sDoc) => {
                        if (sDoc.exists()) {
                            const parsedCoBib = JSON.parse(sDoc.data().bibliography);
                            const isCollaborator = parsedCoBib?.collab?.collaborators?.some(
                                (co) => co.id === currentUser.uid
                            );

                            if (!isCollaborator) {
                                // Remove the bib if the user was removed as a collaborator
                                dispatch(deleteBib({ bibliographyId: parsedCoBib.id }));
                            } else {
                                // Merge updated bibliography data
                                dispatch(mergeWithCurrentBibs({ bibs: [parsedCoBib] }));
                            }
                        }
                    });
                });

                return () => unsubscribeList.forEach((unsubscribe) => unsubscribe());
            } catch (error) {
                console.error("Error retrieving user data or setting up snapshots: ", error);
                return undefined;
            }
        }

        if (bibsLoaded) {
            syncUserData();
        }
    }, [currentUser, bibsLoaded, dispatch, getCollaborativeBibIds]);
}

/**
 * Custom hook for managing storage (localStorage or sessionStorage).
 *
 * @template T
 * @param {string} key - The key under which the value is stored.
 * @param {T | (() => T)} defaultValue - The default value or a function to return the default value if nothing is in storage.
 * @param {Storage} storageObject - The storage object (localStorage or sessionStorage).
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>, () => void]} A tuple containing the stored value, a setter for the value, and a function to remove the item from storage.
 */
function useStorage<T>(
    key: string,
    defaultValue: T | (() => T),
    storageObject: Storage
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
    const [value, setValue] = useState<T>(() => {
        const jsonValue = storageObject.getItem(key);
        if (jsonValue != null) return JSON.parse(jsonValue) as T;

        if (typeof defaultValue === "function") {
            return (defaultValue as () => T)();
        }
        return defaultValue;
    });

    useEffect(() => {
        if (value === undefined) {
            storageObject.removeItem(key);
        } else {
            storageObject.setItem(key, JSON.stringify(value));
        }
    }, [key, value, storageObject]);

    const remove = useCallback(() => {
        setValue(undefined as unknown as T);
    }, []);

    return [value, setValue, remove];
}

/**
 * Custom hook for using localStorage in a React component.
 *
 * @template T
 * @param {string} key - The key under which the value is stored in localStorage.
 * @param {T | (() => T)} defaultValue - The default value or a function to return the default value if nothing is in localStorage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>, () => void]} A tuple containing the stored value, a setter for the value, and a function to remove the item from localStorage.
 */
export function useLocalStorage<T>(
    key: string,
    defaultValue: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
    return useStorage(key, defaultValue, window.localStorage);
}

/**
 * Custom hook for using sessionStorage in a React component.
 *
 * @template T
 * @param {string} key - The key under which the value is stored in sessionStorage.
 * @param {T | (() => T)} defaultValue - The default value or a function to return the default value if nothing is in sessionStorage.
 * @returns {[T, React.Dispatch<React.SetStateAction<T>>, () => void]} A tuple containing the stored value, a setter for the value, and a function to remove the item from sessionStorage.
 */
export function useSessionStorage<T>(
    key: string,
    defaultValue: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
    return useStorage(key, defaultValue, window.sessionStorage);
}

/**
 * Adds an event listener to the specified element, document, or window object.
 *
 * @param {string} eventType - The type of event to listen for (e.g., "click", "mouseover").
 * @param {(event: Event) => void} callback - The callback function to execute when the event occurs.
 * @param {Element | Document | Window} [element=window] - The target element, document, or window to attach the event listener to.
 */
export function useEventListener(
    eventType: string,
    callback: (event: Event) => void, // eslint-disable-line no-unused-vars
    element: Element | Document | Window = window
): void {
    const callbackRef = useRef<(event: Event) => void>(() => {}); // eslint-disable-line no-unused-vars

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!element) return;

        const handler = (event: Event) => callbackRef.current(event);
        element.addEventListener(eventType, handler, false);
    }, [eventType, element, callbackRef.current]);
}

type RouteParams = {
    bibId?: string;
};

/**
 * Finds a based on the URL params
 *
 * @param {RouteParams} params - Object containing the ID of the bibliography entry to find.
 * @param {string} [params.bibId] - The ID of the bibliography entry to find.
 * @returns {Bibliography | null} The found bibliography entry or undefined if not found.
 */
export function useFindBib(): Bibliography | null {
    let { bibId }: RouteParams = useParams<RouteParams>();
    const location: Location = useLocation();

    if (!bibId) {
        bibId = location.pathname.match(/\/(bib|collab)\/([^/]+)/)?.[2];
    }

    const bibliographies: Bibliography[] = useSelector((state: RootState) => state.bibliographies.data);
    const bibliography = bibliographies?.find((bib) => bib.id === bibId || bib?.collab?.id === bibId);
    return bibliography ? bibliography : null; // eslint-disable-line no-unneeded-ternary
}

/**
 * Enhances the Redux dispatch function by automatically including the current user
 * information and bibliography ID in dispatched actions.
 */
// FIXME: Fix this hook because it doesnt accept Promises (loadBibs, and loadSettings in this case).
export function useEnhancedDispatch() {
    const dispatch = useDispatch();
    const { currentUser } = useAuth();
    const { bibId } = useParams();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function enhancedDispatch(action: any) {
        if (typeof action === "function") {
            return dispatch(action());
        }
        const enhancedAction = {
            ...action,
            payload: { bibId, currentUser: JSON.stringify(currentUser), ...action.payload },
        };
        return dispatch(enhancedAction);
    }

    return enhancedDispatch;
}

/**
 * Dynamically sets the page title based on an H1 element content,
 * appending a prefix and suffix, and falls back to a default title.
 *
 * @param {string} prefix - Optional prefix to prepend to the title.
 * @param {string} suffix - Optional suffix to append to the title.
 * @param {string} fallback - Default title to use if no H1 element is found.
 * @returns {string} The dynamically generated title.
 */
export function useDocumentTitle(
    prefix: string = "",
    suffix: string = " - CiteEase",
    fallback: string = "CiteEase"
): string {
    const [title, setTitle] = useState(fallback);
    const location = useLocation();

    useEffect(() => {
        const h1Element = document.querySelector("h1");
        const newTitle = h1Element ? `${prefix}${h1Element.textContent}${suffix}` : fallback;
        setTitle(newTitle);
    }, [location.pathname, prefix, suffix, fallback]);

    useEffect(() => {
        document.title = title;
    }, [title]);

    return title;
}

type ThemeType = "auto" | "light" | "dark";

/**
 * A custom hook to manage theme mode (light or dark) and respond to system preferences.
 *
 * @param {CallableFunction} [onChangeCallback=() => undefined] - A callback function that will be triggered when the theme changes.
 *
 * @returns {["light" | "dark", Dispatch<SetStateAction<ThemeType>>]} - Returns an array where the first element is the current theme ("light" or "dark") and the second element is a function to set the theme.
 */
// WATCH: How does this hook changes the theme color even if it's not used in App component?
export function useTheme(
    onChangeCallback: CallableFunction = () => undefined
): ["light" | "dark", Dispatch<SetStateAction<ThemeType>>] {
    const [theme, setTheme] = useLocalStorage<ThemeType>("theme", () => {
        const currentClass = document.documentElement.className;
        const modeMatch = currentClass.match(/^(light|dark|auto)-mode/);

        if (modeMatch) return modeMatch[1] as ThemeType;
        return "auto";
    });
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        document.documentElement.classList.remove("light-mode", "dark-mode", "auto-mode");
        document.documentElement.classList.add(`${theme}-mode`);
    }, [theme]);

    useEffect(() => {
        if (theme !== "auto") {
            setIsDarkMode(theme === "dark");
            onChangeCallback(theme === "dark");
        } else {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

            const handleChange = () => {
                setIsDarkMode(mediaQuery.matches);
                onChangeCallback(mediaQuery.matches);
            };

            handleChange();

            mediaQuery.addEventListener("change", handleChange);

            return () => {
                mediaQuery.removeEventListener("change", handleChange);
            };
        }
        return undefined;
    }, [onChangeCallback, theme]);

    return [isDarkMode ? "dark" : "light", setTheme];
}

/**
 * Updates the theme color of the application dynamically based on a given color.
 * It initializes with either a provided color or the current background color of the document.
 * Subsequent calls allow updating the theme color to a new value.
 *
 * @param {string} initialColor - The initial color value to set the theme color to. If not provided,
 *                                it attempts to read the background color of the document root element.
 * @returns {(newColor: string) => void} - A function that accepts a new color string and updates the theme color.
 */
// FIXME: It doesn't update the color when the theme changes.
// eslint-disable-next-line no-unused-vars
export function useMetaThemeColor(initialColor: string): (newColor: string) => void {
    const [color, setColor] = useState<string>(
        initialColor || window.getComputedStyle(document.documentElement).getPropertyValue("background-color")
    );
    const [currentTheme] = useTheme();

    useEffect(() => {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]'); // eslint-disable-line quotes
        if (metaThemeColor) {
            metaThemeColor.setAttribute("content", color);
        }
    }, [color, currentTheme]);

    return (newColor) => setColor(newColor);
}

/**
 * Tracks the online status of the application using the navigator.onLine property to determine
 * the online status and updates it whenever the network status changes.
 *
 * @returns {boolean} The current online status of the application.
 */
export function useOnlineStatus(): boolean {
    const [online, setOnline] = useState<boolean>(navigator.onLine);

    useEventListener("online", () => setOnline(navigator.onLine));
    useEventListener("offline", () => setOnline(navigator.onLine));

    return online;
}

/**
 * Returns a function to set a timeout with a specified callback and delay.
 *
 * The returned function allows you to execute a callback function after a specified delay.
 *
 * @returns {(callback: () => void, ms: number) => () => void}
 *   A function that takes a callback to execute after a delay and an optional delay time in milliseconds.
 *   The returned function can be called to set the timeout.
 *
 * @example
 * const timeout = useTimeout();
 *
 * function handleClick() {
 *     timeout(() => {
 *         console.log('This runs after 1 second');
 *     }, 1000);
 * }
 *
 * return (
 *     <button onClick={handleClick}>Click me</button>
 * );
 */
// eslint-disable-next-line no-unused-vars
export function useTimeout(): (callback: () => void, ms: number) => () => void {
    const savedCallback = useRef<(() => void) | undefined>(undefined);

    const setTimeoutCallback = (callback: () => void, ms: number = 3000) => {
        savedCallback.current = callback;

        const functionId = setTimeout(() => {
            if (savedCallback.current) {
                savedCallback.current();
            }
        }, ms);

        return () => clearTimeout(functionId);
    };

    return setTimeoutCallback;
}

type ShortcutAction = (event: KeyboardEvent) => void; // eslint-disable-line no-unused-vars
type OptionalConfig = Pick<KeyboardEvent, "altKey" | "ctrlKey" | "shiftKey">;
interface ShortcutConfig extends Partial<OptionalConfig> {
    code: KeyboardEvent["code"];
    shortcutTarget?: HTMLElement;
}

export function useKeyboardShortcuts(keymap: Record<string, ShortcutAction>) {
    const targetElements = Array.from(document.querySelectorAll("body"));

    const registerShortcuts = useCallback(() => {
        targetElements.forEach((target) => {
            Object.entries(keymap).forEach(([key, action]) => {
                const modifier = key.split(/\||\+/)[0];
                let keyCode: KeyboardEvent["code"] | undefined;
                let ctrlKey = false;
                let altKey = false;
                let shiftKey = false;

                if (modifier === "ctrl") {
                    ctrlKey = true;
                    keyCode = "Control";
                } else if (modifier === "alt") {
                    altKey = true;
                    keyCode = "Alt";
                } else if (modifier === "shift") {
                    shiftKey = true;
                    keyCode = "Shift";
                }

                if (!keyCode) {
                    throw new Error(`Invalid key configuration: ${key}`);
                }

                const config: ShortcutConfig = {
                    code: keyCode,
                    ctrlKey,
                    altKey,
                    shiftKey,
                    shortcutTarget: target,
                };

                target.addEventListener("keydown", (event: KeyboardEvent) => {
                    if (!config.code || !config.ctrlKey || !config.altKey || !config.shiftKey) {
                        return;
                    }
                    if (
                        (config.ctrlKey && !event.ctrlKey) ||
                        (config.altKey && !event.altKey) ||
                        (config.shiftKey && !event.shiftKey)
                    ) {
                        return;
                    }
                    action(event);
                });
            });
        });
    }, [keymap]);

    useEffect(registerShortcuts, [registerShortcuts]);
}

/* eslint-disable no-restricted-syntax */
export function useKeyDown() {
    const keyMap = {
        enter: "Enter",
        ctrl: "Control",
        meta: "Meta",
        shift: "Shift",
        alt: "Alt",
        tab: "Tab",
        escape: "Escape",
    };

    function parseKeyCombination(keyCombination) {
        const keys = keyCombination.split("+").map((key) => keyMap[key.toLowerCase()] || key);
        return new Set(keys);
    }

    return useCallback(
        (keyActions) => (event) => {
            for (const [keyCombination, callback] of keyActions) {
                const keySet = parseKeyCombination(keyCombination);

                const isMatch = Array.from(keySet).every((key) => {
                    if (key === "Control" && event.ctrlKey) return true;
                    if (key === "Meta" && event.metaKey) return true;
                    if (key === "Shift" && event.shiftKey) return true;
                    if (key === "Alt" && event.altKey) return true;
                    return event.key === key;
                });

                if (isMatch) {
                    event.preventDefault();
                    callback();
                    break;
                }
            }
        },
        []
    );
}
