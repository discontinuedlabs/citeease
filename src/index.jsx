import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { Provider as ReduxeProvider } from "react-redux";
import App from "./App";
import store from "./data/store/store.ts";
import { AuthProvider } from "./context/AuthContext";
import ModalProvider from "./context/ModalContext.tsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <HashRouter>
            <AuthProvider>
                <ReduxeProvider store={store}>
                    <ModalProvider>
                        <App />
                    </ModalProvider>
                </ReduxeProvider>
            </AuthProvider>
        </HashRouter>
    </React.StrictMode>
);
