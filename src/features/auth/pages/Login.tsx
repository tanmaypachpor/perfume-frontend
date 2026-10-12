
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "@/shared/components/ui/FormField";
import {
    signInWithEmailPassword,
} from "@/features/auth/services/authService";
import "@/features/auth/pages/Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const { error } = await signInWithEmailPassword(
                email,
                password
            );

            if (error) {
                setError(
                    error.message === "Invalid login credentials"
                        ? "Invalid email or password."
                        : error.message
                );
                return;
            }

            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">KEIAN</div>

                <p className="login-subtitle">
                    THE ART OF FRAGRANCE
                </p>

                <h1>Welcome Back</h1>

                <p className="login-description">
                    Sign in to continue your KEIAN experience.
                </p>

                <form className="login-form" onSubmit={handleLogin}>
                    <FormField
                        id="login-email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        autoComplete="email"
                        required
                    />

                    <FormField
                        id="login-password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                    />

                    {/* FORGOT PASSWORD */}
                    <div className="login-forgot-password">
                        <Link to="/forgot-password">
                            Forgot password?
                        </Link>
                    </div>

                    {error && (
                        <div className="login-error" role="alert">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? "SIGNING IN..." : "SIGN IN"}
                    </button>
                </form>

                <div className="login-register">
                    <span>Don't have an account?</span>
                    <Link to="/register">Register</Link>
                </div>

                <Link to="/" className="login-home">
                    ← Back to Store
                </Link>
            </div>
        </div>
    );
}

export default Login;