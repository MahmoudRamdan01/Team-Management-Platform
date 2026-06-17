import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { getServerContext } from "@/lib/server/context";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRepositories } from "@/lib/repositories";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { canManageRole } from "@/lib/rbac/roles";
import { createUserSchema, updateUserSchema } from "@/lib/validation/schemas";
import { clientIp } from "@/lib/services/audit.service";
import type { Role } from "@/lib/repositories/types";

function tempPassword() {
  return `Aoi-${randomBytes(4).toString("hex")}`;
}

export async function POST(req: Request) {
  const ctx = await getServerContext();
  if (!ctx.profile || !ctx.permissions.has(PERMISSIONS.USER_MANAGE)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = createUserSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });

  if (!canManageRole(ctx.profile.role, parsed.data.role as Role)) {
    return NextResponse.json({ error: "You cannot assign that role." }, { status: 403 });
  }

  const admin = createAdminClient();
  const password = tempPassword();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName, username: parsed.data.username, dept: parsed.data.dept },
  });
  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Could not create user." }, { status: 400 });
  }

  // Trigger created the base profile; elevate role/dept and require a reset.
  await admin
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      username: parsed.data.username,
      dept: parsed.data.dept,
      role: parsed.data.role,
      status: "active",
      must_change_password: true,
    })
    .eq("id", data.user.id);

  const h = headers();
  await ctx.repos.audit
    .log({
      actorId: ctx.profile.id,
      actorUsername: ctx.profile.username,
      action: "user_create",
      targetType: "user",
      targetId: data.user.id,
      metadata: { username: parsed.data.username, role: parsed.data.role, dept: parsed.data.dept },
      ip: clientIp(h),
      userAgent: h.get("user-agent"),
    })
    .catch(() => {});

  return NextResponse.json({ ok: true, tempPassword: password });
}

export async function PATCH(req: Request) {
  const ctx = await getServerContext();
  if (!ctx.profile || !ctx.permissions.has(PERMISSIONS.USER_MANAGE)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = updateUserSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });

  const admin = createAdminClient();
  const target = await getRepositories(admin).users.getById(parsed.data.id);
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Role changes require authority over BOTH the current and the new role.
  if (parsed.data.role && parsed.data.role !== target.role) {
    if (!canManageRole(ctx.profile.role, target.role) || !canManageRole(ctx.profile.role, parsed.data.role)) {
      return NextResponse.json({ error: "You cannot change this user's role." }, { status: 403 });
    }
  }
  if (ctx.profile.id === parsed.data.id && parsed.data.role && parsed.data.role !== ctx.profile.role) {
    return NextResponse.json({ error: "You cannot change your own role." }, { status: 403 });
  }

  const updated = await getRepositories(admin).users.update(parsed.data.id, {
    fullName: parsed.data.fullName,
    dept: parsed.data.dept,
    role: parsed.data.role,
    status: parsed.data.status,
  });

  const h = headers();
  const action = parsed.data.role && parsed.data.role !== target.role ? "role_change" : parsed.data.status === "disabled" ? "user_disable" : "user_update";
  await ctx.repos.audit
    .log({
      actorId: ctx.profile.id,
      actorUsername: ctx.profile.username,
      action,
      targetType: "user",
      targetId: parsed.data.id,
      metadata: { before: { role: target.role, status: target.status }, after: { role: updated.role, status: updated.status } },
      ip: clientIp(h),
      userAgent: h.get("user-agent"),
    })
    .catch(() => {});

  return NextResponse.json({ ok: true, user: updated });
}
