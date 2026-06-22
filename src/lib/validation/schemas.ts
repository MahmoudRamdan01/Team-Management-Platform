import { z } from "zod";

const USERNAME = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_.-]{3,20}$/, "3–20 chars: letters, numbers, _ . -")
  .transform((v) => v.toLowerCase());

const PASSWORD = z.string().min(8, "At least 8 characters");

const DEPT = z.enum([
  "sales",
  "operations",
  "customer_service",
  "logistics",
  "hr",
  "finance",
  "marketing",
  "it",
]);

const ROLE = z.enum(["super_admin", "admin", "manager", "employee"]);

export const loginSchema = z.object({
  // username or full email — the route appends @airocean.com when there's no "@"
  email: z.string().trim().min(1).max(120),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  // username or full email — same normalisation as login
  email: z.string().trim().min(1).max(120),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    username: USERNAME,
    dept: DEPT,
    password: PASSWORD,
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const changePasswordSchema = z
  .object({ password: PASSWORD, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const visibilityRuleSchema = z.object({
  toolId: z.string().min(1),
  scope: z.enum(["user", "role", "department"]),
  subject: z.string().min(1),
  visible: z.boolean(),
});

export const visibilityDeleteSchema = z.object({ id: z.string().uuid() });

export const updateUserSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().trim().min(2).max(80).optional(),
  dept: DEPT.optional(),
  role: ROLE.optional(),
  status: z.enum(["active", "disabled", "pending"]).optional(),
});

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  username: USERNAME,
  dept: DEPT,
  role: ROLE.default("employee"),
});

export const notificationSendSchema = z
  .object({
    audience: z.enum(["all", "department", "role", "user"]),
    target: z.string().optional(),
    type: z.enum(["info", "success", "warning", "urgent"]).default("info"),
    titleEn: z.string().trim().min(1).max(140),
    titleAr: z.string().trim().min(1).max(140),
    bodyEn: z.string().trim().max(2000).optional(),
    bodyAr: z.string().trim().max(2000).optional(),
  })
  .refine((d) => d.audience === "all" || !!d.target, {
    message: "A target is required for this audience",
    path: ["target"],
  });

const PRIORITY = z.enum(["low", "medium", "high", "urgent"]);
const TASK_STATUS = z.enum(["todo", "in_progress", "done"]);

export const taskCreateSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(4000).optional(),
  priority: PRIORITY.default("medium"),
  dueDate: z.string().datetime().nullable().optional(),
  assigneeId: z.string().uuid(),
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(4000).optional(),
  status: TASK_STATUS.optional(),
  priority: PRIORITY.optional(),
  progress: z.number().int().min(0).max(100).optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const taskCommentSchema = z.object({ body: z.string().trim().min(1).max(2000) });

export const notificationReadSchema = z.object({
  id: z.string().uuid().optional(),
  all: z.boolean().optional(),
});

export type NotificationSendInput = z.infer<typeof notificationSendSchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VisibilityRuleInput = z.infer<typeof visibilityRuleSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
