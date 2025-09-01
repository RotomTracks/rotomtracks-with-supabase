import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_CLIENT_AUTH || process.env.NEXT_PUBLIC_DATABASE_TOKEN || process.env.NEXT_PUBLIC_CLIENT_ID || process.env.NEXT_PUBLIC_API_KEY || process.env.NEXT_PUBLIC_DATABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
  );
}
