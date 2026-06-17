import { requireUser } from "@/lib/server/context";
import { getServerI18n } from "@/lib/i18n/server";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { NotificationService } from "@/lib/services/notification.service";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const ctx = await requireUser();
  const { t } = getServerI18n();

  const items = await new NotificationService(ctx.repos).list(ctx.profile.id, 100);
  const canSend = ctx.permissions.has(PERMISSIONS.ADMIN_PANEL);
  const users = canSend
    ? (await ctx.repos.users.list()).map((u) => ({ id: u.id, fullName: u.fullName, username: u.username }))
    : [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-brand text-2xl font-bold text-foam sm:text-3xl">{t("nav.notifications")}</h1>
        <p className="mt-1 text-sm text-mist">{t("notif.sub")}</p>
      </header>
      <NotificationCenter items={items} canSend={canSend} users={users} />
    </div>
  );
}
