import "./css/App.css";
import { useState } from "react";
import Bibliography from "./components/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import { useLocalStorage, useReducerWithLocalStorage, use } from "./utils";
import AcceptDialog from "./components/ui/AcceptDialog";
import ConfirmDialog from "./components/ui/ConfirmDialog";
import bibliographyReducer, { ACTIONS } from "./components/reducers/bibliographyReducer";
import Settings from "./components/Settings";
import BibliographySettings from "./components/BibliographySettings";
import settingsReducer from "./components/reducers/settingsReducer";

const CITATION_STYLES = [
    { name: "APA", code: "apa" },
    { name: "MLA", code: "modern-language-association" },
    { name: "Chicago", code: "chicago" },
    { name: "Harvard", code: "harvard-cite-them-right" },
    { name: "Vancouver", code: "vancouver" },
];

export default function App() {
    const [bibliographies, dispatch] = useReducerWithLocalStorage("bibliographies", bibliographyReducer, []);
    const [settings, settingsDispatch] = useReducerWithLocalStorage("settings", settingsReducer, {});
    const [savedCslFiles, setSavedCslFiles] = useLocalStorage("savedCslFiles", {}); // Used to save the CSL files that don't exist in the public folder
    const [acceptDialog, setAcceptDialog] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({});

    function showAcceptDialog(title, body = "") {
        setAcceptDialog({ message: { title, body } });
    }

    function showConfirmDialog(title, body, onConfirmMethod, yesLabel = "Yes", noLabel = "No") {
        setConfirmDialog({ message: { title, body }, onConfirmMethod, yesLabel, noLabel });
    }

    return (
        <div className="app">
            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            bibliographies={bibliographies}
                            CITATION_STYLES={CITATION_STYLES}
                            dispatch={dispatch}
                            ACTIONS={ACTIONS}
                        />
                    }
                />
                <Route
                    path="/settings"
                    element={<Settings settings={settings} settingsDispatch={settingsDispatch} />}
                />
                <Route
                    path="/:bibId"
                    element={
                        <Bibliography
                            bibliographies={bibliographies}
                            CITATION_STYLES={CITATION_STYLES}
                            dispatch={dispatch}
                            ACTIONS={ACTIONS}
                            settings={settings}
                            showAcceptDialog={showAcceptDialog}
                            showConfirmDialog={showConfirmDialog}
                            savedCslFiles={savedCslFiles}
                            setSavedCslFiles={setSavedCslFiles}
                        />
                    }
                />
                <Route path="/:bibId/settings" element={<BibliographySettings bibliographies={bibliographies} />} />

                {/* <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}

                {/* <Route path="*" element={<NotFoundPage />} /> */}
            </Routes>
            {acceptDialog.message && (
                <AcceptDialog message={acceptDialog.message} closeDialog={() => setAcceptDialog({})} />
            )}
            {confirmDialog.message && <ConfirmDialog {...confirmDialog} closeDialog={() => setConfirmDialog({})} />}
        </div>
    );
}
