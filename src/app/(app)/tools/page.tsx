import { requirePermission } from "@/lib/server/context";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { getServerI18n } from "@/lib/i18n/server";
import { ToolGrid } from "@/components/tools/ToolGrid";

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const ctx = await requirePermission(PERMISSIONS.TOOL_VIEW);
  const { t } = getServerI18n();

  // RLS filters `tools` to exactly what the visibility engine exposes to this user.
  const tools = await ctx.access.effectiveTools(ctx.profile.id);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-brand text-2xl font-bold text-foam sm:text-3xl">{t("tools.title")}</h1>
        <p className="mt-1 text-sm text-mist">{t("tools.sub")}</p>
      </header>
      <ToolGrid tools={tools} openLabel={t("tools.open")} soonLabel={t("tools.soon")} emptyLabel={t("tools.empty")} />
    </div>
  );
}
