import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const { error } =
                await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });

            if (error) {
                setError(
                    error.message === "Invalid login credentials"
                        ? "Invalid email or password."
                        : error.message
                );
                return;
            }

            // Successful login
            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                {/* BRAND */}
                <div className="login-brand">
                    KEIAN
                </div>

                <p className="login-subtitle">
                    THE ART OF FRAGRANCE
                </p>

                {/* HEADING */}
                <h1>Welcome Back</h1>

                <p className="login-description">
                    Sign in to continue your KEIAN experience.
                </p>

                {/* FORM */}
                <form
                    className="login-form"
                    onSubmit={handleLogin}
                >

                    {/* EMAIL */}
                    <div className="login-input-group">
                        <label htmlFor="login-email">
                            Email
                        </label>

                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                        />
                    </div>

                    {/* PASSWORD */}
                    <div className="login-input-group">
                        <label htmlFor="login-password">
                            Password
                        </label>

                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    {/* BUTTON */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "SIGNING IN..."
                            : "SIGN IN"}
                    </button>
                </form>

                {/* REGISTER */}
                <div className="login-register">
                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Register
                    </Link>
                </div>

                {/* HOME */}
                <Link
                    to="/"
                    className="login-home"
                >
                    ← Back to Store
                </Link>
            </div>
        </div>
    );
}

export default Login;