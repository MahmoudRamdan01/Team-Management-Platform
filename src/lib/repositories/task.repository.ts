import type { Task, TaskComment, TaskPriority, TaskStatus } from "./types";

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId: string;
  createdBy: string;
  dept?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  progress?: number;
  dueDate?: string | null;
}

export interface TaskRepository {
  /** Tasks assigned to a user (their "My Tasks"). */
  listForAssignee(userId: string): Promise<Task[]>;
  /** Tasks the caller may manage — RLS scopes to dept (manager) or all (admin). */
  listManaged(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(input: CreateTaskInput): Promise<Task>;
  update(id: string, patch: UpdateTaskInput): Promise<Task>;
  remove(id: string): Promise<void>;

  listComments(taskId: string): Promise<TaskComment[]>;
  addComment(input: { taskId: string; authorId: string; authorUsername: string; body: string }): Promise<TaskComment>;
}
