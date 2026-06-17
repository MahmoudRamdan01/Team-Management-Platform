import type { SupabaseClient } from "@supabase/supabase-js";
import type { Tool } from "../types";
import type { ToolRepository } from "../tool.repository";
import { mapTool } from "./mappers";

const COLS =
  "id, dept, name, version, status, featured, description, tags, launch_kind, launch_url, min_role";

export class SupabaseToolRepository implements ToolRepository {
  constructor(private db: SupabaseClient) {}

  async listAll(): Promise<Tool[]> {
    const { data, error } = await this.db.from("tools").select(COLS).order("id");
    if (error) throw error;
    return (data ?? []).map(mapTool);
  }

  /**
   * RLS on `tools` already filters rows to those visible to the caller via
   * `can_user_see_tool`, so a plain select returns exactly the visible set when
   * called with the user's own (anon-key) client.
   */
  async listVisibleForUser(_userId: string): Promise<Tool[]> {
    const { data, error } = await this.db.from("tools").select(COLS).order("id");
    if (error) throw error;
    return (data ?? []).map(mapTool);
  }

  async getById(id: string): Promise<Tool | null> {
    const { data, error } = await this.db.from("tools").select(COLS).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapTool(data) : null;
  }

  async countLive(): Promise<number> {
    const { count, error } = await this.db
      .from("tools")
      .select("id", { count: "exact", head: true })
      .eq("status", "live");
    if (error) throw error;
    return count ?? 0;
  }
}
