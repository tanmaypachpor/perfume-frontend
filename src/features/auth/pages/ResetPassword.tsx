
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { updateUserPassword } from "@/features/auth/services/authService";
import "./ForgotPassword.css";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await updateUserPassword(password);

      if (error) {
        setError(error.message);
        return;
      }

      navigate("/login", {
        replace: true,
        state: {
          message: "Password updated successfully. Please log in.",
        },
      });
    } catch {
      setError("Unable to update your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="password-page">
      <section className="password-card">
        <div className="password-brand">KEIAN</div>
        <p className="password-eyebrow">THE ART OF FRAGRANCE</p>

        <h1>Reset Password</h1>
        <p>Enter and confirm your new password below.</p>

        {error && (
          <p className="password-error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password">NEW PASSWORD</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            placeholder="Enter new password"
            required
            disabled={loading}
          />

          <label htmlFor="confirm-password">CONFIRM NEW PASSWORD</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            placeholder="Re-enter new password"
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "UPDATING..." : "UPDATE PASSWORD"}
          </button>
        </form>

        <Link to="/login" className="password-back">
          Back to login
        </Link>
      </section>
    </main>
  );
}