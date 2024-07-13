/* eslint-disable indent */

import { TAG_COLOR_VALUES } from "../data/store/slices/settingsSlice";

type RGBValue = number[];
type HSLValue = [number, number, number, number];

/**
 * Generates a gradient background CSS string based on the provided color.
 * @param {string} color - The input color in hex, rgb, rgba, hsl, or hsla format.
 * @param {"tailwind" | "vanilla"} [cssFormat="vanilla"] - The CSS format for the gradient ("tailwind" or "vanilla").
 * @returns {string} The gradient background CSS string.
 * @throws {Error} If the color format is unsupported.
 */
export function getGradient(color: string, cssFormat: "tailwind" | "vanilla" = "vanilla"): string {
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
                    return [0, 0, 0, 1];
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100, 100];
    }

    function rgbaToHsla(rgba: RGBValue): HSLValue {
        const [r, g, b] = rgba.map((x) => x / 255);
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
                    return [0, 0, 0, 1];
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100, rgba[3] * 100];
    }

    function detectColorFormat(value: string): "hex" | "rgb" | "rgba" | "hsl" | "hsla" {
        if (/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/.test(value)) {
            return "hex";
        }
        if (/^rgb\(/.test(value)) {
            return "rgb";
        }
        if (/^rgba\(/.test(value)) {
            return "rgba";
        }
        if (/^hsl\(/.test(value)) {
            return "hsl";
        }
        if (/^hsla\(/.test(value)) {
            return "hsla";
        }
        throw new Error("Unsupported color format");
    }

    function hslaParse(value: string): HSLValue {
        const match = /^hsla\((\d+),\s*(\d+)%,\s*(\d+)%,\s*(\d+(\.\d+)?)\)$/.exec(value);
        if (!match) throw new Error("Invalid HSLA format");
        return [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])];
    }

    function hslParse(value: string): HSLValue {
        const match = /^hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)$/.exec(value);
        if (!match) throw new Error("Invalid HSL format");
        return [Number(match[1]), Number(match[2]), Number(match[3]), 1];
    }

    function convertColor(value: string): HSLValue {
        let rgbValues;
        let alpha;
        const format = detectColorFormat(value);
        switch (format) {
            case "hex":
                return rgbToHsla(hexToRgb(value));
            case "rgb":
                rgbValues = value.match(/\d+/g)!.map((x) => parseInt(x, 10));
                return rgbToHsla(rgbValues);
            case "rgba":
                rgbValues = value.match(/\d+/g)!.map((x) => parseInt(x, 10));
                alpha = parseFloat(value.match(/[\d.]+(?=\))/)![0]);
                return rgbaToHsla([...rgbValues.slice(0, 3), alpha]);
            case "hsl":
                return hslParse(value);
            case "hsla":
                return hslaParse(value);
            default:
                throw new Error("Unsupported color format");
        }
    }

    function increaseHueByN(hslColor: HSLValue, n: number = 5): HSLValue {
        const [h, s, l, a] = hslColor;
        const newHue = (h + n) % 360;
        return [newHue, s, l, a];
    }

    const hsla = convertColor(color);
    const toColor = increaseHueByN(hsla);
    const tailwind = `bg-gradient-to-b from-[hsla(${Math.floor(hsla[0])},${Math.floor(hsla[1])}%,${Math.floor(hsla[2])}%,${Math.floor(hsla[3])}%)] to-[hsla(${Math.floor(toColor[0])},${Math.floor(toColor[1])}%,${Math.floor(toColor[2])}%,${Math.floor(toColor[3])}%)]`;
    const vanilla = `linear-gradient(to bottom, hsla(${Math.floor(hsla[0])},${Math.floor(hsla[1])}%,${Math.floor(hsla[2])}%,${Math.floor(hsla[3])}%)), hsla(${Math.floor(toColor[0])},${Math.floor(toColor[1])}%,${Math.floor(toColor[2])}%,${Math.floor(toColor[3])}%))`;

    return cssFormat === "tailwind" ? tailwind : vanilla;
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
export function getTagBgColors(
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
