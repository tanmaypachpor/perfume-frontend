import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "@/features/account/pages/Account.css";
import { supabase } from "@/shared/lib/supabaseClient";
import {
    AccountProfileCard,
    type AccountProfile,
} from "@/features/account/components/AccountProfileCard";

function Account() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState<AccountProfile>({
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
        field: keyof AccountProfile,
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

                    <AccountProfileCard
                        profile={profile}
                        message={message}
                        error={error}
                        saving={saving}
                        onChange={handleChange}
                        onSave={handleSave}
                    />

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
