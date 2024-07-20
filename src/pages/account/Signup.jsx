import { useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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

    async function handleSubmit(event) {
        event.preventDefault();

        if (passwordRef.current.value !== passwordConfirmRef.current.value) {
            setError("Passwords do not match.");
        } else {
            try {
                setError("");
                setIsLoading(true);
                await signup(emailRef.current.value, passwordRef.current.value, nameRef.current.value);
                // const credintials = await signup(emailRef.current.value, passwordRef.current.value, nameRef.current.value);

                // if (!currentUser) return;

                // const userDocRef = doc(firestoreDB, "users", currentUser.uid);
                // const docSnap = await getDoc(userDocRef);

                // if (docSnap.exists()) {
                //     const userData = docSnap.data();
                //     console.log(userData);
                //     if (userData?.bibliographies) {
                //         dispatch(mergeWithCurrentBibs({ bibs: JSON.parse(userData.bibliographies) }));
                //     }
                //     if (userData?.settings) {
                //         dispatch(mergeWithCurrentSettings({ settings: JSON.parse(userData.settings) }));
                //     }
                // } else {
                //     modal.open({
                //         title: "Associate current data with this email?",
                //         message:
                //             "Do you want to associate your current data with this email? If you press 'No', your current data will be lost forever. If you press 'Yes' your current data will be saved on the server with your email.",
                //         actions: [
                //             [
                //                 "Yes",
                //                 () =>
                //                     setDoc(doc(firestoreDB, "users", currentUser.uid), {
                //                         bibliographies: JSON.stringify(bibliographies),
                //                         settings: JSON.stringify(settings),
                //                     }),
                //                 { autoFocus: true },
                //             ],
                //             ["No", () => dispatch(deleteAllBibs())],
                //         ],
                //     });
                // }

                navigate("/");
                // TODO: Show success toast message
            } catch (tError) {
                setError(`Failed to create an account: ${tError}`);
            }

            setIsLoading(false);
        }
    }

    return (
        <div>
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
        </div>
    );
}
