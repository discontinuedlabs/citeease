import React, { useState } from "react";
import { uid } from "../../utils/utils.ts";
import { ContextMenuOption } from "./StyledButtons";

export default function ContextMenu({ options, children, direction = "down" }) {
    const [visible, setVisible] = useState(false);

    const handleClose = (event) => {
        if (event.key === "Escape") {
            setVisible(false);
        }
    };

    return (
        <div className="relative h-min">
            <ContextMenuOption onClick={() => setVisible(!visible)}>{children}</ContextMenuOption>

            {visible && (
                <>
                    {/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
                    <div
                        tabIndex={0}
                        onClick={() => setVisible(false)}
                        onKeyDown={handleClose}
                        aria-hidden={!visible}
                        className="fixed left-0 top-0 h-screen w-screen"
                    />
                    <div
                        role="dialog"
                        className={`absolute right-0 ${direction === "down" ? "top-full" : "bottom-full"} border-neutral-gray rounded-lg border-2 border-solid bg-white p-1 shadow-lg`}
                    >
                        <ul className="m-0 grid w-max gap-1">
                            {options.map((option) => (
                                <li key={uid()} className="list-none">
                                    <ContextMenuOption
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            option[1]();
                                            setVisible(false);
                                        }}
                                        tabIndex={0}
                                        aria-label={`${option[0]} action`}
                                        className="w-full text-start"
                                    >
                                        {option[0]}
                                    </ContextMenuOption>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}
