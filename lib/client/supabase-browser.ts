import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/client/config";

let browserClient: SupabaseClient | null = null;

/**
 * Cliente browser solo con URL y anon key públicas.
 * No usar para datos que la API ya expone.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabasePublicConfig();
  if (!url || !anonKey) return null;
  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return browserClient;
}
