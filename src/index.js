import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { HashRouter } from "react-router-dom";
import { Provider as ReduxeProvider } from "react-redux";
import store from "./store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <HashRouter>
            <ReduxeProvider store={store}>
                <App />
            </ReduxeProvider>
        </HashRouter>
    </React.StrictMode>
);

serviceWorkerRegistration.register();
