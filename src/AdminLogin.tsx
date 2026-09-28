import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import "./AdminLogin.css";

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

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

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

                    <div className="admin-input-group">
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Admin email"
                            required
                        />
                    </div>

                    <div className="admin-input-group">
                        <label>Password</label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                    </div>

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