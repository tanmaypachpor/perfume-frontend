
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
    verifySignupOtp,
    resendSignupOtp,
} from "@/features/auth/services/authService";

import "@/features/auth/pages/VerifyOtp.css";

export default function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();

    const email = (
        location.state as { email?: string } | null
    )?.email ?? "";

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleVerify = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!email) {
            setError(
                "Registration email is missing. Please register again."
            );
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError("Please enter the 6-digit verification code.");
            return;
        }

        setLoading(true);

        try {
            const { error: verifyError } = await verifySignupOtp(
                email,
                otp
            );

            if (verifyError) {
                setError(
                    "Verification failed. Check the code and try again."
                );
                return;
            }

            setMessage(
                "Email verified successfully. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1200);
        } catch {
            setError(
                "Unable to verify your email. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setMessage("");

        if (!email) {
            setError(
                "Registration email is missing. Please register again."
            );
            return;
        }

        setResending(true);

        try {
            const { error: resendError } =
                await resendSignupOtp(email);

            if (resendError) {
                setError(resendError.message);
                return;
            }

            setOtp("");
            setMessage(
                "A new verification code has been requested. Check your inbox."
            );
        } catch {
            setError(
                "Unable to resend the code. Please try again."
            );
        } finally {
            setResending(false);
        }
    };

    return (
        <main className="verify-page">
            <section className="verify-card">
                <div className="verify-brand">KEIAN</div>

                <p className="verify-eyebrow">
                    THE ART OF FRAGRANCE
                </p>

                <h1>
                    Verify your <em>email</em>
                </h1>

                <p className="verify-description">
                    Enter the 6-digit verification code sent to:
                </p>

                {email ? (
                    <p className="verify-email">{email}</p>
                ) : (
                    <p className="verify-error" role="alert">
                        Registration email not found. Please register again.
                    </p>
                )}

                {error && (
                    <p className="verify-error" role="alert">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="verify-success" role="status">
                        {message}
                    </p>
                )}

                <form onSubmit={handleVerify}>
                    <label htmlFor="verification-code">
                        VERIFICATION CODE
                    </label>

                    <input
                        id="verification-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(event) =>
                            setOtp(
                                event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 6)
                            )
                        }
                        required
                        disabled={loading || !email}
                    />

                    <button
                        type="submit"
                        disabled={loading || !email}
                    >
                        {loading ? "VERIFYING..." : "VERIFY EMAIL"}
                    </button>
                </form>

                <button
                    type="button"
                    className="verify-resend"
                    onClick={handleResend}
                    disabled={resending || loading || !email}
                >
                    {resending
                        ? "SENDING..."
                        : "Resend verification code"}
                </button>

                <Link to="/register" className="verify-back">
                    Back to registration
                </Link>
            </section>
        </main>
    );
}