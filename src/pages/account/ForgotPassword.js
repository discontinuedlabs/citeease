import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPassword() {
    const id = useId();
    const emailRef = useRef(null);
    const { resetPassword } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSUbmit(event) {
        event.preventDefault();

        try {
            setError("");
            setIsLoading(true);
            await resetPassword(emailRef.current.value);
            navigate("/");
            // TODO: Show success toast message
        } catch (tError) {
            setError(`Failed to reset password: ${tError}`);
        }

        setIsLoading(false);
    }

    return (
        <div>
            <h1>Forgot password</h1>
            <pre>{error}</pre>
            <form onSubmit={handleSUbmit}>
                <label htmlFor={`${id}-email`}>
                    Email
                    <input type="email" ref={emailRef} />
                </label>
                <button type="submit" disabled={isLoading}>
                    Reset password
                </button>
            </form>
        </div>
    );
}
