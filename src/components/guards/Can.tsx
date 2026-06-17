"use client";

import { useAccess } from "@/lib/rbac/access-context";
import type { PermissionKey } from "@/lib/rbac/permissions";
import type { Role } from "@/lib/repositories/types";

/** Renders children only if the user holds the given permission. Cosmetic only —
    real enforcement is in route handlers + RLS. */
export function Can({ perm, children, fallback = null }: { perm: PermissionKey; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { can } = useAccess();
  return <>{can(perm) ? children : fallback}</>;
}

export function RoleGate({ min, children, fallback = null }: { min: Role; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { roleAtLeast } = useAccess();
  return <>{roleAtLeast(min) ? children : fallback}</>;
}
