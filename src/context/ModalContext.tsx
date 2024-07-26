/* eslint-disable react/require-default-props, no-unused-vars */

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import { uid } from "../utils/utils.ts";
import { Icon } from "../components/ui/MaterialComponents";
import { Button, SoftButton } from "../components/ui/StyledButtons";

type Action = [string, () => void, { autoFocus?: boolean; closeOnClick?: boolean; color?: string }];

type ModalProps = {
    id: string;
    title: string;
    message: string;
    content?: React.JSX.Element | null;
    actions?: Action[];
    icon?: React.JSX.Element | null;
    showCloseIcon?: boolean;
    close: (id: string) => void;
};

type ModalContextType = {
    open: (newModal: Omit<ModalProps, "id" | "close">) => void;
    close: (id: string) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal(): ModalContextType {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}

function Modal({ id, title, message, content, actions, icon, showCloseIcon = true, close }: ModalProps) {
    useEffect(() => {
        if (!showCloseIcon) return undefined;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                close(id);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [close, id]);

    return (
        <div className="fixed h-screen items-center justify-center font-sans text-neutral-black">
            <div className="fixed right-0 top-0 flex h-screen w-screen items-center justify-center bg-overlay-700">
                <div
                    role="dialog"
                    aria-modal="true"
                    className="m-5 grid max-w-3xl items-start rounded-lg bg-neutral-white shadow-xl"
                >
                    <header className="flex justify-between p-5">
                        <h3 className="m-0">{title}</h3>
                        {showCloseIcon && (
                            <SoftButton className="top-0 px-0 py-0" onClick={() => close(id)}>
                                {/* eslint-disable-next-line react/no-children-prop */}
                                <Icon name="close" className="" children={undefined} />
                            </SoftButton>
                        )}
                    </header>

                    <article className={`bg-white p-5 shadow-md ${!actions ? "rounded-bl-lg rounded-br-lg" : ""}`}>
                        {message && (
                            <div className="flex items-start">
                                {icon}
                                <Markdown className="m-0">{message}</Markdown>
                            </div>
                        )}
                        {content && <div>{content}</div>}
                    </article>

                    {actions && (
                        <footer className="flex flex-wrap justify-end p-5 px-5">
                            <menu className="flex gap-1">
                                {actions &&
                                    actions.map((action, index) => {
                                        const options = action?.[2];
                                        return (
                                            <Button
                                                // eslint-disable-next-line jsx-a11y/no-autofocus
                                                // WATCH: This must have some unintended results
                                                autoFocus={
                                                    options?.autoFocus === true ||
                                                    (actions.length === 1 && options?.autoFocus !== false) ||
                                                    (index === 0 && options?.autoFocus !== false)
                                                }
                                                color={
                                                    options?.color || /cancel|no/i.test(action[0]) ? "red" : undefined
                                                }
                                                className="min-w-20"
                                                key={id}
                                                onClick={() => {
                                                    action[1]();
                                                    if (options?.closeOnClick !== false) close(id);
                                                }}
                                            >
                                                {action[0]}
                                            </Button>
                                        );
                                    })}
                            </menu>
                        </footer>
                    )}
                </div>
            </div>
        </div>
    );
}

type ModalProviderProps = {
    children: React.ReactNode;
};

export default function ModalProvider({ children }: ModalProviderProps) {
    const [modals, setModals] = useState<
        {
            id: string;
            title: string;
            message: string;
            content?: React.JSX.Element | null;
            actions?: Action[];
            icon?: React.JSX.Element | null;
            showCloseIcon?: boolean;
        }[]
    >([]);

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

    function openModal(newModal: Omit<ModalProps, "id" | "close">) {
        const focusableElementsArray = Array.from(document.querySelectorAll(focusableElements.join(","))).map(
            (element) => element as HTMLElement
        );
        focusableElementsArray.forEach((element) => element.setAttribute("tabindex", "-1"));

        setModals((prevModals) => [...prevModals, { id: uid(), ...newModal }]); // id should be overriden if it was added to the newModal object
    }

    function closeModal(id: string) {
        setModals((prevModals) => prevModals.filter((modal) => modal.id !== id));

        const focusableElementsArray = Array.from(document.querySelectorAll(focusableElements.join(","))).map(
            (element) => element as HTMLElement
        );
        focusableElementsArray.forEach((element) => element.removeAttribute("tabindex"));
    }

    const contextValue = useMemo(
        () => ({
            open: openModal,
            close: closeModal,
        }),
        []
    );

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            {modals &&
                modals.map((modal) => (
                    <Modal
                        id={modal.id}
                        key={modal.id}
                        title={modal.title}
                        message={modal.message}
                        content={modal.content}
                        actions={modal.actions}
                        icon={modal.icon}
                        showCloseIcon={modal.showCloseIcon}
                        close={() => closeModal(modal.id)}
                    />
                ))}
        </ModalContext.Provider>
    );
}
