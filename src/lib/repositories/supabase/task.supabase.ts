import type { SupabaseClient } from "@supabase/supabase-js";
import type { Task, TaskComment } from "../types";
import type { CreateTaskInput, TaskRepository, UpdateTaskInput } from "../task.repository";
import { mapTask, mapTaskComment } from "./mappers";

// Disambiguate the assignee FK (tasks has two FKs to profiles: assignee_id + created_by).
const COLS =
  "id,title,description,status,priority,progress,due_date,assignee_id,created_by,dept,created_at,updated_at,completed_at,assignee:profiles!assignee_id(full_name)";
const C_COLS = "id,task_id,author_id,author_username,body,created_at";

export class SupabaseTaskRepository implements TaskRepository {
  constructor(private db: SupabaseClient) {}

  async listForAssignee(userId: string): Promise<Task[]> {
    const { data, error } = await this.db
      .from("tasks")
      .select(COLS)
      .eq("assignee_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapTask);
  }

  async listManaged(): Promise<Task[]> {
    // RLS scopes rows to dept (manager) or all (admin).
    const { data, error } = await this.db.from("tasks").select(COLS).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapTask);
  }

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await this.db.from("tasks").select(COLS).eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapTask(data) : null;
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const { data, error } = await this.db
      .from("tasks")
      .insert({
        title: input.title,
        description: input.description ?? "",
        priority: input.priority ?? "medium",
        due_date: input.dueDate ?? null,
        assignee_id: input.assigneeId,
        created_by: input.createdBy,
        dept: input.dept ?? null,
      })
      .select(COLS)
      .single();
    if (error) throw error;
    return mapTask(data);
  }

  async update(id: string, patch: UpdateTaskInput): Promise<Task> {
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.description !== undefined) row.description = patch.description;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.priority !== undefined) row.priority = patch.priority;
    if (patch.progress !== undefined) row.progress = patch.progress;
    if (patch.dueDate !== undefined) row.due_date = patch.dueDate;
    const { data, error } = await this.db.from("tasks").update(row).eq("id", id).select(COLS).single();
    if (error) throw error;
    return mapTask(data);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.db.from("tasks").delete().eq("id", id);
    if (error) throw error;
  }

  async listComments(taskId: string): Promise<TaskComment[]> {
    const { data, error } = await this.db
      .from("task_comments")
      .select(C_COLS)
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapTaskComment);
  }

  async addComment(input: {
    taskId: string;
    authorId: string;
    authorUsername: string;
    body: string;
  }): Promise<TaskComment> {
    const { data, error } = await this.db
      .from("task_comments")
      .insert({ task_id: input.taskId, author_id: input.authorId, author_username: input.authorUsername, body: input.body })
      .select(C_COLS)
      .single();
    if (error) throw error;
    return mapTaskComment(data);
  }
}
