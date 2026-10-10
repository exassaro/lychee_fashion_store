import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type AdminAuth = { error: string } | { error?: never; supabase: ServerClient; user: User };

/**
 * Verifies the current user is in `admins`. Middleware already guards /admin,
 * this is defense-in-depth for layouts and every server action.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect("/admin/login?error=not_admin");

  return { supabase, user };
}

/** Variant for server actions: returns an error instead of redirecting. */
export async function getAdminOrError(): Promise<AdminAuth> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session has expired. Please sign in again." };

  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return { error: "You don't have admin access." };

  return { supabase, user };
}
