import { requirePermission } from "@/lib/server/context";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { getServerI18n } from "@/lib/i18n/server";
import { VisibilityEditor } from "@/components/admin/VisibilityEditor";

export const dynamic = "force-dynamic";

export default async function VisibilityPage() {
  const ctx = await requirePermission(PERMISSIONS.VISIBILITY_MANAGE);
  const { t } = getServerI18n();

  const [tools, users, rules] = await Promise.all([
    ctx.repos.tools.listAll(),
    ctx.repos.users.list(),
    ctx.repos.visibility.listRules(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-brand text-2xl font-bold text-foam sm:text-3xl">{t("admin.visibilityTitle")}</h1>
        <p className="mt-1 text-sm text-mist">{t("admin.visibilitySub")}</p>
      </header>
      <VisibilityEditor tools={tools} users={users} rules={rules} />
    </div>
  );
}
