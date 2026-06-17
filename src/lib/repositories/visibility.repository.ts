import type { VisibilityRule, VisibilityScope } from "./types";

export interface UpsertVisibilityInput {
  toolId: string;
  scope: VisibilityScope;
  subject: string;
  visible: boolean;
  createdBy?: string;
}

export interface VisibilityRepository {
  listRules(): Promise<VisibilityRule[]>;
  listForTool(toolId: string): Promise<VisibilityRule[]>;
  upsert(input: UpsertVisibilityInput): Promise<VisibilityRule>;
  remove(id: string): Promise<void>;
}
