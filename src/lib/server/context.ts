import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRepositories, type Repositories } from "@/lib/repositories";
import type { Profile } from "@/lib/repositories/types";
import { AccessService } from "@/lib/services/access.service";
import { computeEffectivePermissions, type PermissionKey } from "@/lib/rbac/permissions";

export interface ServerContext {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  repos: Repositories;
  access: AccessService;
  permissions: Set<PermissionKey>;
}

/**
 * Resolves the full server-side context for the current request: the Supabase
 * user, their profile, the repository registry (scoped by the user's RLS) and
 * their effective permissions. The single entry point server components and
 * route handlers use to wire up the abstracted data layer.
 */
export async function getServerContext(): Promise<ServerContext> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const repos = getRepositories(supabase);
  const access = new AccessService(repos);

  if (!user) {
    return { user: null, profile: null, repos, access, permissions: new Set() };
  }

  const profile = await repos.users.getById(user.id);
  const permissions = profile
    ? computeEffectivePermissions(profile.role, await repos.users.getPermissionOverrides(profile.id))
    : new Set<PermissionKey>();

  return { user: { id: user.id, email: user.email }, profile, repos, access, permissions };
}

/** Require an authenticated user with a profile, else redirect to login. */
export async function requireUser(): Promise<ServerContext & { profile: Profile }> {
  const ctx = await getServerContext();
  if (!ctx.user || !ctx.profile) redirect("/login");
  return ctx as ServerContext & { profile: Profile };
}

/** Require a specific permission, else redirect to the dashboard. */
export async function requirePermission(permission: PermissionKey) {
  const ctx = await requireUser();
  if (!ctx.permissions.has(permission)) redirect("/dashboard");
  return ctx;
}
