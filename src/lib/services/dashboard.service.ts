import type { Repositories } from "@/lib/repositories";
import type { DashboardStats } from "@/lib/repositories/types";

/**
 * Resolves a single stat source, degrading to a safe fallback if it throws
 * (e.g. a missing table, an RLS error, or transient DB failure). This keeps one
 * bad query from taking the whole dashboard down with a server-side exception.
 */
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (err) {
    console.error("[DashboardService] stat source failed, using fallback:", err);
    return fallback;
  }
}

/**
 * Composes the executive dashboard from real data across repositories. Counts
 * are naturally scoped by RLS to what the caller may see (admins → org-wide,
 * managers → their department). Each source is resolved independently so a
 * single failure degrades gracefully instead of crashing the page.
 */
export class DashboardService {
  constructor(private repos: Repositories) {}

  async stats(onlineNow: number): Promise<DashboardStats> {
    const [totalUsers, activeUsers, activeSessions, roleDistribution, deptDistribution, toolsLive, recentActivity] =
      await Promise.all([
        safe(this.repos.users.countAll(), 0),
        safe(this.repos.users.countByStatus("active"), 0),
        safe(this.repos.presence.countActive(5), 0),
        safe(this.repos.users.roleDistribution(), {} as DashboardStats["roleDistribution"]),
        safe(this.repos.users.deptDistribution(), {} as DashboardStats["deptDistribution"]),
        safe(this.repos.tools.countLive(), 0),
        safe(this.repos.audit.recent(12), []),
      ]);

    return {
      totalUsers,
      activeUsers,
      activeSessions,
      onlineNow,
      roleDistribution,
      deptDistribution,
      toolsLive,
      recentActivity,
    };
  }
}
