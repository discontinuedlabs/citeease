import { useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import db from "../../data/db/firebase/firebase";
import { useModal } from "../../context/ModalContext.tsx";
import { deleteAllBibs } from "../../data/store/slices/bibsSlice";

export default function Signup() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const id = useId();
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const nameRef = useRef();
    const { signup } = useAuth();
    const navigate = useNavigate();
    const bibliographies = useSelector((state) => state.bibliographies);
    const settings = useSelector((state) => state.settings);
    const modal = useModal();
    const dispatch = useDispatch();

    function moveLocalDataToFirestore(credintials) {
        setDoc(doc(db, "users", credintials.uid), {
            bibliographies: JSON.stringify(bibliographies),
            settings: JSON.stringify(settings),
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            setError("Passwords do not match.");
        } else {
            try {
                setError("");
                setIsLoading(true);
                const credintials = await signup(
                    emailRef.current.value,
                    passwordRef.current.value,
                    nameRef.current.value
                );

                if (bibliographies.length > 0) {
                    modal.open({
                        title: "Associate current data with this email?",
                        message:
                            "Do you want to associate your current data with this email? Choosing 'No' will delete your current data permanently.",
                        actions: [
                            ["Yes", () => moveLocalDataToFirestore(credintials), { autoFocus: true }],
                            ["No", () => dispatch(deleteAllBibs())],
                        ],
                    });
                }

                navigate("/");
                // TODO: Show success toast message
            } catch (tError) {
                setError(`Failed to create an account: ${tError}`);
            }

            setIsLoading(false);
        }
    }

    return (
        <>
            <div>
                <h1>Sign Up</h1>
                <pre>{error}</pre>
                <form onSubmit={handleSubmit}>
                    <label htmlFor={`${id}-name`}>
                        Name
                        <input id={`${id}-name`} type="text" ref={nameRef} required />
                    </label>
                    <label htmlFor={`${id}-email`}>
                        Email
                        <input id={`${id}-email`} type="email" ref={emailRef} required />
                    </label>
                    <label htmlFor={`${id}-password`}>
                        Password
                        <input id={`${id}-password`} type="password" ref={passwordRef} required />
                    </label>
                    <label htmlFor={`${id}-password-confirm`}>
                        Password confirmation
                        <input id={`${id}-password-confirm`} type="password" ref={passwordConfirmRef} required />
                    </label>
                    <button type="submit" disabled={isLoading}>
                        Sign up
                    </button>
                </form>
            </div>
            <p>
                Already have an account? <Link to="/login">Log in</Link>.
            </p>
        </>
    );
}
