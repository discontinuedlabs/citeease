/* eslint-disable no-unused-vars, @typescript-eslint/no-namespace */

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
    forwardRef,
    useRef,
    useImperativeHandle,
    useId,
} from "react";
import { Checkbox, FilledButton, Icon, OutlinedButton, TextButton } from "../components/ui/MaterialComponents";
import { uid } from "../utils/utils.ts";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "md-dialog": React.DetailedHTMLProps<React.HTMLAttributes<HTMLDialogElement>, HTMLDialogElement> & {
                open?: boolean;
                class?: string;
                ref?: React.Ref<HTMLDialogElement>;
            };
        }
    }
}

type ActionOptions = {
    type?: "text" | "filled" | "outlined";
    closeOnClick?: boolean;
};

type DialogAction = [string, () => void, ActionOptions];

type DialogProps = {
    id: string;
    headline?: ReactNode;
    icon?: string;
    content: ReactNode;
    actions?: DialogAction[];
    checkboxes?: [string, boolean, (checked: boolean) => void][];
    close: (id: string) => void;
};

type DialogContextValue = {
    show: (newDialog: DialogProps) => void;
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
 *                     checkboxes: ["Don't show again", false, (checked) => setDontShowAgain(checked)],
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

const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog(props: DialogProps, parentRef) {
    const { id, headline, icon, content, actions = [], checkboxes = [], close } = props;
    const localRef = useRef<HTMLDialogElement>(null);
    const checkoxId = useId();
    // let otherOptions: [DialogAction[], DialogAction, DialogAction];

    // if (actions.length > 3) {
    //     otherOptions = [actions.slice(0, -2), actions.at(-2) as DialogAction, actions.at(-1) as DialogAction];
    // }

    useImperativeHandle(parentRef, () => localRef.current!, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                close(id);
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [close, id]);

    /* eslint-disable react/jsx-props-no-spreading, indent */
    return (
        <md-dialog ref={localRef} open id={id}>
            {headline && (
                <div className="p-5" slot="headline">
                    {headline}
                </div>
            )}

            {icon && <Icon name={icon} />}

            <div slot="content">
                {(typeof content === "string" && <div className="px-5">{content}</div>) || content}
                {checkboxes.length !== 0 &&
                    checkboxes.map((checkbox) => {
                        const [label, checked, onChange] = checkbox;
                        return (
                            <div className="flex gap-2 px-5 py-2">
                                <Checkbox
                                    id={checkoxId}
                                    checked={checked || false}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        onChange((event.target as HTMLInputElement).checked);
                                    }}
                                    {...({} as React.InputHTMLAttributes<HTMLInputElement>)}
                                />
                                <label htmlFor={checkoxId}>{label}</label>
                            </div>
                        );
                    })}
            </div>

            <div
                className={`${actions.length > 2 ? "grid *:ml-auto *:mr-0" : ""} p-5 sm:flex sm:flex-wrap sm:justify-end sm:*:ml-0`}
                slot="actions"
            >
                {actions.length !== 0 &&
                    actions.map((action, index) => {
                        const [label, callback, options] = action;
                        const buttonProps = {
                            className: `${index === 0 && actions.length === 3 ? "sm:mr-auto" : "sm:mr-0"}`,
                            onClick: () => {
                                callback();
                                if (options?.closeOnClick !== false) close(id);
                            },
                        };

                        switch (options?.type) {
                            case "filled":
                                return (
                                    <FilledButton key={uid()} {...buttonProps}>
                                        {label}
                                    </FilledButton>
                                );
                            case "outlined":
                                return (
                                    <OutlinedButton key={uid()} {...buttonProps}>
                                        {label}
                                    </OutlinedButton>
                                );
                            default:
                                return (
                                    <TextButton key={uid()} {...buttonProps}>
                                        {label}
                                    </TextButton>
                                );
                        }
                    })}
            </div>
        </md-dialog>
    );
    /* eslint-enable react/jsx-props-no-spreading, indent */
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
    const [dialogs, setDialogs] = useState<DialogProps[]>([]);
    const dialogRefs = useRef<{ [key: string]: HTMLDialogElement | null }>({});

    useEffect(() => {
        dialogs.forEach((dialog) => {
            function handleClose() {
                setDialogs((prevDialogs) => prevDialogs.filter((d) => d.id !== dialog.id));
            }

            const dialogElement = dialogRefs.current[dialog.id];

            if (dialogElement) {
                dialogElement.addEventListener("closed", handleClose);

                return () => {
                    dialogElement.removeEventListener("closed", handleClose);
                };
            }

            return undefined;
        });
    }, [dialogs]);

    function closeDialog(id: string): void {
        const targetDialog = document.getElementById(id) as HTMLDialogElement;
        targetDialog?.close();
    }

    function showDialog(newDialog: DialogProps): void {
        const existingId = document.getElementById(newDialog?.id);
        if (existingId) existingId.remove();

        setDialogs((prevDialogs) => [...prevDialogs, { ...newDialog, id: newDialog?.id || uid() }]);
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
                        ref={(el) => (dialogRefs.current[dialog.id] = el)} // eslint-disable-line no-return-assign
                        key={dialog.id}
                        id={dialog.id}
                        headline={dialog.headline}
                        icon={dialog.icon}
                        content={dialog.content}
                        actions={dialog.actions}
                        checkboxes={dialog.checkboxes}
                        close={closeDialog}
                    />
                ))}
        </DialogContext.Provider>
    );
}
