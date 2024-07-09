import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TAG_COLOR_VALUES } from "../data/store/slices/settingsSlice";
import { Bibliography, Citation } from "../types/types.ts";
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
    const bibliographies = useSelector((state: RootState) => state.bibliographies);
    const bibliography = bibliographies?.find((bib) => bib.id === bibId || bib?.collab?.id === bibId);
    return bibliography;
}

/**
 * Filters checked citations from the current bibliography, which can be identified based on the URL params.
 *
 * @returns {Citation[] | undefined} Checked citations from the specified bibliography or undefined if not found.
 */
export function useFindCheckedCitations(): Citation[] | undefined {
    const bibliography = useFindBib();
    return bibliography?.citations.filter((cit: Citation) => cit.isChecked);
}

/**
 * Calculates background colors for tags based on hover and click states.
 *
 * @param {Object} [options={}] Options for calculating tag background colors.
 * @param {string} options.color - The base color for the tag.
 * @param {number} [options.idleTransparency=0.2] Transparency level for the idle state.
 * @param {number} [options.hoverTransparency=0.3] Transparency level for the hover state.
 * @param {number} [options.clickTransparency=0.4] Transparency level for the click state.
 * @returns {[string, string, string]} Background colors for idle, hover, and click states.
 */
export function useTagBgColor(
    color: string,
    {
        idleTransparency = 0.2,
        hoverTransparency = 0.3,
        clickTransparency = 0.4,
    }: {
        idleTransparency?: number;
        hoverTransparency?: number;
        clickTransparency?: number;
    } = {}
): [string, string, string] {
    const idle = `rgba(${TAG_COLOR_VALUES[color]?.slice(4, -1)}, ${idleTransparency})`;
    const hover = `rgba(${TAG_COLOR_VALUES[color]?.slice(4, -1)}, ${hoverTransparency})`;
    const click = `rgba(${TAG_COLOR_VALUES[color]?.slice(4, -1)}, ${clickTransparency})`;

    return [idle, hover, click];
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
 * Generates a dynamic title for the page based on the content of an <h1> tag,
 * appending a customizable prefix and suffix, and falls back to a customizable default title if no <h1> tag is found.
 */
export function useDynamicTitle(
    prefix: string = "",
    suffix: string = " - CiteEase",
    fallback: string = "CiteEase"
): string {
    const [title, setTitle] = useState<string>(fallback);
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
