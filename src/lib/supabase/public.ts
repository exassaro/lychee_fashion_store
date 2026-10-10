import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";
import type { Database } from "./database.types";

let client: ReturnType<typeof createClient<Database>> | undefined;

/**
 * Cookie-less anon client for public, cacheable reads (RLS: visible rows only).
 * Keeps storefront pages static; freshness comes from revalidateTag in admin actions.
 */
export function getPublicSupabase() {
  client ??= createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
