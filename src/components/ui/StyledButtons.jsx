import { useState } from "react";
import { getGradient } from "../../utils/uiUtils.ts";

/* eslint-disable react/jsx-props-no-spreading */

export function SoftButton({ className, children, onClick, ...rest }) {
    const [isClicked, setIsClicked] = useState(false);

    const upClasses = "bg-transparent hover:bg-neutral-transparentGray";
    const downClasses = "bg-secondary-100 hover:bg-secondary-200";

    const dynamicClasses = isClicked ? downClasses : upClasses;

    return (
        <button
            className={`transition-regular rounded border border-none p-2 ${dynamicClasses} ${className}`}
            type="button"
            onClick={onClick}
            onTouchStart={() => setIsClicked(true)}
            onMouseDown={() => setIsClicked(true)}
            onMouseUp={() => setIsClicked(false)}
            onTouchEnd={() => setIsClicked(false)}
            {...rest}
        >
            {children}
        </button>
    );
}

export function Button({ className, children, onClick, color = "#ffd60a", ...rest }) {
    const [isClicked, setIsClicked] = useState(false);
    const [lightColor, mainColor, darkColor] = getGradient(color);

    return (
        <button
            className={`rounded-lg p-2 transition-none ${className}`}
            style={{
                background: `linear-gradient(to bottom, ${mainColor}, ${lightColor}`,
                border: `0.1rem ${darkColor} solid`,
                boxShadow: isClicked ? "" : `0 0.25rem 0 ${darkColor}`,
                transform: isClicked ? "translateY(0)" : "translateY(-0.25rem)",
            }}
            type="button"
            onClick={onClick}
            onTouchStart={() => setIsClicked(true)}
            onMouseDown={() => setIsClicked(true)}
            onMouseUp={() => setIsClicked(false)}
            onTouchEnd={() => setIsClicked(false)}
            {...rest}
        >
            {children}
        </button>
    );
}
