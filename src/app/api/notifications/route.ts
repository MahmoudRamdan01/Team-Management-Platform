import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getServerContext } from "@/lib/server/context";
import { NotificationService } from "@/lib/services/notification.service";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { notificationSendSchema } from "@/lib/validation/schemas";
import { clientIp } from "@/lib/services/audit.service";

export async function POST(req: Request) {
  const ctx = await getServerContext();
  if (!ctx.profile || !ctx.permissions.has(PERMISSIONS.ADMIN_PANEL)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const parsed = notificationSendSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid", issues: parsed.error.flatten() }, { status: 400 });
  }

  const h = headers();
  const sent = await new NotificationService(ctx.repos).send(ctx.profile, parsed.data, {
    ip: clientIp(h),
    ua: h.get("user-agent"),
  });

  return NextResponse.json({ ok: true, sent });
}
