import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../context/AuthContext";
import db from "../../data/db/firebase/firebase";
import { deleteAllBibs } from "../../data/store/slices/bibsSlice";
import { useDialog } from "../../context/DialogContext.tsx";
import { FilledButton, TextField, TopBar } from "../../components/ui/MaterialComponents";

export default function Signup() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const nameRef = useRef();
    const { signup } = useAuth();
    const navigate = useNavigate();
    const bibliographies = useSelector((state) => state.bibliographies);
    const settings = useSelector((state) => state.settings);
    const dialog = useDialog();
    const dispatch = useDispatch();

    function moveLocalDataToFirestore(credintials) {
        setDoc(doc(db, "users", credintials.uid), {
            bibliographies: JSON.stringify(bibliographies),
            settings: JSON.stringify(settings),
        });
        navigate("/");
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

                if (bibliographies.length !== 0) {
                    dialog.show({
                        headline: "Associate current data with this email?",
                        content:
                            "Do you want to associate your current data with this email? Choosing `No` will delete your current data permanently.",
                        actions: [
                            ["Yes", () => moveLocalDataToFirestore(credintials), { autoFocus: true }],
                            [
                                "No",
                                () => {
                                    dispatch(deleteAllBibs());
                                    navigate("/");
                                },
                            ],
                        ],
                    });
                }

                // TODO: Show success toast message
            } catch (tError) {
                setError(`Failed to create an account: ${tError}`);
            }

            setIsLoading(false);
        }
    }

    return (
        <div className="page">
            <TopBar headline="Sign up" />

            <form className="grid gap-2 px-5" onSubmit={handleSubmit}>
                {error.length !== 0 && <pre className="error">Error signing in!</pre>}
                <TextField label="Name" type="text" ref={nameRef} required />
                <TextField label="Email" type="email" ref={emailRef} required />
                <TextField label="Password" type="password" ref={passwordRef} required />
                <TextField label="Password confirmation" type="password" ref={passwordConfirmRef} required />

                <FilledButton className="wide-button" type="submit" disabled={isLoading}>
                    Sign up
                </FilledButton>

                <p className="text-center">
                    Already have an account?{" "}
                    <Link to="/login" replace>
                        Log in
                    </Link>
                    .
                </p>
            </form>
        </div>
    );
}
