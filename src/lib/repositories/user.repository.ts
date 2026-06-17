import type { Profile, Role } from "./types";
import type { PermissionKey } from "@/lib/rbac/permissions";

export interface UserListFilter {
  dept?: string;
  role?: Role;
  status?: string;
  search?: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  dept?: string;
  role?: Role;
  status?: string;
  locale?: "ar" | "en";
  mustChangePassword?: boolean;
  mfaEnabled?: boolean;
}

export interface UserRepository {
  getById(id: string): Promise<Profile | null>;
  getByUsername(username: string): Promise<Profile | null>;
  list(filter?: UserListFilter): Promise<Profile[]>;
  update(id: string, patch: UpdateProfileInput): Promise<Profile>;
  touchLastLogin(id: string): Promise<void>;

  /** per-user permission grant/deny overrides */
  getPermissionOverrides(userId: string): Promise<{ key: PermissionKey; grant: boolean }[]>;

  // aggregates for the executive dashboard
  countAll(): Promise<number>;
  countByStatus(status: string): Promise<number>;
  roleDistribution(): Promise<Record<Role, number>>;
  deptDistribution(): Promise<Record<string, number>>;
}
