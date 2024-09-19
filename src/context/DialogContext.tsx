/* eslint-disable no-unused-vars, @typescript-eslint/no-namespace */

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { FilledButton, Icon, TextButton } from "../components/ui/MaterialComponents";
import { uid } from "../utils/utils.ts";
import { useTimeout } from "../hooks/hooks.tsx";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "md-dialog": React.DetailedHTMLProps<React.HTMLAttributes<HTMLDialogElement>, HTMLDialogElement> & {
                open?: boolean;
                class?: string;
            };
        }
    }
}

type ActionOptions = {
    type?: "text" | "filled";
    closeOnClick?: boolean;
};

type DialogProps = {
    id: string;
    headline?: ReactNode;
    icon?: string;
    content: ReactNode;
    actions?: [string, () => void, ActionOptions][];
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

function Dialog({ id, headline, icon, content, actions, close }: DialogProps) {
    const setTimeout = useTimeout();

    function handleClose(dId) {
        const dialog = document.getElementById(dId) as HTMLDialogElement;
        dialog?.close();
        setTimeout(() => {
            close(dId);
        }, 1000); // PATCH: Duct tape fix to show the closign animation before removing it from the dialogs array.
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
            {icon && <Icon name={icon} />}
            <div slot="content">
                {(typeof content === "string" && <div className="px-5">{content}</div>) || content}
            </div>
            <div className="p-5" slot="actions">
                {actions &&
                    actions.map((action) => {
                        const options = action[2];
                        if (options?.type === "filled") {
                            return (
                                <FilledButton
                                    key={uid()}
                                    onClick={() => {
                                        action[1]();
                                        if (options?.closeOnClick !== false) handleClose(id);
                                    }}
                                >
                                    {action[0]}
                                </FilledButton>
                            );
                        }
                        return (
                            <TextButton
                                key={uid()}
                                onClick={() => {
                                    action[1]();
                                    if (options?.closeOnClick !== false) handleClose(id);
                                }}
                            >
                                {action[0]}
                            </TextButton>
                        );
                    })}
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

    function removeHiddenDialogs(): void {
        setDialogs((prevDialogs) => {
            return prevDialogs.filter((dialog) => {
                const dialogElement = document.getElementById(dialog.id) as HTMLDialogElement;
                // Keep the dialog if it's still open, otherwise remove it
                return dialogElement?.open;
            });
        });
    }

    function closeDialog(id: string): void {
        const targetDialog = document.getElementById(id) as HTMLDialogElement;
        targetDialog?.close();
        setTimeout(removeHiddenDialogs, 1000);
    }

    function showDialog(newDialog: Omit<DialogProps, "id" | "close">): void {
        setDialogs((prevDialogs) => [...prevDialogs, { id: uid(), close: closeDialog, ...newDialog }]);
        setTimeout(removeHiddenDialogs, 1000);
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
                        icon={dialog.icon}
                        content={dialog.content}
                        actions={dialog.actions}
                        close={closeDialog}
                    />
                ))}
        </DialogContext.Provider>
    );
}
