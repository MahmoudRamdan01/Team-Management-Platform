import type { SupabaseClient } from "@supabase/supabase-js";
import type { VisibilityRule } from "../types";
import type {
  UpsertVisibilityInput,
  VisibilityRepository,
} from "../visibility.repository";
import { mapVisibility } from "./mappers";

const COLS =
  "id, tool_id, scope, subject_user, subject_role, subject_dept, visible, created_by, created_at";

function subjectColumn(scope: string): "subject_user" | "subject_role" | "subject_dept" {
  return scope === "user" ? "subject_user" : scope === "role" ? "subject_role" : "subject_dept";
}

export class SupabaseVisibilityRepository implements VisibilityRepository {
  constructor(private db: SupabaseClient) {}

  async listRules(): Promise<VisibilityRule[]> {
    const { data, error } = await this.db.from("tool_visibility").select(COLS);
    if (error) throw error;
    return (data ?? []).map(mapVisibility);
  }

  async listForTool(toolId: string): Promise<VisibilityRule[]> {
    const { data, error } = await this.db.from("tool_visibility").select(COLS).eq("tool_id", toolId);
    if (error) throw error;
    return (data ?? []).map(mapVisibility);
  }

  /**
   * Idempotent per (tool, scope, subject): remove any existing rule then insert
   * the new one. Avoids partial-unique-index onConflict quirks in PostgREST.
   */
  async upsert(input: UpsertVisibilityInput): Promise<VisibilityRule> {
    const col = subjectColumn(input.scope);
    await this.db
      .from("tool_visibility")
      .delete()
      .eq("tool_id", input.toolId)
      .eq("scope", input.scope)
      .eq(col, input.subject);

    const row: Record<string, unknown> = {
      tool_id: input.toolId,
      scope: input.scope,
      visible: input.visible,
      created_by: input.createdBy ?? null,
      subject_user: null,
      subject_role: null,
      subject_dept: null,
    };
    row[col] = input.subject;

    const { data, error } = await this.db.from("tool_visibility").insert(row).select(COLS).single();
    if (error) throw error;
    return mapVisibility(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.db.from("tool_visibility").delete().eq("id", id);
    if (error) throw error;
  }
}
