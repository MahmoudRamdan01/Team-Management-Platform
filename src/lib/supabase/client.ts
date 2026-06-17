import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon key, cookie-backed session).
 * This is one of the very few modules permitted to import the Supabase SDK.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
