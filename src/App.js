import { useEffect, useState } from "react";
import Bibliography from "./pages/bibliography/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import { loadFromIndexedDB as loadBibs } from "./data/store/slices/bibsSlice";
import { loadFromIndexedDB as loadSettings } from "./data/store/slices/settingsSlice";
import Settings from "./pages/settings/Settings";
import BibliographySettings from "./pages/bibliography/BibliographySettings";
import MarkdownPage from "./pages/MarkdownPage";
import { AcceptDialog, ConfirmDialog } from "./components/ui/Dialogs";
import NotFoundPage from "./pages/NotFoundPage";
import { useDispatch } from "react-redux";

export default function App() {
    const [acceptDialog, setAcceptDialog] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({});
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadBibs());
        dispatch(loadSettings());
    }, [dispatch]);

    useEffect(() => {
        const h1 = document.querySelector("h1");
        if (h1) document.title = `${h1.textContent} - CiteEase` || "CiteEase";

        return () => (document.title = "CiteEase");
    });

    function showAcceptDialog(title, body = "") {
        setAcceptDialog({ message: { title, body } });
    }

    function showConfirmDialog(title, body, onConfirmMethod, yesLabel = "Yes", noLabel = "No") {
        setConfirmDialog({ message: { title, body }, onConfirmMethod, yesLabel, noLabel });
    }

    return (
        <div className="font-sans bg-neutral-white p-5 min-h-screen text-neutral-black">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/settings" element={<Settings />} />
                <Route
                    path="/:bibId"
                    element={<Bibliography showAcceptDialog={showAcceptDialog} showConfirmDialog={showConfirmDialog} />}
                />
                <Route path="/:bibId/settings" element={<BibliographySettings />} />

                <Route
                    path="/about"
                    element={<MarkdownPage title={"About CiteEase"} filePath={"/citeease/markdown/about.md"} />}
                />
                <Route
                    path="/terms"
                    element={<MarkdownPage title={"Terms of Use"} filePath={"/citeease/markdown/terms.md"} />}
                />
                <Route
                    path="/privacy"
                    element={<MarkdownPage title={"Privacy Policy"} filePath={"/citeease/markdown/privacy.md"} />}
                />

                <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {acceptDialog.message && (
                <AcceptDialog message={acceptDialog.message} closeDialog={() => setAcceptDialog({})} />
            )}
            {confirmDialog.message && <ConfirmDialog {...confirmDialog} closeDialog={() => setConfirmDialog({})} />}
        </div>
    );
}
