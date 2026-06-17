import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getServerContext } from "@/lib/server/context";
import { TaskService } from "@/lib/services/task.service";
import { taskUpdateSchema } from "@/lib/validation/schemas";
import { clientIp } from "@/lib/services/audit.service";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await getServerContext();
  if (!ctx.profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = taskUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });

  // RLS enforces who may update which rows (assignee / creator / manager / admin).
  const h = headers();
  try {
    const task = await new TaskService(ctx.repos).update(ctx.profile, params.id, parsed.data, {
      ip: clientIp(h),
      ua: h.get("user-agent"),
    });
    return NextResponse.json({ ok: true, task });
  } catch {
    return NextResponse.json({ error: "Could not update (you may not have access)." }, { status: 403 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await getServerContext();
  if (!ctx.profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const h = headers();
  try {
    await new TaskService(ctx.repos).remove(ctx.profile, params.id, { ip: clientIp(h), ua: h.get("user-agent") });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete." }, { status: 403 });
  }
}
