import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bibliography } from "../types/types.ts";
import { RootState } from "../data/store/store.ts";
import { useAuth } from "../context/AuthContext";

type RouteParams = {
    bibId?: string;
};

/**
 * Finds a based on the URL params
 *
 * @param {RouteParams} params - Object containing the ID of the bibliography entry to find.
 * @param {string} [params.bibId] - The ID of the bibliography entry to find.
 * @returns {Bibliography | undefined} The found bibliography entry or undefined if not found.
 */
export function useFindBib(): Bibliography | undefined {
    const { bibId }: RouteParams = useParams<RouteParams>();
    const bibliographies: Bibliography[] = useSelector((state: RootState) => state.bibliographies.data);
    const bibliography = bibliographies?.find((bib) => bib.id === bibId || bib?.collab?.id === bibId);
    return bibliography;
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
export function useDynamicTitle(
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

export function useTimeout(callback: () => void, ms: number = 3000) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        const functionId = setTimeout(() => savedCallback.current(), ms);
        return () => clearTimeout(functionId);
    }, []);
}

// eslint-disable-next-line no-unused-vars
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
