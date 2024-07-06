import { nanoid } from "nanoid";
import { createContext, useContext, useMemo, useState } from "react";

const ModalContext = createContext(null);

export function useModal() {
    return useContext(ModalContext);
}

function Modal(props) {
    const { id, title, message, content, actions, icon, showCloseIcon = true, close } = props;

    return (
        <div className="flex items-center justify-center bg-gray-100">
            <div className="fixed inset-0 bg-black opacity-50" />

            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full z-10">
                {showCloseIcon && (
                    <button
                        type="button"
                        onClick={() => close(id)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        X
                    </button>
                )}

                <h3 className="text-lg font-semibold mb-2">{title}</h3>

                <div className="flex items-start mb-4">
                    {icon}
                    <p className="ml-4 text-sm">{message}</p>
                </div>

                {content && <div className="mb-4">{content}</div>}

                <div>
                    {actions &&
                        actions.map((action) => (
                            <button
                                key={nanoid()}
                                type="button"
                                onClick={() => {
                                    action[1]();
                                    close();
                                }}
                                className="px-4 py-2 mr-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
                            >
                                {action[0]}
                            </button>
                        ))}
                </div>
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
