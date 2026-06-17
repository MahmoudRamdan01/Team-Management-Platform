import type { Repositories } from "@/lib/repositories";
import type { Profile } from "@/lib/repositories/types";
import type { UpsertVisibilityInput } from "@/lib/repositories/visibility.repository";

/**
 * Manages the dynamic tool-visibility engine. Every mutation is audited so the
 * "permission/visibility changes" requirement is traceable.
 */
export class VisibilityService {
  constructor(private repos: Repositories) {}

  listRules() {
    return this.repos.visibility.listRules();
  }

  async setRule(actor: Profile, input: UpsertVisibilityInput, ctx: { ip?: string | null; ua?: string | null } = {}) {
    const rule = await this.repos.visibility.upsert({ ...input, createdBy: actor.id });
    await this.repos.audit.log({
      actorId: actor.id,
      actorUsername: actor.username,
      action: "visibility_change",
      targetType: "tool",
      targetId: input.toolId,
      metadata: { scope: input.scope, subject: input.subject, visible: input.visible },
      ip: ctx.ip ?? null,
      userAgent: ctx.ua ?? null,
    });
    return rule;
  }

  async removeRule(actor: Profile, id: string, ctx: { ip?: string | null; ua?: string | null } = {}) {
    await this.repos.visibility.remove(id);
    await this.repos.audit.log({
      actorId: actor.id,
      actorUsername: actor.username,
      action: "visibility_change",
      targetType: "visibility_rule",
      targetId: id,
      metadata: { removed: true },
      ip: ctx.ip ?? null,
      userAgent: ctx.ua ?? null,
    });
  }
}
