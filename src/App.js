import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
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
import NotFoundPage from "./pages/NotFoundPage";
import Signup from "./pages/account/Signup";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/account/Login";
import Account from "./pages/account/Account";
import ForgotPassword from "./pages/account/ForgotPassword";
import firestoreDB from "./data/db/firebase/firebase";
import { useDynamicTitle } from "./hooks/hooks.ts";

export default function App() {
    const bibliographies = useSelector((state) => state.bibliographies);
    const settings = useSelector((state) => state.settings);
    const { currentUser } = useAuth();
    const dispatch = useDispatch();
    useDynamicTitle();

    useEffect(() => {
        dispatch(loadBibs());
        dispatch(loadSettings());
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const usersCollection = collection(firestoreDB, "users");
        const coBibsCollection = collection(firestoreDB, "coBibs");

        const unsubscribeUsers = onSnapshot(usersCollection, (snapshot) => {
            const userData = snapshot.docs.find((sDoc) => sDoc.id === currentUser.uid)?.data();
            if (userData?.bibliographies && userData?.settings) {
                dispatch(mergeWithCurrentBibs({ bibs: JSON.parse(userData.bibliographies) }));
                dispatch(mergeWithCurrentSettings({ settings: JSON.parse(userData.settings) }));
            } else {
                try {
                    setDoc(doc(firestoreDB, "users", currentUser.uid), {
                        bibliographies: JSON.stringify(bibliographies),
                        settings: JSON.stringify(settings),
                    });
                } catch (error) {
                    console.error("Error adding document: ", error);
                }
            }
        });

        const unsubscribeCoBibs = onSnapshot(coBibsCollection, (snapshot) => {
            const coBibsIds = bibliographies.filter((bib) => bib?.collab?.open).map((bib) => bib.collab.id);

            const updatedCoBibs = [];
            coBibsIds.forEach((id) => {
                const coBibData = snapshot.docs.find((sDoc) => sDoc.id === id)?.data();
                updatedCoBibs.push(JSON.parse(coBibData));
            });

            dispatch(mergeWithCurrentBibs({ bibs: [...updatedCoBibs] }));
        });

        // eslint-disable-next-line consistent-return
        return () => {
            unsubscribeUsers();
            unsubscribeCoBibs();
        };
    }, [currentUser]);

    return (
        <main className="font-sans bg-neutral-white p-5 min-h-screen text-neutral-black">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/account" element={<Account />} /> {/* redirect to "/login" when !currentUser */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/bib/:bibId" element={<Bibliography />} />
                <Route path="/collab/:bibId" element={<Bibliography />} />
                <Route path="/bib/:bibId/settings" element={<BibliographySettings />} />
                <Route path="/collab/:bibId/settings" element={<BibliographySettings />} />
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
        </main>
    );
}
