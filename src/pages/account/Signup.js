import { useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Signup() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const id = useId();
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const passwordConfirmRef = useRef(null);
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
                await signup(emailRef.current.value, passwordRef.current.value);
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
                    <label htmlFor={`${id}-email`}>Email</label>
                    <input id={`${id}-email`} type="email" ref={emailRef} required />
                    <label htmlFor={`${id}-password`}>Password</label>
                    <input id={`${id}-password`} type="password" ref={passwordRef} required />
                    <label htmlFor={`${id}-password-confirm`}>Password confirmation</label>
                    <input id={`${id}-password-confirm`} type="password" ref={passwordConfirmRef} required />
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
