import "./css/App.css";
import { useState } from "react";
import Bibliography from "./components/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import { useLocalStorage, useReducerWithLocalStorage } from "./utils";
import AcceptDialog from "./components/ui/AcceptDialog";
import ConfirmDialog from "./components/ui/ConfirmDialog";
import bibliographyReducer, { ACTIONS } from "./components/reducers/bibliographyReducer";

export default function App() {
    const [bibliographies, dispatch] = useReducerWithLocalStorage("bibliographies", bibliographyReducer, []);
    const [savedCslFiles, setSavedCslFiles] = useLocalStorage("savedCslFiles", {}); // Used to save the CSL files that don't exist in the public folder
    const [font, setFont] = useLocalStorage("font", { name: "Georgia", family: "Georgia" });
    const [acceptDialog, setAcceptDialog] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({});

    const FONTS = [
        { name: "Default", family: "unset" },
        { name: "Arial", family: "Arial" },
        { name: "Calibri", family: "Calibri" },
        { name: "Georgia", family: "Georgia" },
        { name: "Helvetica", family: "Helvetica" },
        { name: "Lucida Sans Unicode", family: "Lucida Sans Unicode" },
        {
            name: "System UI",
            family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        },
        { name: "Tahoma", family: "Tahoma" },
        { name: "Times New Roman", family: "Times New Roman" },
        { name: "Verdana", family: "Verdana" },
    ];

    function showAcceptDialog(title, body = "") {
        setAcceptDialog({ message: { title, body } });
    }

    function showConfirmDialog(title, body, onConfirmMethod, yesLabel = "Yes", noLabel = "No") {
        setConfirmDialog({ message: { title, body }, onConfirmMethod, yesLabel, noLabel });
    }

    return (
        <div className="app">
            {/* <ContextMenu
                label={font.name}
                options={fonts.map((f) => ({
                    label: f.name,
                    method: () => setFont(f),
                    style: { fontFamily: f.family },
                }))}
            /> */}

            <Routes>
                <Route
                    path="/"
                    element={<Home bibliographies={bibliographies} dispatch={dispatch} ACTIONS={ACTIONS} />}
                />
                <Route
                    path="/:id"
                    element={
                        <Bibliography
                            bibliographies={bibliographies}
                            dispatch={dispatch}
                            ACTIONS={ACTIONS}
                            font={font}
                            showAcceptDialog={showAcceptDialog}
                            showConfirmDialog={showConfirmDialog}
                            savedCslFiles={savedCslFiles}
                            setSavedCslFiles={setSavedCslFiles}
                        />
                    }
                />
            </Routes>
            {acceptDialog.message && (
                <AcceptDialog message={acceptDialog.message} closeDialog={() => setAcceptDialog({})} />
            )}
            {confirmDialog.message && <ConfirmDialog {...confirmDialog} closeDialog={() => setConfirmDialog({})} />}
        </div>
    );
}
