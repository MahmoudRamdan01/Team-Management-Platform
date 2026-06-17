import type { Repositories } from "@/lib/repositories";
import type { Profile, Tool } from "@/lib/repositories/types";
import { computeEffectivePermissions, type PermissionKey } from "@/lib/rbac/permissions";
import { roleAtLeast } from "@/lib/rbac/roles";

/**
 * Central authorization logic. Pure business rules over repository interfaces —
 * no Supabase, no Next.js. Used by server components, route handlers and (via a
 * serialized snapshot) the client UI.
 */
export class AccessService {
  constructor(private repos: Repositories) {}

  async effectivePermissions(profile: Profile): Promise<Set<PermissionKey>> {
    const overrides = await this.repos.users.getPermissionOverrides(profile.id);
    return computeEffectivePermissions(profile.role, overrides);
  }

  async effectiveTools(userId: string): Promise<Tool[]> {
    return this.repos.tools.listVisibleForUser(userId);
  }

  /** Server-side gate for launching a tool. */
  async canLaunch(profile: Profile, toolId: string): Promise<{ ok: boolean; tool: Tool | null; reason?: string }> {
    const tool = await this.repos.tools.getById(toolId);
    if (!tool) return { ok: false, tool: null, reason: "not_visible" };
    if (tool.status !== "live") return { ok: false, tool, reason: "not_live" };
    if (!roleAtLeast(profile.role, tool.minRole)) return { ok: false, tool, reason: "insufficient_role" };
    return { ok: true, tool };
  }
}

export function hasPermission(perms: Set<PermissionKey>, key: PermissionKey): boolean {
  return perms.has(key);
}
