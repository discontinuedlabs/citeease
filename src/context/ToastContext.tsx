/* eslint-disable react/require-default-props, no-unused-vars, react/no-children-prop */

import React, { createContext, useContext, useMemo, useState } from "react";
import { uid } from "../utils/utils.tsx";
import { Icon } from "../components/ui/MaterialComponents";
import { getGradient } from "../utils/uiUtils.ts";
import { SoftButton } from "../components/ui/StyledButtons";
import { useTimeout } from "../hooks/hooks.tsx";

type ToastProps = {
    id: string;
    message: string;
    icon?: string;
    color?: string;
    close: (id: string) => void;
};

type ToastContextType = {
    show: (newToast: Omit<ToastProps, "id" | "close">) => void;
    close: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

function Toast({ id, message, icon, color = "#ffd60a", close }: ToastProps) {
    const [lightColor, mainColor, darkColor] = getGradient(color);
    const setTimeout = useTimeout();

    setTimeout(() => close(id), 10000);

    return (
        <div
            style={{
                background: `linear-gradient(to bottom, ${mainColor}, ${lightColor}`,
                border: `0.1rem ${darkColor} solid`,
            }}
            className="toast-component relative flex w-full flex-wrap justify-between gap-2 rounded-md p-2 shadow-md"
        >
            <div className="flex flex-wrap gap-2">
                <Icon name={icon} className="align-middle" children={undefined} />
                <p className="m-0 align-middle">{message}</p>
            </div>

            <SoftButton className="px-0 py-0" onClick={() => close(id)}>
                {/* eslint-disable-next-line react/no-children-prop */}
                <Icon name="close" className="" children={undefined} />
            </SoftButton>
        </div>
    );
}

type ToastProviderProps = {
    children: React.ReactNode;
};

export default function ToastProvider({ children }: ToastProviderProps) {
    const [toasts, setToasts] = useState<
        {
            id: string;
            message: string;
            icon?: string;
            color?: string;
            showCloseIcon?: boolean;
        }[]
    >([]);

    function showToast(newToast: Omit<ToastProps, "id" | "close">) {
        setToasts((prevToasts) => [...prevToasts, { id: uid(), ...newToast }]); // id should be overriden if it was added to the newToast object
    }

    function closeToast(id: string) {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }

    const contextValue = useMemo(
        () => ({
            show: showToast,
            close: closeToast,
        }),
        []
    );

    return (
        <ToastContext.Provider value={contextValue}>
            <div className="fixed end-0 top-0 z-50 ms-2 box-content flex w-full flex-col gap-2 p-2 font-sans sm:w-60">
                {toasts &&
                    toasts.map((modal) => (
                        <Toast
                            id={modal.id}
                            key={modal.id}
                            message={modal.message}
                            icon={modal.icon}
                            color={modal.color}
                            close={() => closeToast(modal.id)}
                        />
                    ))}
            </div>
            {children}
        </ToastContext.Provider>
    );
}
