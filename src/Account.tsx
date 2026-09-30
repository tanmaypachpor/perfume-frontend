import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Account.css";
import { supabase } from "./lib/supabaseClient";

interface UserProfile {
    full_name: string;
    email: string;
    phone: string;
}

function Account() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfile>({
        full_name: "",
        email: "",
        phone: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError || !user) {
                navigate("/login");
                return;
            }

            setProfile({
                full_name: user.user_metadata?.full_name || "",
                email: user.email || "",
                phone: user.user_metadata?.phone || "",
            });
        } catch (err) {
            console.error("Account loading error:", err);
            setError("Unable to load account details.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        field: keyof UserProfile,
        value: string
    ) => {
        setProfile((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const { error: updateError } =
                await supabase.auth.updateUser({
                    data: {
                        full_name: profile.full_name.trim(),
                        phone: profile.phone.trim(),
                    },
                });

            if (updateError) {
                setError(updateError.message);
                return;
            }

            setMessage(
                "Account details updated successfully."
            );
        } catch (err) {
            console.error(
                "Profile update error:",
                err
            );

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = async () => {
        setLoggingOut(true);
        setError("");

        try {
            const { error: logoutError } =
                await supabase.auth.signOut();

            if (logoutError) {
                console.error(
                    "Logout error:",
                    logoutError
                );

                setError(
                    "Unable to logout. Please try again."
                );

                return;
            }

            navigate("/");
        } catch (err) {
            console.error(
                "Logout error:",
                err
            );

            setError(
                "Something went wrong while logging out."
            );
        } finally {
            setLoggingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="account-loading">
                Loading your account...
            </div>
        );
    }

    return (
        <div className="account-page">
            <div className="account-container">

                {/* HEADER */}

                <div className="account-header">

                    <span className="account-eyebrow">
                        KEIAN
                    </span>

                    <h1>
                        My Account
                    </h1>

                    <p>
                        Manage your personal information
                        and account details.
                    </p>

                </div>

                <div className="account-content">

                    {/* PERSONAL INFORMATION */}

                    <div className="account-card">

                        <div className="account-card-header">

                            <h2>
                                Personal Information
                            </h2>

                            <p>
                                Update your details
                                associated with your
                                KEIAN account.
                            </p>

                        </div>

                        <div className="account-form">

                            {/* NAME */}

                            <div className="account-field">

                                <label htmlFor="full_name">
                                    NAME
                                </label>

                                <input
                                    id="full_name"
                                    type="text"
                                    value={
                                        profile.full_name
                                    }
                                    onChange={(event) =>
                                        handleChange(
                                            "full_name",
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Enter your name"
                                />

                            </div>

                            {/* EMAIL */}

                            <div className="account-field">

                                <label htmlFor="email">
                                    EMAIL
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={
                                        profile.email
                                    }
                                    disabled
                                />

                                <small>
                                    Email is linked to your
                                    login account.
                                </small>

                            </div>

                            {/* PHONE */}

                            <div className="account-field">

                                <label htmlFor="phone">
                                    PHONE
                                </label>

                                <input
                                    id="phone"
                                    type="tel"
                                    value={
                                        profile.phone
                                    }
                                    maxLength={10}
                                    onChange={(event) =>
                                        handleChange(
                                            "phone",
                                            event.target.value
                                                .replace(
                                                    /\D/g,
                                                    ""
                                                )
                                                .slice(
                                                    0,
                                                    10
                                                )
                                        )
                                    }
                                    placeholder="Enter your 10-digit phone number"
                                />

                            </div>

                            {/* SUCCESS */}

                            {message && (
                                <div className="account-success">
                                    {message}
                                </div>
                            )}

                            {/* ERROR */}

                            {error && (
                                <div className="account-error">
                                    {error}
                                </div>
                            )}

                            {/* SAVE */}

                            <button
                                type="button"
                                className="account-save-btn"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving
                                    ? "SAVING..."
                                    : "SAVE CHANGES"}
                            </button>

                        </div>
                    </div>

                    {/* SIDE ACTIONS */}

                    <div className="account-actions">

                        {/* MY ORDERS */}

                        <button
                            type="button"
                            className="account-action-card"
                            onClick={() =>
                                navigate("/orders")
                            }
                        >
                            <span>
                                MY ORDERS
                            </span>

                            <strong>
                                View your orders →
                            </strong>

                        </button>

                        {/* LOGOUT */}

                        <button
                            type="button"
                            className="account-action-card account-logout-card"
                            onClick={handleLogout}
                            disabled={loggingOut}
                        >
                            <span>
                                ACCOUNT
                            </span>

                            <strong>
                                {loggingOut
                                    ? "LOGGING OUT..."
                                    : "LOGOUT →"}
                            </strong>

                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default Account;
