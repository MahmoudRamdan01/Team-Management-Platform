import type { Role } from "@/lib/repositories/types";

/** Higher number = more privilege. Used for `min_role` style comparisons. */
export const ROLE_RANK: Record<Role, number> = {
  employee: 1,
  manager: 2,
  admin: 3,
  super_admin: 4,
};

export const ROLES: Role[] = ["employee", "manager", "admin", "super_admin"];

export const ROLE_LABELS: Record<Role, { en: string; ar: string }> = {
  super_admin: { en: "Super Admin", ar: "مدير عام" },
  admin: { en: "Admin", ar: "أدمن" },
  manager: { en: "Manager", ar: "مدير قسم" },
  employee: { en: "Employee", ar: "موظف" },
};

export function roleAtLeast(role: Role, min: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

export function isAdminRole(role: Role): boolean {
  return role === "admin" || role === "super_admin";
}

/** Only a super admin may create/edit admins or other super admins. */
export function canManageRole(actor: Role, target: Role): boolean {
  if (actor === "super_admin") return true;
  if (actor === "admin") return ROLE_RANK[target] < ROLE_RANK.admin;
  if (actor === "manager") return target === "employee";
  return false;
}
