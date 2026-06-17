import type { Repositories } from "@/lib/repositories";
import type { Profile } from "@/lib/repositories/types";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/repositories/task.repository";

type Ctx = { ip?: string | null; ua?: string | null };

/**
 * My Tasks business logic. Task RLS enforces who can see/edit; this layer adds
 * dept stamping (for manager scoping), audit, and comment authoring.
 */
export class TaskService {
  constructor(private repos: Repositories) {}

  listMine(userId: string) {
    return this.repos.tasks.listForAssignee(userId);
  }

  listManaged() {
    return this.repos.tasks.listManaged();
  }

  getById(id: string) {
    return this.repos.tasks.getById(id);
  }

  listComments(taskId: string) {
    return this.repos.tasks.listComments(taskId);
  }

  async create(
    actor: Profile,
    input: Omit<CreateTaskInput, "createdBy" | "dept">,
    ctx: Ctx = {}
  ) {
    const assignee = await this.repos.users.getById(input.assigneeId);
    const task = await this.repos.tasks.create({
      ...input,
      createdBy: actor.id,
      dept: assignee?.dept ?? actor.dept,
    });
    await this.repos.audit.log({
      actorId: actor.id,
      actorUsername: actor.username,
      action: "admin_action",
      targetType: "task",
      targetId: task.id,
      metadata: { op: "create", title: task.title, assignee: input.assigneeId },
      ip: ctx.ip ?? null,
      userAgent: ctx.ua ?? null,
    });
    return task;
  }

  async update(actor: Profile, id: string, patch: UpdateTaskInput, ctx: Ctx = {}) {
    const task = await this.repos.tasks.update(id, patch);
    await this.repos.audit.log({
      actorId: actor.id,
      actorUsername: actor.username,
      action: "admin_action",
      targetType: "task",
      targetId: id,
      metadata: { op: "update", ...patch },
      ip: ctx.ip ?? null,
      userAgent: ctx.ua ?? null,
    });
    return task;
  }

  async remove(actor: Profile, id: string, ctx: Ctx = {}) {
    await this.repos.tasks.remove(id);
    await this.repos.audit.log({
      actorId: actor.id,
      actorUsername: actor.username,
      action: "admin_action",
      targetType: "task",
      targetId: id,
      metadata: { op: "delete" },
      ip: ctx.ip ?? null,
      userAgent: ctx.ua ?? null,
    });
  }

  addComment(actor: Profile, taskId: string, body: string) {
    return this.repos.tasks.addComment({ taskId, authorId: actor.id, authorUsername: actor.username, body });
  }
}
