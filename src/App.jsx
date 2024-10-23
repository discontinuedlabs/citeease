import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";

// Pages
import Bibliography from "./pages/bibliography/Bibliography";
import Home from "./pages/home/Home";
import Settings from "./pages/settings/Settings";
import BibSettings from "./pages/bibliography/BibSettings";
import MarkdownPage from "./pages/MarkdownPage";
import NotFoundPage from "./pages/NotFoundPage";
import Signup from "./pages/account/Signup";
import Login from "./pages/account/Login";
import Account from "./pages/account/Account";
import ForgotPassword from "./pages/account/ForgotPassword";

// Store actions
import { loadFromIndexedDB as loadBibs } from "./data/store/slices/bibsSlice";
import { loadFromIndexedDB as loadSettings } from "./data/store/slices/settingsSlice";

// Context and Hooks
import { useDocumentTitle, useMetaThemeColor, useUserDataSync } from "./hooks/hooks.tsx";

export default function App() {
    const dispatch = useDispatch();

    useDocumentTitle(); // Dynamically change the page title based on an H1 element content
    useMetaThemeColor(); // Update the theme color of the application dynamically (for mobile)
    useUserDataSync(); // Synchronize user data

    // Load data from IndexedDB on initial render
    useEffect(() => {
        dispatch(loadBibs());
        dispatch(loadSettings());
    }, [dispatch]);

    return (
        <main className="relative min-h-screen font-sans">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/account" element={<Account />} /> {/* Redirect to "/login" when !currentUser */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/bib/collab?/:bibId" element={<Bibliography />} />
                <Route path="/bib/collab?/:bibId/settings" element={<BibSettings />} />
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
