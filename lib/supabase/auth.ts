"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function signInWithMagicLink(email: string) {
  const client = getSupabaseBrowserClient();
  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/app/profile`
      : undefined;

  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo }
  });

  if (error) throw error;
}

export async function signOutFromSupabase() {
  const client = getSupabaseBrowserClient();
  if (!client) return;

  const { error } = await client.auth.signOut();
  if (error) throw error;
}
