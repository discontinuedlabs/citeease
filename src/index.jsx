import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { HashRouter as Router } from "react-router-dom";
import { Provider as ReduxeProvider } from "react-redux";
import App from "./App";
import store from "./data/store/store.ts";
import { AuthProvider } from "./context/AuthContext";
import ModalProvider from "./context/ModalContext.tsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <Router>
            <AuthProvider>
                <ReduxeProvider store={store}>
                    <ModalProvider>
                        <App />
                    </ModalProvider>
                </ReduxeProvider>
            </AuthProvider>
        </Router>
    </React.StrictMode>
);
