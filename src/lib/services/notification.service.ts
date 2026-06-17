import type { Repositories } from "@/lib/repositories";
import type { Profile, Role } from "@/lib/repositories/types";

export type Audience = "all" | "department" | "role" | "user";

export interface SendNotificationInput {
  audience: Audience;
  target?: string; // dept id, role, or user id depending on audience
  type?: string;
  titleEn: string;
  titleAr: string;
  bodyEn?: string;
  bodyAr?: string;
}

/**
 * Notifications. Sending fans out to one row per recipient so per-user read
 * state is accurate (the acting admin's own client satisfies the is_admin RLS
 * insert policy — no service-role needed). Every send is audited.
 */
export class NotificationService {
  constructor(private repos: Repositories) {}

  list(userId: string, limit = 50) {
    return this.repos.notifications.listForUser(userId, limit);
  }

  unread(userId: string) {
    return this.repos.notifications.unreadCount(userId);
  }

  markRead(id: string, userId: string) {
    return this.repos.notifications.markRead(id, userId);
  }

  markAllRead(userId: string) {
    return this.repos.notifications.markAllRead(userId);
  }

  private async resolveRecipients(audience: Audience, target?: string): Promise<string[]> {
    if (audience === "user") return target ? [target] : [];
    const filter =
      audience === "department"
        ? { dept: target, status: "active" }
        : audience === "role"
          ? { role: target as Role, status: "active" }
          : { status: "active" };
    const users = await this.repos.users.list(filter);
    return users.map((u) => u.id);
  }

  async send(actor: Profile, input: SendNotificationInput, ctx: { ip?: string | null; ua?: string | null } = {}) {
    const recipients = await this.resolveRecipients(input.audience, input.target);
    const sent = await this.repos.notifications.createMany(
      recipients.map((userId) => ({
        userId,
        type: input.type ?? "info",
        titleEn: input.titleEn,
        titleAr: input.titleAr,
        bodyEn: input.bodyEn,
        bodyAr: input.bodyAr,
        data: { audience: input.audience, target: input.target ?? null },
      }))
    );

    await this.repos.audit.log({
      actorId: actor.id,
      actorUsername: actor.username,
      action: "admin_action",
      targetType: "notification",
      targetId: input.audience + (input.target ? `:${input.target}` : ""),
      metadata: { title: input.titleEn, recipients: sent },
      ip: ctx.ip ?? null,
      userAgent: ctx.ua ?? null,
    });

    return sent;
  }
}
