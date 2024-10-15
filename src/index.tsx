import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider as ReduxeProvider } from "react-redux";
import App from "./App";
import store from "./data/store/store.ts";
import { AuthProvider } from "./context/AuthContext";
import ToastProvider from "./context/ToastContext.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import DialogProvider from "./context/DialogContext.tsx";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import "./index.css";
// import "@material/web/all";
import "@material/web/focus/md-focus-ring";
import "@material/web/icon/icon";
import "@material/web/ripple/ripple";
import "@material/web/button/filled-button";
import "@material/web/button/text-button";
import "@material/web/button/outlined-button";
import "@material/web/checkbox/checkbox";
import "@material/web/switch/switch";
import "@material/web/dialog/dialog";
import "@material/web/divider/divider";
import "@material/web/fab/fab";
import "@material/web/field/filled-field";
import "@material/web/iconbutton/icon-button";
import "@material/web/iconbutton/outlined-icon-button";
import "@material/web/list/list";
import "@material/web/list/list-item";
import "@material/web/menu/menu";
import "@material/web/menu/menu-item";
import "@material/web/menu/sub-menu";
import "@material/web/textfield/filled-text-field";
import "@material/web/progress/circular-progress";
import "@material/web/progress/linear-progress";
import "@material/web/select/filled-select";
import "@material/web/select/select-option";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <Router basename="/citeease/">
                <AuthProvider>
                    <ReduxeProvider store={store}>
                        <ToastProvider>
                            <DialogProvider>
                                <App />
                            </DialogProvider>
                        </ToastProvider>
                    </ReduxeProvider>
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    </React.StrictMode>
);
serviceWorkerRegistration.register();
