import type { Role } from "@/lib/repositories/types";

/**
 * Permission catalog. These keys mirror the `permissions` table seeded in the
 * database — keeping them here gives compile-time safety in the UI while the DB
 * remains the source of truth for runtime enforcement (RLS + route handlers).
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard.view",
  DASHBOARD_VIEW_ALL: "dashboard.view_all",

  TOOL_VIEW: "tool.view",
  TOOL_LAUNCH: "tool.launch",

  USER_VIEW: "user.view",
  USER_VIEW_DEPT: "user.view_dept",
  USER_MANAGE: "user.manage",
  USER_MANAGE_ROLE: "user.manage_role",

  VISIBILITY_MANAGE: "visibility.manage",

  AUDIT_VIEW: "audit.view",
  AUDIT_VIEW_DEPT: "audit.view_dept",
  AUDIT_VIEW_ALL: "audit.view_all",

  ADMIN_PANEL: "admin.panel",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Default role → permission matrix. The DB `role_permissions` table is seeded
 * from this same matrix; per-user overrides live in `user_permissions`.
 */
export const ROLE_PERMISSIONS: Record<Role, PermissionKey[]> = {
  employee: [PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.TOOL_VIEW, PERMISSIONS.TOOL_LAUNCH],
  manager: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.TOOL_VIEW,
    PERMISSIONS.TOOL_LAUNCH,
    PERMISSIONS.USER_VIEW_DEPT,
    PERMISSIONS.AUDIT_VIEW_DEPT,
  ],
  admin: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_VIEW_ALL,
    PERMISSIONS.TOOL_VIEW,
    PERMISSIONS.TOOL_LAUNCH,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.VISIBILITY_MANAGE,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_VIEW_ALL,
    PERMISSIONS.ADMIN_PANEL,
  ],
  super_admin: Object.values(PERMISSIONS),
};

/**
 * Compute effective permissions from a role plus per-user grant/deny overrides.
 * Mirrors the DB rule: role grants ∪ user grants − user denies.
 */
export function computeEffectivePermissions(
  role: Role,
  overrides: { key: PermissionKey; grant: boolean }[] = []
): Set<PermissionKey> {
  const set = new Set<PermissionKey>(ROLE_PERMISSIONS[role]);
  for (const o of overrides) {
    if (o.grant) set.add(o.key);
    else set.delete(o.key);
  }
  return set;
}
