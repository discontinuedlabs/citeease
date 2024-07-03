import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import Bibliography from "./pages/bibliography/Bibliography";
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
import Signup from "./pages/account/Signup";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/account/Login";
import Account from "./pages/account/Account";
import ForgotPassword from "./pages/account/ForgotPassword";
import firestoreDB from "./data/db/firebase/firebase";

export default function App() {
    const [acceptDialog, setAcceptDialog] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({});
    const bibliographies = useSelector((state) => state.bibliographies);
    const settings = useSelector((state) => state.settings);
    const { currentUser } = useAuth();
    const dispatch = useDispatch();

    useEffect(() => {
        const h1 = document.querySelector("h1");
        document.title = h1 ? `${h1.textContent} - CiteEase` : "CiteEase";

        return () => {
            document.title = "CiteEase";
        };
    });

    useEffect(() => {
        dispatch(loadBibs());
        dispatch(loadSettings());
    }, [dispatch]);

    // TODO: Clean this code
    useEffect(() => {
        if (currentUser) {
            const subscribe = onSnapshot(collection(firestoreDB, "users"), async (snapshot) => {
                const userData = snapshot.docs.find((sDoc) => sDoc.id === currentUser.uid)?.data();
                if (userData) {
                    dispatch(mergeWithCurrentBibs({ bibliographies: JSON.parse(userData?.bibliographies) }));
                    dispatch(mergeWithCurrentSettings({ settings: JSON.parse(userData?.settings) }));

                    const parsedBibs = JSON.parse(userData?.bibliographies);
                    const coBibsIds = [];
                    parsedBibs.forEach((bib) => {
                        if (bib?.collab?.open) {
                            coBibsIds.push(bib.collab.id);
                        }
                    });

                    coBibsIds.forEach(async (id) => {
                        const result = await getDoc(doc(firestoreDB, "coBibs", id));
                        if (result.data()) {
                            dispatch(
                                mergeWithCurrentBibs({ bibliographies: [JSON.parse(result.data().bibliography)] })
                            );
                        }
                    });
                } else {
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
        return null;
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            const userRef = doc(firestoreDB, "users", currentUser.uid);
            setDoc(userRef, { bibliographies: JSON.stringify(bibliographies), settings: JSON.stringify(settings) });
        }
    }, [bibliographies, settings]);

    function showAcceptDialog(title, body = "") {
        setAcceptDialog({ message: { title, body } });
    }

    function showConfirmDialog(title, body, onConfirmMethod, yesLabel = "Yes", noLabel = "No") {
        console.log(onConfirmMethod);
        setConfirmDialog({ message: { title, body }, onConfirmMethod, yesLabel, noLabel });
    }

    return (
        <div className="font-sans bg-neutral-white p-5 min-h-screen text-neutral-black">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/account" element={<Account />} /> {/* redirect to "/login" when !currentUser */}
                <Route path="/settings" element={<Settings />} />
                <Route
                    path="/:bibId"
                    element={<Bibliography showAcceptDialog={showAcceptDialog} showConfirmDialog={showConfirmDialog} />}
                />
                <Route path="/:bibId/settings" element={<BibliographySettings />} />
                <Route
                    path="/about"
                    element={<MarkdownPage title="About CiteEase" filePath="/citeease/markdown/about.md" />}
                />
                <Route
                    path="/terms"
                    element={<MarkdownPage title="Terms of Use" filePath="/citeease/markdown/terms.md" />}
                />
                <Route
                    path="/privacy"
                    element={<MarkdownPage title="Privacy Policy" filePath="/citeease/markdown/privacy.md" />}
                />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {acceptDialog.message && (
                <AcceptDialog message={acceptDialog.message} closeDialog={() => setAcceptDialog({})} />
            )}

            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            {confirmDialog.message && <ConfirmDialog {...confirmDialog} closeDialog={() => setConfirmDialog({})} />}
        </div>
    );
}
