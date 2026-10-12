
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "@/features/auth/services/authService";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await sendPasswordResetEmail(cleanEmail);

      if (error) {
        setError(error.message);
        return;
      }

      setMessage(
        "If an account exists for this email, a password reset link will be sent."
      );
    } catch {
      setError("Unable to send the reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="password-page">
      <section className="password-card">
        <div className="password-brand">KEIAN</div>
        <p className="password-eyebrow">THE ART OF FRAGRANCE</p>

        <h1>Forgot Password?</h1>
        <p>Enter your registered email to receive a password reset link.</p>

        {error && <p className="password-error" role="alert">{error}</p>}
        {message && <p className="password-success" role="status">{message}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-email">EMAIL ADDRESS</label>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email address"
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? "SENDING..." : "SEND RESET LINK"}
          </button>
        </form>

        <Link to="/login" className="password-back">
          Back to login
        </Link>
      </section>
    </main>
  );
}