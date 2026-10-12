
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { FormField } from "@/shared/components/ui/FormField";
import { signUpWithEmailPassword } from "@/features/auth/services/authService";
import "@/features/auth/pages/Register.css";

function Register() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const cleanFullName = fullName.trim();
        const cleanPhone = phone.trim();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanFullName) {
            setError("Please enter your full name.");
            return;
        }

        if (!cleanPhone) {
            setError("Please enter your phone number.");
            return;
        }

        if (!/^[0-9]{10}$/.test(cleanPhone)) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }

        if (!cleanEmail) {
            setError("Please enter your email address.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const {
                data,
                error: signUpError,
            } = await signUpWithEmailPassword({
                email: cleanEmail,
                password,
                fullName: cleanFullName,
                phone: cleanPhone,
            });

            if (signUpError) {
                const message = signUpError.message.toLowerCase();

                if (message.includes("invalid email")) {
                    throw new Error(
                        "Please enter a valid email address."
                    );
                }

                if (
                    message.includes("already registered") ||
                    message.includes("already exists")
                ) {
                    throw new Error(
                        "This email may already be registered. Please sign in or try password recovery."
                    );
                }

                throw signUpError;
            }

            if (!data.user) {
                throw new Error(
                    "Unable to create your account. Please try again."
                );
            }

            // Avoid treating an existing account as a new registration.
            if (
                data.user.identities &&
                data.user.identities.length === 0
            ) {
                throw new Error(
                    "This email may already be registered. Please sign in instead."
                );
            }

            // If email confirmation is enabled, signup normally
            // returns no session until the email has been verified.
            if (!data.session) {
                setSuccess(
                    "Account created. Please check your email for the 6-digit verification code."
                );

                navigate("/verify-otp", {
                    state: { email: cleanEmail },
                });

                return;
            }

            // If confirmation is disabled, Supabase may create
            // a session immediately. Do not pretend OTP was sent.
            setSuccess(
                "Your account was created. Email verification is currently not required."
            );

            setFullName("");
            setPhone("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

            navigate("/login", { replace: true });
        } catch (err: unknown) {
            console.error("Registration failed.");

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(
                    "Unable to create your account. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-brand-section">
                <div className="register-brand">
                    KEIAN
                </div>

                <div className="register-brand-content">
                    <span>THE ART OF FRAGRANCE</span>

                    <h1>
                        Discover your
                        <em> signature.</em>
                    </h1>

                    <p>
                        Create your KEIAN account and
                        experience a world of refined
                        fragrances.
                    </p>
                </div>
            </div>

            <div className="register-form-section">
                <div className="register-form-container">
                    <div className="register-header">
                        <span className="register-eyebrow">
                            WELCOME TO KEIAN
                        </span>

                        <h2>
                            Create <em>Account</em>
                        </h2>

                        <p>
                            Join KEIAN and manage your
                            orders with ease.
                        </p>
                    </div>

                    {error && (
                        <div
                            className="register-message register-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    {success && (
                        <div
                            className="register-message register-success"
                            role="status"
                        >
                            {success}
                        </div>
                    )}

                    <form
                        onSubmit={handleRegister}
                        className="register-form"
                    >
                        <FormField
                            id="fullName"
                            label="FULL NAME"
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(event) =>
                                setFullName(event.target.value)
                            }
                            autoComplete="name"
                            disabled={loading}
                            containerClassName="register-field"
                        />

                        <FormField
                            id="phone"
                            label="PHONE NUMBER"
                            type="tel"
                            placeholder="Enter your 10-digit phone number"
                            value={phone}
                            onChange={(event) =>
                                setPhone(
                                    event.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 10)
                                )
                            }
                            autoComplete="tel"
                            disabled={loading}
                            containerClassName="register-field"
                        />

                        <FormField
                            id="email"
                            label="EMAIL ADDRESS"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            autoComplete="email"
                            disabled={loading}
                            containerClassName="register-field"
                        />

                        <FormField
                            id="password"
                            label="PASSWORD"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            autoComplete="new-password"
                            disabled={loading}
                            containerClassName="register-field"
                        />

                        <FormField
                            id="confirmPassword"
                            label="CONFIRM PASSWORD"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            autoComplete="new-password"
                            disabled={loading}
                            containerClassName="register-field"
                        />

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="register-spinner" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    CREATE ACCOUNT
                                    <span>→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="register-login">
                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Sign In
                        </Link>
                    </div>

                    <Link
                        to="/"
                        className="register-back"
                    >
                        ← Back to KEIAN
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;

