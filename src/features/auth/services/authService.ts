
import { supabase } from "@/shared/lib/supabaseClient";

// Login with email and password
export async function signInWithEmailPassword(
  email: string,
  password: string
) {
  return supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
}

// Register a new user
export async function signUpWithEmailPassword({
  email,
  password,
  fullName,
  phone,
}: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}) {
  return supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        phone: phone.trim(),
      },
    },
  });
}

// Verify signup OTP
export async function verifySignupOtp(
  email: string,
  token: string
) {
  return supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: "signup",
  });
}

// Resend signup verification OTP
export async function resendSignupOtp(email: string) {
  return supabase.auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
  });
}

// Send password recovery email
export async function sendPasswordResetEmail(email: string) {
  return supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    {
      redirectTo: `${window.location.origin}/reset-password`,
    }
  );
}

// Update password for the authenticated recovery session
export async function updateUserPassword(password: string) {
  return supabase.auth.updateUser({
    password,
  });
}

// Get the currently authenticated user
export async function getCurrentUser() {
  return supabase.auth.getUser();
}

// Sign out the current user
export async function signOutUser() {
  return supabase.auth.signOut();
}

// Check whether the current user is an admin
export async function isAdminUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return false;
  }

  const { data, error } = await supabase.rpc("is_admin");

  return !error && data === true;
}