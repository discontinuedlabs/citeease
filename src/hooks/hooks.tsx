import { useCallback, useEffect, useRef, useState } from "react";
import { Location, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bibliography } from "../types/types.ts";
import { RootState } from "../data/store/store.ts";
import { useAuth } from "../context/AuthContext";

/* eslint-disable no-unused-vars */

/**
 * Adds an event listener to the specified element, document, or window object.
 *
 * @param {string} eventType - The type of event to listen for (e.g., "click", "mouseover").
 * @param {(event: Event) => void} callback - The callback function to execute when the event occurs.
 * @param {Element | Document | Window} [element=window] - The target element, document, or window to attach the event listener to.
 */
export function useEventListener(
    eventType: string,
    callback: (event: Event) => void,
    element: Element | Document | Window = window
): void {
    const callbackRef = useRef<(event: Event) => void>(() => {});

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!element) return;

        const handler = (e: Event) => callbackRef.current(e);
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

type EnhancedDispatchConfig = {
    includeCurrentUser?: boolean;
};

/**
 * Enhances the Redux dispatch function by automatically including the current user
 * information in dispatched actions, unless overridden by a custom configuration.
 *
 * @param {Object} [config={}] Configuration options for the enhanced dispatch function.
 * @param {boolean} [config.includeCurrentUser=true] Whether to include the current user in dispatched actions.
 * @returns {Function} An enhanced version of the Redux dispatch function.
 */
// FIXME: Fix this hook because it doesnt accept Promises (loadBibs, and loadSettings in this case).
export function useEnhancedDispatch(config: EnhancedDispatchConfig) {
    const dispatch = useDispatch();
    const { currentUser } = useAuth();

    const shouldIncludeCurrentUser = config?.includeCurrentUser ?? true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function enhancedDispatch(action: any) {
        if (typeof action === "function") {
            return dispatch(action());
        }
        const enhancedAction = {
            ...action,
            ...(shouldIncludeCurrentUser && {
                payload: { ...action.payload, currentUser: JSON.stringify(currentUser) },
            }),
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

/**
 * Returns the current device theme ("dark" or "light") based on the system preferences.
 *
 * @param {CallableFunction} [onChangeCallback] - Optional callback function to be executed when the theme changes.
 * @returns {"dark" | "light"} The current device theme.
 *
 * @example
 * // Usage
 * const theme = useDeviceTheme((isDarkMode) => {
 *     console.log(isDarkMode ? "Dark mode is enabled" : "Light mode is enabled");
 * });
 * console.log("Current theme:", theme);
 */
export function useDeviceTheme(onChangeCallback: CallableFunction = () => undefined): "dark" | "light" {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
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
    }, [onChangeCallback]);

    return isDarkMode ? "dark" : "light";
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
export function useMetaThemeColor(initialColor: string): (newColor: string) => void {
    const [color, setColor] = useState<string>(
        initialColor || window.getComputedStyle(document.documentElement).getPropertyValue("background-color")
    );
    const currentDeviceTheme = useDeviceTheme();

    useEffect(() => {
        const metaThemeColor = document.querySelector('meta[name="theme-color"]'); // eslint-disable-line quotes
        if (metaThemeColor) {
            metaThemeColor.setAttribute("content", color);
        }
    }, [color, currentDeviceTheme]);

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
 * @returns {function(callback: () => void, ms?: number): function}
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
export function useTimeout() {
    const savedCallback = useRef<() => void>();

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

type ShortcutAction = (event: KeyboardEvent) => void;
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

/* eslint-disable no-restricted-syntax */
export function useKeyDown() {
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
