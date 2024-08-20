/* eslint-disable prettier/prettier, no-param-reassign */

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TextButton } from "../components/ui/MaterialComponents";
import { uid } from "../utils/utils.ts";
import { useTimeout } from "../hooks/hooks.tsx";

const DialogContext = createContext(undefined);

export function useDialog() {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error("useDialog must be used within a DialogProvider");
    }
    return context;
}

function Dialog({ id, headline, content, actions, close }) {
    const dialogRef = useRef(null);

    function handleClose() {
        if (dialogRef.current) {
            dialogRef.current.close();
            close(id);
        }
    }

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === "Escape") {
                handleClose();
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [close, id]);

    return (
        <md-dialog open id={id} ref={dialogRef}>
            {headline && (
                <div className="p-5" slot="headline">
                    {headline}
                </div>
            )}
            <form slot="content" id={`form-${id}`} method="dialog">
                {content}
            </form>
            <div className="p-5" slot="actions">
                {actions &&
                    actions.map((action) => {
                        return (
                            <TextButton
                                key={uid()}
                                onClick={() => {
                                    action[1]();
                                    handleClose();
                                }}
                                form={`form-${id}`}
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
    const setTimeout = useTimeout();

    console.log(dialogs);

    function showDialog(newDialog) {
        setDialogs((prevDialogs) => [...prevDialogs, { id: uid(), ...newDialog }]);
    }

    function closeDialog(id) {
        const targetDialog = document.getElementById(id);
        targetDialog.close();
        setTimeout(() => {
            setDialogs((prevDialogs) => prevDialogs.filter((dialog) => dialog.id !== id));
        }, 1000);
    }

    const contextValue = useMemo(
        () => ({
            show: showDialog,
            close: (id) => closeDialog(id),
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
                        close={closeDialog}
                    />
                ))}
        </DialogContext.Provider>
    );
}
