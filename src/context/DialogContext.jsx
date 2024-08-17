/* eslint-disable prettier/prettier, no-param-reassign */

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TextButton } from "../components/ui/MaterialComponents";
import { uid } from "../utils/utils.ts";

const DialogContext = createContext(undefined);

export function useDialog() {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error("useDialog must be used within a DialogProvider");
    }
    return context;
}

function Dialog({ id, headline, content, actions, close, ref }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                close(id);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [close, id]);

    useEffect(() => {
        if (ref) {
            ref.current = dialogRef.current;
        }
    }, [ref]);

    function handleClose() {
        if (dialogRef.current) {
            dialogRef.current.close();
            close(id);
        }
    }

    return (
        <md-dialog open ref={dialogRef}>
            {headline && (
                <div className="p-5" slot="headline">
                    {headline}
                </div>
            )}
            <form slot="content" id="form-id" method="dialog">
                {content}
            </form>
            <div className="p-5" slot="actions">
                {actions &&
                    actions.map((action) => {
                        return (
                            <TextButton
                                onClick={() => {
                                    action[1]();
                                    handleClose();
                                }}
                                form="form-id"
                            >
                                {action[0]}
                            </TextButton>
                        );
                    })}
                <TextButton onClick={handleClose}>Cancel</TextButton>
            </div>
        </md-dialog>
    );
}

export default function DialogProvider({ children }) {
    const [dialogs, setDialogs] = useState([]);

    const focusableElements = [
        "a[href]",
        "button",
        "[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "details",
        // eslint-disable-next-line quotes
        '[tabindex]:not([tabindex="-1"])',
    ];

    function showDialog(newDialog) {
        const focusableElementsArray = Array.from(document.querySelectorAll(focusableElements.join(","))).map(
            (element) => element
        );
        focusableElementsArray.forEach((element) => element.setAttribute("tabindex", "-1"));

        setDialogs((prevDialogs) => [...prevDialogs, { id: uid(), ...newDialog }]);
    }

    function closeDialog(id) {
        setDialogs((prevDialogs) => prevDialogs.filter((dialog) => dialog.id !== id));

        const focusableElementsArray = Array.from(document.querySelectorAll(focusableElements.join(","))).map(
            (element) => element
        );
        focusableElementsArray.forEach((element) => element.removeAttribute("tabindex"));
    }

    const contextValue = useMemo(
        () => ({
            show: showDialog,
            close: closeDialog,
        }),
        []
    );

    return (
        <DialogContext.Provider value={contextValue}>
            {children}
            {dialogs &&
                dialogs.map((dialog) => (
                    <Dialog
                        id={dialog.id}
                        key={dialog.id}
                        headline={dialog.headline}
                        content={dialog.content}
                        actions={dialog.actions}
                        close={() => closeDialog(dialog.id)}
                    />
                ))}
        </DialogContext.Provider>
    );
}
