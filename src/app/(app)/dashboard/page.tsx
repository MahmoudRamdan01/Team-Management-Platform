import { Users, UserCheck, Activity, Wrench } from "lucide-react";
import { requirePermission } from "@/lib/server/context";
import { DashboardService } from "@/lib/services/dashboard.service";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { getServerI18n } from "@/lib/i18n/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { DistributionBar } from "@/components/dashboard/DistributionBar";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DEPARTMENT_MAP } from "@/lib/constants/departments";
import { ROLE_LABELS } from "@/lib/rbac/roles";
import type { Role } from "@/lib/repositories/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ctx = await requirePermission(PERMISSIONS.DASHBOARD_VIEW);
  const { locale, t } = getServerI18n();

  const stats = await new DashboardService(ctx.repos).stats(0);
  const canViewAll = ctx.permissions.has(PERMISSIONS.DASHBOARD_VIEW_ALL);

  const roleData = (Object.keys(stats.roleDistribution) as Role[])
    .map((r) => ({ label: ROLE_LABELS[r][locale], value: stats.roleDistribution[r] }))
    .filter((d) => d.value > 0);

  const deptData = Object.entries(stats.deptDistribution).map(([id, value]) => ({
    label: locale === "ar" ? DEPARTMENT_MAP[id]?.nameAr ?? id : DEPARTMENT_MAP[id]?.nameEn ?? id,
    value,
    color: DEPARTMENT_MAP[id]?.color,
  }));

  return (
    <div className="space-y-10 view-in">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-gold shadow-[0_0_15px_rgba(247,183,51,0.5)]" />
          <h1 className="font-brand text-3xl font-black text-white sm:text-4xl tracking-tight">
            {t("dashboard.title")}
          </h1>
        </div>
        <p className="text-mist text-lg font-medium opacity-80">{t("dashboard.sub")}</p>
      </header>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("dashboard.totalUsers")} value={stats.totalUsers} icon={Users} accent="#4FC3F7" />
        <StatCard label={t("dashboard.activeUsers")} value={stats.activeUsers} icon={UserCheck} accent="#43D9A0" />
        <StatCard label={t("dashboard.activeSessions")} value={stats.activeSessions} icon={Activity} accent="#F7B733" />
        <StatCard label={t("dashboard.toolsLive")} value={stats.toolsLive} icon={Wrench} accent="#B49CFF" />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {canViewAll && (
          <div className="lg:col-span-1">
            <DistributionBar title={t("dashboard.roleDist")} data={roleData} />
          </div>
        )}
        <div className={canViewAll ? "lg:col-span-1" : "lg:col-span-1"}>
          <DistributionBar title={t("dashboard.deptDist")} data={deptData} />
        </div>
        <div className={canViewAll ? "lg:col-span-1" : "lg:col-span-2"}>
          <ActivityFeed entries={stats.recentActivity} title={t("dashboard.recentActivity")} />
        </div>
      </section>
    </div>
  );
}
