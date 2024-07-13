import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { TAG_COLOR_VALUES } from "../data/store/slices/settingsSlice";
import { Bibliography } from "../types/types.ts";
import { RootState } from "../data/store/store.ts";
import { useAuth } from "../context/AuthContext";

/* eslint-disable indent */

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

type RGBValue = number[];
type HSLValue = [number, number, number, number];

/**
 * Generates a tailwind class for a background gradient based on the input color.
 * It supports converting colors between HEX, RGB, and HSL formats, then creates a gradient effect by slightly increasing the hue of the original color.
 *
 * @param {string} color - The initial color for the gradient, specified in HEX, RGB, or HSL format.
 * @param {"tailwind" | "vanilla"} cssFormat - The format of the generated CSS class. Can be either "tailwind" for Tailwind CSS classes or "vanilla" for plain CSS.
 * @returns {string} A CSS class name that applies a linear gradient from the original color to a slightly altered version of itself.
 */
export function useBgGradient(color: string, cssFormat: "tailwind" | "vanilla" = "tailwind"): string {
    function hexToRgb(hex: string): RGBValue {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

    function rgbToHsla(rgb: RGBValue): HSLValue {
        const [r, g, b] = rgb.map((x) => x / 255);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h;
        let s;
        const l = (max + min) / 2;

        if (max === min) {
            h = 0;
            s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
                default:
                    return [0, 0, 0, 100];
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100, 100];
    }

    function detectColorFormat(value: string): "hex" | "rgb" | "hsla" {
        if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/.test(value)) {
            return "hex";
        }
        if (/^rgb\(/.test(value)) {
            return "rgb";
        }
        if (/^hsla\(/.test(value)) {
            return "hsla";
        }
        throw new Error("Unsupported color format");
    }

    function hslaParse(value: string): HSLValue {
        const match = /^hsla\((\d+),\s*(\d+)%,\s*(\d+)%,\s*(\d+)%\)$/.exec(value);
        if (!match) throw new Error("Invalid HSLA format");
        return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
    }

    function convertColor(value: string): HSLValue {
        let rgbValues;
        const format = detectColorFormat(value);
        switch (format) {
            case "hex":
                return rgbToHsla(hexToRgb(value));
            case "rgb":
                rgbValues = value.match(/\d+/g)!.map((x) => parseInt(x, 10));
                return rgbToHsla(rgbValues);
            case "hsla":
                return hslaParse(value);
            default:
                throw new Error("Unsupported color format");
        }
    }

    function increaseHueByN(hslColor: HSLValue, n: number = 10): HSLValue {
        const [h, s, l, a] = hslColor;
        const newHue = (h - n) % 360;
        return [newHue, s, l, a];
    }

    const hsla = convertColor(color);
    const toColor = increaseHueByN(hsla);
    const tailwind = `bg-gradient-to-b from-[hsla(${Math.floor(hsla[0])},${Math.floor(hsla[1])}%,${Math.floor(hsla[2])}%,${Math.floor(hsla[3])}%)] to-[hsla(${Math.floor(toColor[0])},${Math.floor(toColor[1])}%,${Math.floor(toColor[2])}%,${Math.floor(toColor[3])}%)]`;
    const vanilla = `linear-gradient(to bottom, hsla(${Math.floor(hsla[0])},${Math.floor(hsla[1])}%,${Math.floor(hsla[2])}%,${Math.floor(hsla[3])}%), hsla(${Math.floor(toColor[0])},${Math.floor(toColor[1])}%,${Math.floor(toColor[2])}%,${Math.floor(toColor[3])}%))`;

    return cssFormat === "tailwind" ? tailwind : vanilla;
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
