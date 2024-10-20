import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import db from "../../data/db/firebase/firebase";
import { replaceAllSettings } from "../../data/store/slices/settingsSlice";
import { mergeWithCurrentBibs, replaceAllBibs } from "../../data/store/slices/bibsSlice";
import { useToast } from "../../context/ToastContext.tsx";
import { FilledButton, TextField, TopBar } from "../../components/ui/MaterialComponents";
import defaults from "../../assets/json/defaults.json";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const toast = useToast();

    async function retreiveCoBibs(bibs) {
        const coBibIds = bibs.filter((bib) => bib?.collab?.open).map((bib) => bib.collab.id);

        const promises = coBibIds.map(async (coBibId) => {
            const coBibDocRef = doc(db, "coBibs", coBibId);
            const coBibDocSnap = await getDoc(coBibDocRef);
            if (coBibDocSnap.exists()) {
                const parsedCoBib = JSON.parse(coBibDocSnap.data().bibliography);
                return parsedCoBib;
            }
            return null;
        });

        const results = await Promise.all(promises);

        const validResults = results.filter((result) => result !== null);

        dispatch(mergeWithCurrentBibs({ bibs: [...validResults] }));

        return validResults;
    }

    async function retreiveUserData(credintials) {
        const userDocRef = doc(db, "users", credintials.uid);
        const userDocSnap = await getDoc(userDocRef);

        let bibs;
        let settings;

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData?.bibliographies) {
                bibs = JSON.parse(userData.bibliographies);
                dispatch(replaceAllBibs({ bibs }));
            }
            if (userData?.settings) {
                settings = JSON.parse(userData.settings);
                dispatch(replaceAllSettings({ settings }));
            }
        }

        return { bibliographies: bibs, settings };
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setError("");
            setIsLoading(true);
            const credintials = await login(emailRef.current.value, passwordRef.current.value);

            const { bibliographies } = await retreiveUserData(credintials);
            await retreiveCoBibs(bibliographies);

            navigate("/");
            toast.show({ message: "You successfully logged in", color: "green", icon: "check" });
        } catch (tError) {
            setError(`Failed to sign in: ${tError}`);
        }

        setIsLoading(false);
    }

    return (
        <div className={defaults.classes.page}>
            <TopBar headline="Log in" />

            <form className="grid gap-2 px-5" onSubmit={handleSubmit}>
                {error.length !== 0 && <pre className="error">Error signing in!</pre>}
                <TextField label="Email" type="email" ref={emailRef} required />
                <TextField label="Password" type="password" ref={passwordRef} required />

                <Link to="/forgot-password">Forgot password?</Link>
                <FilledButton className={defaults.classes.wideButton} type="submit" disabled={isLoading}>
                    Log in
                </FilledButton>

                <p>
                    Don&apos;t have an account? <Link to="/signup">Sign up</Link>.
                </p>
            </form>
        </div>
    );
}
