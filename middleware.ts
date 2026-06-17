import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isPublicPath, matchRouteGuard, ADMIN_ROLES } from "@/lib/rbac/routes";

/**
 * Layer 1 of defense in depth: refresh the session and apply COARSE route gates.
 * Authenticated-vs-public is enforced here; the admin section requires an admin
 * role. Fine-grained permission checks live in server components/route handlers,
 * with Postgres RLS as the final backstop.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user, supabase } = await updateSession(request);

  if (isPublicPath(pathname)) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const guard = matchRouteGuard(pathname);

  // Admin section needs an admin role — resolve it once here.
  if (guard && pathname.startsWith("/admin")) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const role = (data as { role?: string } | null)?.role;
    if (!role || !ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and PWA artifacts. The reconciler
     * under /tools/reconciler is intentionally NOT excluded so it still loads,
     * but it self-gates via AOI_SESSION_SHARED.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|workbox-|icons/|fonts/).*)",
  ],
};
