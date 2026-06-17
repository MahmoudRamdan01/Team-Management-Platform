import type { Tool } from "./types";

export interface ToolRepository {
  listAll(): Promise<Tool[]>;
  /** Only tools the visibility engine + RLS expose to this user. */
  listVisibleForUser(userId: string): Promise<Tool[]>;
  getById(id: string): Promise<Tool | null>;
  countLive(): Promise<number>;
}
