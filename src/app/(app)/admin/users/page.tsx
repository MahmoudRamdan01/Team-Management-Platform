import { requirePermission } from "@/lib/server/context";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { getServerI18n } from "@/lib/i18n/server";
import { UsersTable } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const ctx = await requirePermission(PERMISSIONS.USER_MANAGE);
  const { t } = getServerI18n();
  const users = await ctx.repos.users.list();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-brand text-2xl font-bold text-foam sm:text-3xl">{t("admin.usersTitle")}</h1>
      </header>
      <UsersTable users={users} actorRole={ctx.profile.role} />
    </div>
  );
}
