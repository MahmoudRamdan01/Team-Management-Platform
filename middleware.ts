import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isPublicPath } from "@/lib/rbac/routes";

/**
 * Layer 1 of defense in depth: refresh the session and redirect unauthenticated
 * users. Fine-grained checks (incl. the admin section) live in server components/
 * route handlers via requirePermission, with Postgres RLS as the final backstop —
 * so we avoid an extra per-request DB round-trip here.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  if (isPublicPath(pathname)) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
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
