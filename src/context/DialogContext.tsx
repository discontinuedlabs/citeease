/* eslint-disable no-unused-vars, @typescript-eslint/no-namespace */

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { TextButton } from "../components/ui/MaterialComponents";
import { uid } from "../utils/utils.ts";
import { useTimeout } from "../hooks/hooks.tsx";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "md-dialog": React.DetailedHTMLProps<React.HTMLAttributes<HTMLDialogElement>, HTMLDialogElement> & {
                open?: boolean;
            };
        }
    }
}

type DialogProps = {
    id: string;
    headline?: ReactNode;
    content: ReactNode;
    actions?: [string, () => void][];
    close: (id: string) => void;
};

type DialogContextType = {
    show: (newDialog: Omit<DialogProps, "id" | "close">) => void;
    close: (id: string) => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

/**
 * Allows components to interact with the dialog system, showing and closing dialogs.
 * It must be used within a component wrapped by the DialogProvider.
 *
 * @returns An object containing methods to show and close dialogs.
 *
 * @example
 * function Component() {
 *     const dialog = useDialog();
 *
 *     return (
 *         <button
 *             onClick={() =>
 *                 dialog.show({
 *                     headline: "Title",
 *                     content: "Message",
 *                     actions: [["Ok", () => dialog.close()]],
 *                 })
 *             }
 *         >
 *             Open Example Dialog
 *         </button>
 *     );
 * }
 */
export function useDialog(): DialogContextType {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error("useDialog must be used within a DialogProvider");
    }
    return context;
}

function Dialog({ id, headline, content, actions, close }: DialogProps) {
    const setTimeout = useTimeout();

    function handleClose(dId) {
        const dialog = document.getElementById(dId) as HTMLDialogElement;
        setTimeout(() => {
            dialog?.close();
            close(dId);
        }, 1000); // PATCH: Duct tape fix. Not pretty, but works for now.
    }

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                handleClose(id);
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [close, id]);

    return (
        <md-dialog open id={id}>
            {headline && (
                <div className="p-5" slot="headline">
                    {headline}
                </div>
            )}
            <form slot="content" id={`form-${id}`} method="dialog">
                {(typeof content === "string" && <div className="px-5">{content}</div>) || content}
            </form>
            <div className="p-5" slot="actions">
                {actions &&
                    actions.map((action) => (
                        <TextButton
                            className=""
                            key={uid()}
                            onClick={() => {
                                action[1]();
                                handleClose(id);
                            }}
                            form={`form-${id}`}
                        >
                            {action[0]}
                        </TextButton>
                    ))}
            </div>
        </md-dialog>
    );
}

type DialogProviderProps = {
    children: ReactNode;
};

/**
 * Context provider for managing dialog states.
 *
 * @component
 * @param {Object} props - Props for the DialogProvider.
 * @param {ReactNode} props.children - Child components to wrap with the dialog context.
 * @example
 * <DialogProvider>
 *   <MyComponent />
 * </DialogProvider>
 */
export default function DialogProvider({ children }: DialogProviderProps) {
    const [dialogs, setDialogs] = useState<DialogProps[]>([]);
    const setTimeout = useTimeout();

    function closeDialog(id: string) {
        const targetDialog = document.getElementById(id) as HTMLDialogElement;
        targetDialog?.close();
        setTimeout(() => {
            setDialogs((prevDialogs) => prevDialogs.filter((dialog) => dialog.id !== id));
        }, 1000);
    }

    function showDialog(newDialog: Omit<DialogProps, "id" | "close">) {
        setDialogs((prevDialogs) => [...prevDialogs, { id: uid(), close: closeDialog, ...newDialog }]);
    }

    const contextValue = useMemo(
        () => ({
            show: showDialog,
            close: (id: string) => closeDialog(id),
        }),
        []
    );

    return (
        <DialogContext.Provider value={contextValue}>
            {children}
            {dialogs &&
                dialogs.map((dialog) => (
                    <Dialog
                        key={dialog.id}
                        id={dialog.id}
                        headline={dialog.headline}
                        content={dialog.content}
                        actions={dialog.actions}
                        close={closeDialog}
                    />
                ))}
        </DialogContext.Provider>
    );
}
