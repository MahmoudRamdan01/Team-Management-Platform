import type {
  AuditEntry,
  Notification,
  Profile,
  Task,
  TaskComment,
  Tool,
  VisibilityRule,
} from "../types";

/* Row → domain mappers. Keep all snake_case ↔ camelCase translation here so the
   rest of the app only ever sees clean domain models. */

export function mapProfile(r: any): Profile {
  return {
    id: r.id,
    fullName: r.full_name ?? "",
    username: r.username ?? "",
    email: r.email ?? undefined,
    dept: r.dept,
    role: r.role,
    status: r.status,
    mustChangePassword: !!r.must_change_password,
    mfaEnabled: !!r.mfa_enabled,
    locale: r.locale ?? "ar",
    createdAt: r.created_at ?? undefined,
    updatedAt: r.updated_at ?? undefined,
    lastLoginAt: r.last_login_at ?? null,
  };
}

export function mapTool(r: any): Tool {
  return {
    id: r.id,
    dept: r.dept,
    name: r.name,
    version: r.version ?? "",
    status: r.status,
    featured: !!r.featured,
    description: r.description ?? "",
    tags: r.tags ?? [],
    launchKind: r.launch_kind,
    launchUrl: r.launch_url ?? "#",
    minRole: r.min_role ?? "employee",
  };
}

export function mapVisibility(r: any): VisibilityRule {
  const subject =
    r.scope === "user" ? r.subject_user : r.scope === "role" ? r.subject_role : r.subject_dept;
  return {
    id: r.id,
    toolId: r.tool_id,
    scope: r.scope,
    subject: subject ?? "",
    visible: !!r.visible,
    createdBy: r.created_by ?? undefined,
    createdAt: r.created_at ?? undefined,
  };
}

export function mapAudit(r: any): AuditEntry {
  return {
    id: r.id,
    actorId: r.actor_id ?? null,
    actorUsername: r.actor_username ?? "",
    action: r.action,
    targetType: r.target_type ?? null,
    targetId: r.target_id ?? null,
    metadata: r.metadata ?? {},
    ip: r.ip ?? null,
    userAgent: r.user_agent ?? null,
    createdAt: r.created_at,
  };
}

export function mapTask(r: any): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? "",
    status: r.status,
    priority: r.priority,
    progress: r.progress ?? 0,
    dueDate: r.due_date ?? null,
    assigneeId: r.assignee_id,
    assigneeName: r.assignee?.full_name ?? undefined,
    createdBy: r.created_by ?? null,
    dept: r.dept ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    completedAt: r.completed_at ?? null,
  };
}

export function mapTaskComment(r: any): TaskComment {
  return {
    id: r.id,
    taskId: r.task_id,
    authorId: r.author_id ?? null,
    authorUsername: r.author_username ?? "",
    body: r.body,
    createdAt: r.created_at,
  };
}

export function mapNotification(r: any): Notification {
  return {
    id: r.id,
    userId: r.user_id ?? null,
    type: r.type ?? "info",
    titleEn: r.title_en ?? "",
    titleAr: r.title_ar ?? "",
    bodyEn: r.body_en ?? "",
    bodyAr: r.body_ar ?? "",
    data: r.data ?? {},
    readAt: r.read_at ?? null,
    createdAt: r.created_at,
  };
}
