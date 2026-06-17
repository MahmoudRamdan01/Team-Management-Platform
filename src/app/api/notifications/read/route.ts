import { NextResponse } from "next/server";
import { getServerContext } from "@/lib/server/context";
import { NotificationService } from "@/lib/services/notification.service";
import { notificationReadSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const ctx = await getServerContext();
  if (!ctx.profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = notificationReadSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const svc = new NotificationService(ctx.repos);
  if (parsed.data.all) {
    await svc.markAllRead(ctx.profile.id);
  } else if (parsed.data.id) {
    await svc.markRead(parsed.data.id, ctx.profile.id);
  }
  return NextResponse.json({ ok: true });
}
