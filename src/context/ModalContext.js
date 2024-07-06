import { nanoid } from "nanoid";
import { createContext, useContext, useMemo, useState } from "react";

const ModalContext = createContext(null);

export function useModal() {
    return useContext(ModalContext);
}

function Modal({ id, title, message, content, actions, icon, showCloseIcon = true, close }) {
    return (
        <div className="fixed h-screen">
            <div className="fixed inset-0 bg-gray-900 opacity-75" />

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
                                    autoFocus={Boolean(action[2]) || /auto-?focus|focus/i.test(action[2])}
                                    key={nanoid}
                                    type="button"
                                    onClick={() => {
                                        action[1]();
                                        close();
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

export default function ModalProvider({ children }) {
    const [modals, setModals] = useState([]);

    function openModal(newModal) {
        setModals((prevModals) => [...prevModals, newModal]);
    }

    function closeModal(id) {
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
                        key={nanoid}
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
