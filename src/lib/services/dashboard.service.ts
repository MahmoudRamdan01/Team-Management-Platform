import type { Repositories } from "@/lib/repositories";
import type { DashboardStats } from "@/lib/repositories/types";

/**
 * Composes the executive dashboard from real data across repositories. Counts
 * are naturally scoped by RLS to what the caller may see (admins → org-wide,
 * managers → their department).
 */
export class DashboardService {
  constructor(private repos: Repositories) {}

  async stats(onlineNow: number): Promise<DashboardStats> {
    const [totalUsers, activeUsers, activeSessions, roleDistribution, deptDistribution, toolsLive, recentActivity] =
      await Promise.all([
        this.repos.users.countAll(),
        this.repos.users.countByStatus("active"),
        this.repos.presence.countActive(5),
        this.repos.users.roleDistribution(),
        this.repos.users.deptDistribution(),
        this.repos.tools.countLive(),
        this.repos.audit.recent(12),
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
