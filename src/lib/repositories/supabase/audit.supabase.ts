import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditEntry, AuditFilter, NewAuditEntry, Page } from "../types";
import type { AuditRepository } from "../audit.repository";
import { mapAudit } from "./mappers";

const COLS =
  "id, actor_id, actor_username, action, target_type, target_id, metadata, ip, user_agent, created_at";

export class SupabaseAuditRepository implements AuditRepository {
  constructor(private db: SupabaseClient) {}

  async log(entry: NewAuditEntry): Promise<void> {
    const { error } = await this.db.from("audit_logs").insert({
      actor_id: entry.actorId ?? null,
      actor_username: entry.actorUsername ?? "",
      action: entry.action,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      metadata: entry.metadata ?? {},
      ip: entry.ip ?? null,
      user_agent: entry.userAgent ?? null,
    });
    if (error) throw error;
  }

  async query(filter: AuditFilter): Promise<Page<AuditEntry>> {
    const page = Math.max(1, filter.page ?? 1);
    const pageSize = Math.min(200, filter.pageSize ?? 50);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let q = this.db
      .from("audit_logs")
      .select(COLS, { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (filter.actorId) q = q.eq("actor_id", filter.actorId);
    if (filter.action) q = q.eq("action", filter.action);
    if (filter.targetType) q = q.eq("target_type", filter.targetType);
    if (filter.from) q = q.gte("created_at", filter.from);
    if (filter.to) q = q.lte("created_at", filter.to);

    const { data, error, count } = await q;
    if (error) throw error;
    return {
      items: (data ?? []).map(mapAudit),
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async recent(limit: number): Promise<AuditEntry[]> {
    const { data, error } = await this.db
      .from("audit_logs")
      .select(COLS)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapAudit);
  }
}
