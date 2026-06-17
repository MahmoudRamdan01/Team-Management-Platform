import { requirePermission } from "@/lib/server/context";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { getServerI18n } from "@/lib/i18n/server";
import { TaskService } from "@/lib/services/task.service";
import { TasksView } from "@/components/tasks/TasksView";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const ctx = await requirePermission(PERMISSIONS.TASK_VIEW);
  const { t } = getServerI18n();
  const svc = new TaskService(ctx.repos);

  const canManage = ctx.permissions.has(PERMISSIONS.TASK_MANAGE);
  const [mine, managed, users] = await Promise.all([
    svc.listMine(ctx.profile.id),
    canManage ? svc.listManaged() : Promise.resolve([]),
    canManage ? ctx.repos.users.list({ status: "active" }) : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-brand text-2xl font-bold text-foam sm:text-3xl">{t("tasks.title")}</h1>
        <p className="mt-1 text-sm text-mist">{t("tasks.sub")}</p>
      </header>
      <TasksView
        mine={mine}
        managed={managed}
        canManage={canManage}
        users={users.map((u) => ({ id: u.id, fullName: u.fullName, username: u.username }))}
      />
    </div>
  );
}
