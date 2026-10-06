import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FormField } from "@/shared/components/ui/FormField";
import { signInWithEmailPassword } from "@/features/auth/services/authService";
import "@/features/admin/pages/AdminLogin.css";

function AdminLogin() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        const { error } = await signInWithEmailPassword(
            email,
            password
        );

        setLoading(false);

        if (error) {
            setError("Invalid email or password.");
            return;
        }

        navigate("/admin/orders");
    };

    return (
        <div className="admin-login-page">

            <div className="admin-login-card">

                <div className="admin-login-brand">
                    KEIAN
                </div>

                <p className="admin-login-subtitle">
                    ADMINISTRATION
                </p>

                <h1>Welcome Back</h1>

                <p className="admin-login-description">
                    Sign in to manage your KEIAN store.
                </p>

                <form onSubmit={handleLogin}>

                    <FormField
                        id="admin-email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Admin email"
                        containerClassName="admin-input-group"
                        required
                    />

                    <FormField
                        id="admin-password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        containerClassName="admin-input-group"
                        required
                    />

                    {error && (
                        <div className="admin-login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="admin-login-button"
                    >
                        {loading ? "SIGNING IN..." : "SIGN IN"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default AdminLogin;