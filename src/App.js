import "./css/App.css";
import { useState } from "react";
import Bibliography from "./components/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import { useLocalStorage, useReducerWithLocalStorage } from "./utils";
import AcceptDialog from "./components/ui/AcceptDialog";
import ConfirmDialog from "./components/ui/ConfirmDialog";
import bibliographyReducer, { ACTIONS } from "./components/reducers/bibliographyReducer";
import ContextMenu from "./components/ui/ContextMenu";
import Settings from "./components/Settings";
import BibliographySettings from "./components/BibliographySettings";

export default function App() {
    const [bibliographies, dispatch] = useReducerWithLocalStorage("bibliographies", bibliographyReducer, []);
    const [savedCslFiles, setSavedCslFiles] = useLocalStorage("savedCslFiles", {}); // Used to save the CSL files that don't exist in the public folder
    const [font, setFont] = useLocalStorage("font", { name: "Georgia", family: "Georgia" });
    const [acceptDialog, setAcceptDialog] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({});

    // TODO: Move this to settings
    const FONTS = [
        { name: "Default", family: "unset" },
        { name: "Arial", family: "Arial" },
        { name: "Georgia", family: "Georgia" },
        {
            name: "System Font",
            family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        },
        { name: "Times New Roman", family: "Times New Roman" },
    ];

    function showAcceptDialog(title, body = "") {
        setAcceptDialog({ message: { title, body } });
    }

    function showConfirmDialog(title, body, onConfirmMethod, yesLabel = "Yes", noLabel = "No") {
        setConfirmDialog({ message: { title, body }, onConfirmMethod, yesLabel, noLabel });
    }

    return (
        <div className="app">
            <ContextMenu
                style={{ fontFamily: font.family }}
                label={font.name}
                options={FONTS.map((font) => ({
                    label: font.name,
                    method: () => setFont(font),
                    style: { fontFamily: font.family },
                }))}
            />

            <Routes>
                <Route
                    path="/"
                    element={<Home bibliographies={bibliographies} dispatch={dispatch} ACTIONS={ACTIONS} />}
                />
                <Route path="/settings" element={<Settings />} />
                <Route
                    path="/:bibId"
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
                <Route path="/:bibId/settings" element={<BibliographySettings bibliographies={bibliographies} />} />
            </Routes>
            {acceptDialog.message && (
                <AcceptDialog message={acceptDialog.message} closeDialog={() => setAcceptDialog({})} />
            )}
            {confirmDialog.message && <ConfirmDialog {...confirmDialog} closeDialog={() => setConfirmDialog({})} />}
        </div>
    );
}
