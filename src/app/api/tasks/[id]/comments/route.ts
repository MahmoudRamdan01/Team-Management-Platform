import { NextResponse } from "next/server";
import { getServerContext } from "@/lib/server/context";
import { TaskService } from "@/lib/services/task.service";
import { taskCommentSchema } from "@/lib/validation/schemas";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ctx = await getServerContext();
  if (!ctx.profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = taskCommentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    const comment = await new TaskService(ctx.repos).addComment(ctx.profile, params.id, parsed.data.body);
    return NextResponse.json({ ok: true, comment });
  } catch {
    return NextResponse.json({ error: "Could not comment." }, { status: 403 });
  }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const ctx = await getServerContext();
  if (!ctx.profile) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const comments = await new TaskService(ctx.repos).listComments(params.id);
  return NextResponse.json({ comments });
}
