import "server-only";
import { cache } from "react";
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
 * Resolves the full server-side context for the current request. Wrapped in
 * React `cache()` so the layout and the page (and any nested server component)
 * share ONE auth+profile fetch per request instead of repeating it — a major
 * latency win on every navigation.
 */
export const getServerContext = cache(async (): Promise<ServerContext> => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const repos = getRepositories(supabase);
  const access = new AccessService(repos);

  if (!user) {
    return { user: null, profile: null, repos, access, permissions: new Set() };
  }

  // Fetch profile + permission overrides in parallel.
  const [profile, overrides] = await Promise.all([
    repos.users.getById(user.id),
    repos.users.getPermissionOverrides(user.id),
  ]);

  const permissions = profile
    ? computeEffectivePermissions(profile.role, overrides)
    : new Set<PermissionKey>();

  return { user: { id: user.id, email: user.email }, profile, repos, access, permissions };
});

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
