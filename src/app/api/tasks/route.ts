import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getServerContext } from "@/lib/server/context";
import { TaskService } from "@/lib/services/task.service";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { taskCreateSchema } from "@/lib/validation/schemas";
import { clientIp } from "@/lib/services/audit.service";

export async function POST(req: Request) {
  const ctx = await getServerContext();
  if (!ctx.profile || !ctx.permissions.has(PERMISSIONS.TASK_MANAGE)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = taskCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });

  const h = headers();
  const task = await new TaskService(ctx.repos).create(ctx.profile, parsed.data, {
    ip: clientIp(h),
    ua: h.get("user-agent"),
  });
  return NextResponse.json({ ok: true, task });
}
