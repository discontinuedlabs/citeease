import { useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import db from "../../data/db/firebase/firebase";
import { mergeWithCurrent as mergeWithCurrentSettings } from "../../data/store/slices/settingsSlice";
import { mergeWithCurrent as mergeWithCurrentBibs } from "../../data/store/slices/bibsSlice";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const id = useId();
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setError("");
            setIsLoading(true);
            const credintials = await login(emailRef.current.value, passwordRef.current.value);

            const userDocRef = doc(db, "users", credintials.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                console.log(userData);
                if (userData?.bibliographies) {
                    dispatch(mergeWithCurrentBibs({ bibs: JSON.parse(userData.bibliographies) }));
                }
                if (userData?.settings) {
                    dispatch(mergeWithCurrentSettings({ settings: JSON.parse(userData.settings) }));
                }
            }

            navigate("/");
            // TODO: Show success toast message
        } catch (tError) {
            setError(`Failed to sign in: ${tError}`);
        }

        setIsLoading(false);
    }

    return (
        <div>
            <div>
                <h1>Log in</h1>
                <pre>{error}</pre>
                <form onSubmit={handleSubmit}>
                    <label htmlFor={`${id}-email`}>
                        Email
                        <input id={`${id}-email`} type="email" ref={emailRef} required />
                    </label>
                    <label htmlFor={`${id}-password`}>
                        Password
                        <input id={`${id}-password`} type="password" ref={passwordRef} required />
                    </label>
                    <Link to="/forgot-password">Forgot password?</Link>
                    <button type="submit" disabled={isLoading}>
                        Log in
                    </button>
                </form>
            </div>
            <p>
                Don&apos;t have an account? <Link to="/signup">Sign up</Link>.
            </p>
        </div>
    );
}
