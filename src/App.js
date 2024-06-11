import { useEffect, useState } from "react";
import Bibliography from "./pages/bibliography/Bibliography";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home/Home";
import { loadFromIndexedDB as loadBibs, mergeWithCurrent as mergeWithCurrentBibs } from "./data/store/slices/bibsSlice";
import {
    loadFromIndexedDB as loadSettings,
    mergeWithCurrent as mergeWithCurrentSettings,
} from "./data/store/slices/settingsSlice";
import Settings from "./pages/settings/Settings";
import BibliographySettings from "./pages/bibliography/BibliographySettings";
import MarkdownPage from "./pages/MarkdownPage";
import { AcceptDialog, ConfirmDialog } from "./components/ui/Dialogs";
import NotFoundPage from "./pages/NotFoundPage";
import { useDispatch, useSelector } from "react-redux";
import Signup from "./pages/account/Signup";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/account/Login";
import Account from "./pages/account/Account";
import ForgotPassword from "./pages/account/ForgotPassword";
import firestoreDB from "./data/db/firebase/firebase";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";

export default function App() {
    const [acceptDialog, setAcceptDialog] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({});
    const bibliographies = useSelector((state) => state.bibliographies);
    const settings = useSelector((state) => state.settings);
    const { currentUser } = useAuth();
    const dispatch = useDispatch();

    useEffect(() => {
        const h1 = document.querySelector("h1");
        if (h1) document.title = `${h1.textContent} - CiteEase` || "CiteEase";

        return () => (document.title = "CiteEase");
    });

    useEffect(() => {
        dispatch(loadBibs());
        dispatch(loadSettings());
    }, [dispatch]);

    useEffect(() => {
        if (currentUser) {
            const subscribe = onSnapshot(collection(firestoreDB, "users"), async (snapshot) => {
                const userData = snapshot.docs.find((doc) => doc.id === currentUser.uid)?.data();
                if (userData) {
                    dispatch(
                        mergeWithCurrentBibs({ payload: { bibliographies: JSON.parse(userData?.bibliographies) } })
                    );
                    dispatch(mergeWithCurrentSettings({ payload: { settings: JSON.parse(userData?.settings) } }));
                } else if (!userData && currentUser) {
                    try {
                        await setDoc(doc(firestoreDB, "users", currentUser.uid), {
                            bibliographies: JSON.stringify(bibliographies),
                            settings: JSON.stringify(settings),
                        });
                    } catch (error) {
                        console.error("Error adding document: ", error);
                    }
                }
            });
            return subscribe;
        }
    }, [currentUser, dispatch, bibliographies, settings]);

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
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/account" element={<Account />} />
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
