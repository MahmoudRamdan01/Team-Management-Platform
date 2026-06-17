import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getRepositories } from "@/lib/repositories";
import { registerSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/services/audit.service";

export async function POST(req: Request) {
  const h = headers();
  const ip = clientIp(h) ?? "unknown";
  const ua = h.get("user-agent");

  const limit = await rateLimit(`register:${ip}`, 5, 300_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createClient();

  // Uniqueness pre-check for a friendlier error than the DB constraint.
  const existing = await getRepositories(supabase).users.getByUsername(parsed.data.username).catch(() => null);
  if (existing) {
    return NextResponse.json({ error: "That username is taken." }, { status: 409 });
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        username: parsed.data.username,
        dept: parsed.data.dept,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/auth/callback`,
    },
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Registration failed." }, { status: 400 });
  }

  await getRepositories(supabase)
    .audit.log({
      actorId: data.user.id,
      actorUsername: parsed.data.username,
      action: "register",
      targetType: "user",
      targetId: data.user.id,
      metadata: { dept: parsed.data.dept },
      ip,
      userAgent: ua,
    })
    .catch(() => {});

  // If email confirmation is disabled, a session is already active.
  const hasSession = !!data.session;
  return NextResponse.json({ ok: true, needsConfirmation: !hasSession });
}
