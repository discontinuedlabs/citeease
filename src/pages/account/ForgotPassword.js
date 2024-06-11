import { useId, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
        } catch (error) {
            setError("Failed to reset password: " + error);
        }

        setIsLoading(false);
    }

    return (
        <div>
            <h1>Forgot password</h1>
            <pre>{error}</pre>
            <form onSubmit={handleSUbmit}>
                <label htmlFor={`${id}-email`}>Email</label>
                <input type="email" ref={emailRef} />
                <button type="submit" disabled={isLoading}>
                    Reset password
                </button>
            </form>
        </div>
    );
}
