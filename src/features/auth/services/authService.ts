import { supabase } from "@/shared/lib/supabaseClient";

export async function signInWithEmailPassword(
  email: string,
  password: string
) {
  return supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
}

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
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
    },
  });
}

export async function getCurrentUser() {
  return supabase.auth.getUser();
}

export async function signOutUser() {
  return supabase.auth.signOut();
}

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
