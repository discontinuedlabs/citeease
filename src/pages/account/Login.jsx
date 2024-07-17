import { useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const id = useId();
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setError("");
            setIsLoading(true);
            await login(emailRef.current.value, passwordRef.current.value);
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
