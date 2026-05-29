"use client";

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/supabase/database";
import { getSupabasePublishableKey, getSupabaseUrl, hasSupabaseConfig } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) return null;

  browserClient ??= createBrowserClient<Database>(
    getSupabaseUrl(),
    getSupabasePublishableKey()
  );

  return browserClient;
}
