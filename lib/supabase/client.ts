import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig, getClientOptions } from "./config";

export function createClient() {
  const config = getSupabaseConfig();
  const options = getClientOptions();

  return createBrowserClient(
    config.url,
    config.anonKey,
    {
      ...options,
      auth: {
        ...options.auth,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    }
  );
}
