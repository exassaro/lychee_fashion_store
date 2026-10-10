import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/env";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!isSupabaseConfigured) {
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { response, user, isAdmin } = await updateSession(request);

  if (isLogin) {
    // Already signed in as admin → skip the login screen.
    if (user && isAdmin) return NextResponse.redirect(new URL("/admin", request.url));
    return response;
  }

  if (!user || !isAdmin) {
    const url = new URL("/admin/login", request.url);
    if (user && !isAdmin) url.searchParams.set("error", "not_admin");
    else url.searchParams.set("next", pathname);
    const redirect = NextResponse.redirect(url);
    // Carry over any refreshed auth cookies.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  return response;
}

export const config = {
  // Only admin routes run middleware, so the storefront stays fully static.
  matcher: ["/admin", "/admin/:path*"],
};
