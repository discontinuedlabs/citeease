import React, { useState } from "react";
import { uid } from "../../utils/utils.ts";

export default function ContextMenu({ options, children }) {
    const [visible, setVisible] = useState(false);

    const handleClose = (event) => {
        if (event.key === "Escape") {
            setVisible(false);
        }
    };

    return (
        <div className="relative">
            <button type="button" onClick={() => setVisible(!visible)}>
                {children}
            </button>

            {visible && (
                <>
                    {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
                    <div
                        role="dialog"
                        tabIndex={0}
                        onClick={() => setVisible(false)}
                        onKeyDown={handleClose}
                        aria-hidden={!visible}
                        className="w-screen h-screen fixed top-0 left-0"
                    />
                    <div className="fixed z-50">
                        <ul className="relative right-full">
                            {options.map((option) => (
                                <li key={uid()} className="list-none">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            option[1]();
                                            setVisible(false);
                                        }}
                                        tabIndex={0}
                                        aria-label={`${option[0]} action`}
                                    >
                                        {option[0]}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}
