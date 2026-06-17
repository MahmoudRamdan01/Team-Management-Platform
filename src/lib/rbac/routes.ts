import type { Role } from "@/lib/repositories/types";
import { PERMISSIONS, type PermissionKey } from "./permissions";

export interface RouteGuard {
  /** path prefix this rule matches */
  prefix: string;
  /** minimum permission required to access (checked coarsely in middleware) */
  permission?: PermissionKey;
  /** whether the route merely requires authentication */
  authOnly?: boolean;
}

/**
 * Coarse route-level guards enforced in middleware.ts (layer 1 of defense in
 * depth). Fine-grained checks happen in server components / route handlers and
 * are ultimately backstopped by Postgres RLS.
 *
 * Order matters: the first matching prefix wins, so list specific paths first.
 */
export const ROUTE_GUARDS: RouteGuard[] = [
  { prefix: "/admin/visibility", permission: PERMISSIONS.VISIBILITY_MANAGE },
  { prefix: "/admin/users", permission: PERMISSIONS.USER_MANAGE },
  { prefix: "/admin/audit", permission: PERMISSIONS.AUDIT_VIEW },
  { prefix: "/admin", permission: PERMISSIONS.ADMIN_PANEL },
  { prefix: "/dashboard", authOnly: true },
  { prefix: "/tools", authOnly: true },
  { prefix: "/departments", authOnly: true },
];

/** Public routes that never require auth. */
export const PUBLIC_PREFIXES = ["/login", "/register", "/auth", "/_next", "/icons", "/fonts", "/tools/reconciler"];

export function matchRouteGuard(pathname: string): RouteGuard | null {
  return ROUTE_GUARDS.find((g) => pathname.startsWith(g.prefix)) ?? null;
}

export function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p));
}

export const ADMIN_ROLES: Role[] = ["admin", "super_admin"];
