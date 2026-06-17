import { z } from "zod";

const USERNAME = z
  .string()
  .trim()
  .regex(/^[a-z0-9_.-]{3,20}$/, "3–20 chars: a–z, 0–9, _ . -");

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
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    username: USERNAME,
    email: z.string().email(),
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
  email: z.string().email(),
  dept: DEPT,
  role: ROLE.default("employee"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VisibilityRuleInput = z.infer<typeof visibilityRuleSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
