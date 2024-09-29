/* eslint-disable no-unused-vars, @typescript-eslint/no-namespace */

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode, forwardRef } from "react";
import { FilledButton, Icon, TextButton } from "../components/ui/MaterialComponents";
import { uid } from "../utils/utils.ts";
import { useTimeout } from "../hooks/hooks.tsx";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "md-dialog": React.DetailedHTMLProps<React.HTMLAttributes<HTMLDialogElement>, HTMLDialogElement> & {
                open?: boolean;
                class?: string;
                ref?: unknown;
            };
        }
    }
}

type ActionOptions = {
    type?: "text" | "filled";
    closeOnClick?: boolean;
};

type Dialog = {
    id: string;
    headline?: ReactNode;
    icon?: string;
    content: ReactNode;
    actions?: [string, () => void, ActionOptions][];
    close: (id: string) => void;
};

type DialogContextValue = {
    show: (newDialog: Dialog) => void;
    close: (id: string) => void;
};

type DialogProviderProps = {
    children: ReactNode;
};

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

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
export function useDialog(): DialogContextValue {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error("useDialog must be used within a DialogProvider");
    }
    return context;
}

// eslint-disable-next-line
const Dialog = forwardRef(function Dialog(props: Dialog, ref: any) {
    const { id, headline, icon, content, actions, close } = props;
    const setTimeout = useTimeout();

    function handleClose(dId) {
        const dialog = document.getElementById(dId) as HTMLDialogElement;
        dialog?.close();
        setTimeout(() => {
            close(dId);
        }, 150); // PATCH: Duct tape fix to show the closign animation before removing it from the dialogs array.
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
        <md-dialog ref={ref} open id={id}>
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
});

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
    const [dialogs, setDialogs] = useState<Dialog[]>([]);
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
        setTimeout(removeHiddenDialogs, 150);
    }

    function showDialog(newDialog: Dialog): void {
        const existingId = document.getElementById(newDialog?.id);
        if (existingId) return;

        setDialogs((prevDialogs) => [...prevDialogs, { ...newDialog, id: newDialog?.id || uid() }]);
        setTimeout(removeHiddenDialogs, 150);
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
