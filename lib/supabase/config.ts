const projectUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://trriwrhvjylrldqvmhgk.supabase.co";

const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export function getSupabaseUrl() {
  return projectUrl;
}

export function getSupabasePublishableKey() {
  return publishableKey;
}

export function hasSupabaseConfig() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}
