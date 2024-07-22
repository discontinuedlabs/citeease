import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { collection, onSnapshot } from "firebase/firestore";
import Bibliography from "./pages/bibliography/Bibliography";
import Home from "./pages/home/Home";
import { loadFromIndexedDB as loadBibs, mergeWithCurrentBibs } from "./data/store/slices/bibsSlice";
import { loadFromIndexedDB as loadSettings } from "./data/store/slices/settingsSlice";
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
import { useDynamicTitle } from "./hooks/hooks.tsx";

export default function App() {
    const bibliographies = useSelector((state) => state.bibliographies);
    const { currentUser } = useAuth();
    const reduxDispatch = useDispatch();
    useDynamicTitle();
    const dispatch = useDispatch();

    // FIXME: Fix the useEnhancedDispatch hook because it doesnt accept Promises (loadBibs, and loadSettings in this case).
    useEffect(() => {
        reduxDispatch(loadBibs());
        reduxDispatch(loadSettings());
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const coBibsCollection = collection(firestoreDB, "coBibs");

        const unsubscribeCoBibs = onSnapshot(coBibsCollection, (snapshot) => {
            const coBibsIds = bibliographies.filter((bib) => bib?.collab?.open).map((bib) => bib.collab.id);

            const updatedCoBibs = [];
            coBibsIds.forEach((id) => {
                const coBibData = snapshot.docs.find((sDoc) => sDoc.id === id)?.data();
                console.log(coBibData);
                updatedCoBibs.push(JSON.parse(coBibData));
            });

            dispatch(mergeWithCurrentBibs({ bibs: [...updatedCoBibs] }));
        });

        // eslint-disable-next-line consistent-return
        return () => unsubscribeCoBibs();
    }, [currentUser]);

    return (
        <main className="min-h-screen bg-neutral-white p-5 font-sans text-neutral-black">
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
