import React, { useState } from "react";
import { supabase } from "./lib/supabaseClient";

export default function CustomerAuth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle Email/Password Signup or Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
          emailRedirectTo: `${window.location.origin}/account`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user && data.user.identities?.length === 0) {
        setError("This email is already registered. Please log in.");
      } else {
        setMessage("Account created! Please check your email inbox to verify your account.");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        window.location.href = "/account";
      }
    }
    setLoading(false);
  };

  // Handle Google OAuth Login
  const handleGoogleLogin = async () => {
    setError("");
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/account`,
      },
    });

    if (googleError) setError(googleError.message);
  };

  return (
    <div style={{ maxWidth: "420px", margin: "50px auto", padding: "20px", border: "1px solid #ddd" }}>
      <h2>{isSignUp ? "Create KEIAN Account" : "Customer Login"}</h2>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <>
            <div style={{ marginBottom: "10px" }}>
              <label>Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", padding: "8px", marginTop: "4px" }}
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: "10px" }}>
          <label>Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px", marginTop: "4px" }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px", marginBottom: "10px" }}>
          {loading ? "Processing..." : isSignUp ? "Sign Up" : "Log In"}
        </button>
      </form>

      <button
        onClick={handleGoogleLogin}
        style={{ width: "100%", padding: "10px", backgroundColor: "#4285F4", color: "#fff", border: "none" }}
      >
        Continue with Google
      </button>

      <p style={{ marginTop: "15px", textAlign: "center" }}>
        {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ background: "none", border: "none", color: "blue", textDecoration: "underline", cursor: "pointer" }}
        >
          {isSignUp ? "Log in here" : "Sign up here"}
        </button>
      </p>
    </div>
  );
}