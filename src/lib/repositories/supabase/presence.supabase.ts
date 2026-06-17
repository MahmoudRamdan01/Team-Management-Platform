import type { SupabaseClient } from "@supabase/supabase-js";
import type { PresenceRepository } from "../presence.repository";

export class SupabasePresenceRepository implements PresenceRepository {
  constructor(private db: SupabaseClient) {}

  /**
   * Upsert a single active-session row per user, refreshing last_seen_at. We key
   * on user_id so each user has at most one durable heartbeat row.
   */
  async heartbeat(userId: string, meta: { ip?: string; userAgent?: string }): Promise<void> {
    const now = new Date().toISOString();
    const { data: existing } = await this.db
      .from("active_sessions")
      .select("id")
      .eq("user_id", userId)
      .is("revoked_at", null)
      .limit(1)
      .maybeSingle();

    if (existing) {
      await this.db
        .from("active_sessions")
        .update({ last_seen_at: now, ip: meta.ip ?? null, user_agent: meta.userAgent ?? null })
        .eq("id", (existing as any).id);
    } else {
      await this.db.from("active_sessions").insert({
        user_id: userId,
        started_at: now,
        last_seen_at: now,
        ip: meta.ip ?? null,
        user_agent: meta.userAgent ?? null,
      });
    }
  }

  async countActive(withinMinutes: number): Promise<number> {
    const cutoff = new Date(Date.now() - withinMinutes * 60_000).toISOString();
    const { count, error } = await this.db
      .from("active_sessions")
      .select("id", { count: "exact", head: true })
      .is("revoked_at", null)
      .gte("last_seen_at", cutoff);
    if (error) throw error;
    return count ?? 0;
  }

  async revoke(userId: string): Promise<void> {
    await this.db
      .from("active_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("revoked_at", null);
  }
}
