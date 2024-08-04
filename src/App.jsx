import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { doc, onSnapshot } from "firebase/firestore";
import Bibliography from "./pages/bibliography/Bibliography";
import Home from "./pages/home/Home";
import { deleteBib, loadFromIndexedDB as loadBibs, mergeWithCurrentBibs } from "./data/store/slices/bibsSlice";
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
import { useToast } from "./context/ToastContext.tsx";

export default function App() {
    const { data: bibliographies, loadedFromIndexedDB: bibsLoaded } = useSelector((state) => state.bibliographies); // WATCH: In some browsers, state.bibliographies may display [object Object] on subsequent renders in StrictMode
    const { currentUser } = useAuth();
    const dispatch = useDispatch();
    const toast = useToast();
    useDynamicTitle();

    useEffect(() => {
        dispatch(loadBibs());
        dispatch(loadSettings());
    }, []);

    useEffect(() => {
        if (!currentUser || !bibsLoaded) return;
        const coBibsIds = bibliographies.filter((bib) => bib?.collab?.open).map((bib) => bib.collab.id);
        coBibsIds.forEach((id) => {
            const unsubscribe = onSnapshot(doc(firestoreDB, "coBibs", id), (sDoc) => {
                const parsedCoBib = JSON.parse(sDoc.data().bibliography);
                console.log(
                    currentUser.uid,
                    parsedCoBib.collab.collaborators,
                    parsedCoBib.collab.collaborators.some((co) => co.id === currentUser.uid)
                );
                if (!parsedCoBib.collab.collaborators.some((co) => co.id === currentUser.uid)) {
                    // remove the user from the bibliography if they were removed by admin
                    dispatch(deleteBib({ bibliographyId: parsedCoBib.id }));
                    toast.show({
                        message: `You were removed from \`${parsedCoBib.title}\` collaborative bibliography`,
                        icon: "group",
                        color: "red",
                    });
                } else {
                    dispatch(mergeWithCurrentBibs({ bibs: [parsedCoBib] }));
                }
            });
            return () => unsubscribe();
        });
    }, [currentUser, bibsLoaded]);

    return (
        <main className="min-h-screen font-sans">
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
