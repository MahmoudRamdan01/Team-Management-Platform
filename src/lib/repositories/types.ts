/**
 * Domain models — plain TypeScript, framework- and backend-agnostic.
 *
 * IMPORTANT: nothing in this file may import from `@supabase/*`. These types are
 * the contract that services and UI depend on. Repository *implementations*
 * (lib/repositories/supabase/*) translate between these and the database.
 */

export type Role = "super_admin" | "admin" | "manager" | "employee";

export type DeptId =
  | "sales"
  | "operations"
  | "customer_service"
  | "logistics"
  | "hr"
  | "finance"
  | "marketing"
  | "it";

export type UserStatus = "active" | "disabled" | "pending";
export type Locale = "ar" | "en";
export type ToolStatus = "live" | "soon";
export type LaunchKind = "iframe" | "external" | "route";
export type VisibilityScope = "user" | "role" | "department";

export type AuditAction =
  | "login"
  | "logout"
  | "login_failed"
  | "register"
  | "permission_change"
  | "visibility_change"
  | "tool_access"
  | "user_create"
  | "user_update"
  | "user_disable"
  | "role_change"
  | "admin_action";

export interface Department {
  id: DeptId;
  code: string;
  nameEn: string;
  nameAr: string;
  color: string;
  icon: string;
  blurbEn: string;
  blurbAr: string;
  sortOrder: number;
}

export interface Profile {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  dept: DeptId;
  role: Role;
  status: UserStatus;
  mustChangePassword: boolean;
  mfaEnabled: boolean;
  locale: Locale;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

export interface Tool {
  id: string;
  dept: DeptId;
  name: string;
  version: string;
  status: ToolStatus;
  featured: boolean;
  description: string;
  tags: string[];
  launchKind: LaunchKind;
  launchUrl: string;
  minRole: Role;
}

export interface VisibilityRule {
  id: string;
  toolId: string;
  scope: VisibilityScope;
  /** user id, role name, or dept id depending on scope */
  subject: string;
  visible: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface AuditEntry {
  id: number | string;
  actorId: string | null;
  actorUsername: string;
  action: AuditAction;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface NewAuditEntry {
  actorId?: string | null;
  actorUsername: string;
  action: AuditAction;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}

export interface AuditFilter {
  actorId?: string;
  action?: AuditAction;
  targetType?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface Notification {
  id: string;
  userId: string | null;
  type: string;
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  activeSessions: number;
  onlineNow: number;
  roleDistribution: Record<Role, number>;
  deptDistribution: Record<string, number>;
  toolsLive: number;
  recentActivity: AuditEntry[];
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  dueDate: string | null;
  assigneeId: string;
  assigneeName?: string;
  createdBy: string | null;
  dept: DeptId | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string | null;
  authorUsername: string;
  body: string;
  createdAt: string;
}
