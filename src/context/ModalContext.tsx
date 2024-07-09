/* eslint-disable react/require-default-props, no-unused-vars */

import { nanoid } from "nanoid";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Action = [string, () => void, { autoFocus?: boolean }];

type ModalProps = {
    id: string;
    title: string;
    message: string;
    content?: JSX.Element | null;
    actions?: Action[];
    icon?: JSX.Element | null;
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
        <div className="font-sans text-neutral-black fixed h-screen">
            <div className="fixed inset-0 bg-gray-900 opacity-75" />
            {/* eslint-disable-next-line */}
            <div
                role="dialog"
                aria-modal="true"
                className="fixed top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] p-5 bg-white grid items-start max-h-[80vh]"
            >
                <header className="flex space-between items-start">
                    <h3 className="mb-2">{title}</h3>
                    {showCloseIcon && (
                        <button type="button" onClick={() => close(id)}>
                            X
                        </button>
                    )}
                </header>

                <article className="overflow-y-auto h-full overscroll-contain-y grid justify-items-start">
                    <div className="flex items-start mb-4">
                        {icon}
                        <p>{message}</p>
                    </div>
                    {content && <article>{content}</article>}
                </article>

                <footer className="flex flex-wrap space-between items-start">
                    <menu>
                        {actions &&
                            actions.map((action) => (
                                <button
                                    // eslint-disable-next-line jsx-a11y/no-autofocus
                                    autoFocus={action?.[2]?.autoFocus || actions.length === 1}
                                    key={nanoid()}
                                    type="button"
                                    onClick={() => {
                                        action[1]();
                                        close(id);
                                    }}
                                >
                                    {action[0]}
                                </button>
                            ))}
                    </menu>
                </footer>
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
            content?: JSX.Element | null;
            actions?: Action[];
            icon?: JSX.Element | null;
            showCloseIcon?: boolean;
        }[]
    >([]);

    function openModal(newModal: Omit<ModalProps, "id" | "close">) {
        setModals((prevModals) => [...prevModals, { ...newModal, id: nanoid() }]);
    }

    function closeModal(id: string) {
        setModals((prevModals) => prevModals.filter((modal) => modal.id !== id));
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