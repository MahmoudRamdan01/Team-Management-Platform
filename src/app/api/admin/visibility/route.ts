import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getServerContext } from "@/lib/server/context";
import { VisibilityService } from "@/lib/services/visibility.service";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { visibilityRuleSchema, visibilityDeleteSchema } from "@/lib/validation/schemas";
import { clientIp } from "@/lib/services/audit.service";

export async function POST(req: Request) {
  const ctx = await getServerContext();
  if (!ctx.profile || !ctx.permissions.has(PERMISSIONS.VISIBILITY_MANAGE)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = visibilityRuleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });

  const h = headers();
  const svc = new VisibilityService(ctx.repos);
  const rule = await svc.setRule(ctx.profile, parsed.data, { ip: clientIp(h), ua: h.get("user-agent") });
  return NextResponse.json({ ok: true, rule });
}

export async function DELETE(req: Request) {
  const ctx = await getServerContext();
  if (!ctx.profile || !ctx.permissions.has(PERMISSIONS.VISIBILITY_MANAGE)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = visibilityDeleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const h = headers();
  await new VisibilityService(ctx.repos).removeRule(ctx.profile, parsed.data.id, {
    ip: clientIp(h),
    ua: h.get("user-agent"),
  });
  return NextResponse.json({ ok: true });
}
