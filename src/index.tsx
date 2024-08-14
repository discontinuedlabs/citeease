import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "@material/web/all";
import { HashRouter as Router } from "react-router-dom";
import { Provider as ReduxeProvider } from "react-redux";
import App from "./App";
import store from "./data/store/store.ts";
import { AuthProvider } from "./context/AuthContext";
import ModalProvider from "./context/ModalContext.tsx";
import ToastProvider from "./context/ToastContext.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <Router>
                <AuthProvider>
                    <ReduxeProvider store={store}>
                        <ToastProvider>
                            <ModalProvider>
                                <App />
                            </ModalProvider>
                        </ToastProvider>
                    </ReduxeProvider>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    </React.StrictMode>
);

serviceWorkerRegistration.register();
