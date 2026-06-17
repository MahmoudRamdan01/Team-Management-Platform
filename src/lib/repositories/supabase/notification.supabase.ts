import type { SupabaseClient } from "@supabase/supabase-js";
import type { Notification } from "../types";
import type {
  CreateNotificationInput,
  NotificationRepository,
} from "../notification.repository";
import { mapNotification } from "./mappers";

const COLS = "id, user_id, type, title_en, title_ar, body_en, body_ar, data, read_at, created_at";

export class SupabaseNotificationRepository implements NotificationRepository {
  constructor(private db: SupabaseClient) {}

  async listForUser(userId: string, limit = 50): Promise<Notification[]> {
    const { data, error } = await this.db
      .from("notifications")
      .select(COLS)
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(mapNotification);
  }

  async unreadCount(userId: string): Promise<number> {
    const { count, error } = await this.db
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .or(`user_id.eq.${userId},user_id.is.null`)
      .is("read_at", null);
    if (error) throw error;
    return count ?? 0;
  }

  async markRead(id: string, _userId: string): Promise<void> {
    const { error } = await this.db
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  }

  async markAllRead(userId: string): Promise<void> {
    const { error } = await this.db
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .or(`user_id.eq.${userId},user_id.is.null`)
      .is("read_at", null);
    if (error) throw error;
  }

  async createMany(inputs: CreateNotificationInput[]): Promise<number> {
    if (inputs.length === 0) return 0;
    const rows = inputs.map((input) => ({
      user_id: input.userId,
      type: input.type ?? "info",
      title_en: input.titleEn,
      title_ar: input.titleAr,
      body_en: input.bodyEn ?? "",
      body_ar: input.bodyAr ?? "",
      data: input.data ?? {},
    }));
    const { error, count } = await this.db.from("notifications").insert(rows, { count: "exact" });
    if (error) throw error;
    return count ?? rows.length;
  }

  async create(input: CreateNotificationInput): Promise<Notification> {
    const { data, error } = await this.db
      .from("notifications")
      .insert({
        user_id: input.userId,
        type: input.type ?? "info",
        title_en: input.titleEn,
        title_ar: input.titleAr,
        body_en: input.bodyEn ?? "",
        body_ar: input.bodyAr ?? "",
        data: input.data ?? {},
      })
      .select(COLS)
      .single();
    if (error) throw error;
    return mapNotification(data);
  }
}
