import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, Role } from "../types";
import type {
  UpdateProfileInput,
  UserListFilter,
  UserRepository,
} from "../user.repository";
import type { PermissionKey } from "@/lib/rbac/permissions";
import { ROLES } from "@/lib/rbac/roles";
import { mapProfile } from "./mappers";

const COLS =
  "id, full_name, username, dept, role, status, must_change_password, mfa_enabled, locale, created_at, updated_at, last_login_at";

export class SupabaseUserRepository implements UserRepository {
  constructor(private db: SupabaseClient) {}

  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await this.db.from("profiles").select(COLS).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapProfile(data) : null;
  }

  async getByUsername(username: string): Promise<Profile | null> {
    const { data, error } = await this.db
      .from("profiles")
      .select(COLS)
      .eq("username", username)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProfile(data) : null;
  }

  async list(filter: UserListFilter = {}): Promise<Profile[]> {
    let q = this.db.from("profiles").select(COLS).order("created_at", { ascending: false });
    if (filter.dept) q = q.eq("dept", filter.dept);
    if (filter.role) q = q.eq("role", filter.role);
    if (filter.status) q = q.eq("status", filter.status);
    if (filter.search) q = q.or(`full_name.ilike.%${filter.search}%,username.ilike.%${filter.search}%`);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(mapProfile);
  }

  async update(id: string, patch: UpdateProfileInput): Promise<Profile> {
    const row: Record<string, unknown> = {};
    if (patch.fullName !== undefined) row.full_name = patch.fullName;
    if (patch.dept !== undefined) row.dept = patch.dept;
    if (patch.role !== undefined) row.role = patch.role;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.locale !== undefined) row.locale = patch.locale;
    if (patch.mustChangePassword !== undefined) row.must_change_password = patch.mustChangePassword;
    if (patch.mfaEnabled !== undefined) row.mfa_enabled = patch.mfaEnabled;
    const { data, error } = await this.db.from("profiles").update(row).eq("id", id).select(COLS).single();
    if (error) throw error;
    return mapProfile(data);
  }

  async touchLastLogin(id: string): Promise<void> {
    const { error } = await this.db
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  }

  async getPermissionOverrides(userId: string): Promise<{ key: PermissionKey; grant: boolean }[]> {
    const { data, error } = await this.db
      .from("user_permissions")
      .select("permission_key, grant")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({ key: r.permission_key as PermissionKey, grant: !!r.grant }));
  }

  async countAll(): Promise<number> {
    const { count, error } = await this.db.from("profiles").select("id", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  }

  async countByStatus(status: string): Promise<number> {
    const { count, error } = await this.db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", status);
    if (error) throw error;
    return count ?? 0;
  }

  async roleDistribution(): Promise<Record<Role, number>> {
    const { data, error } = await this.db.from("profiles").select("role");
    if (error) throw error;
    const dist = Object.fromEntries(ROLES.map((r) => [r, 0])) as Record<Role, number>;
    for (const row of data ?? []) dist[(row as any).role as Role]++;
    return dist;
  }

  async deptDistribution(): Promise<Record<string, number>> {
    const { data, error } = await this.db.from("profiles").select("dept");
    if (error) throw error;
    const dist: Record<string, number> = {};
    for (const row of data ?? []) {
      const d = (row as any).dept as string;
      dist[d] = (dist[d] ?? 0) + 1;
    }
    return dist;
  }
}
