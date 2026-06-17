import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getRepositories } from "@/lib/repositories";
import { loginSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/services/audit.service";
import { emailFromUsername } from "@/lib/constants/company";

export async function POST(req: Request) {
  const h = headers();
  const ip = clientIp(h) ?? "unknown";
  const ua = h.get("user-agent");

  const limit = await rateLimit(`login:${ip}`, 8, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = createClient();
  const repos = getRepositories(supabase);

  // Accept a bare username (→ username@airocean.com) or a full email.
  const email = emailFromUsername(parsed.data.email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    await repos.audit
      .log({ actorUsername: email, action: "login_failed", metadata: { email, code: error?.code }, ip, userAgent: ua })
      .catch(() => {});
    const notConfirmed = error?.code === "email_not_confirmed" || /confirm/i.test(error?.message ?? "");
    return NextResponse.json(
      {
        error: notConfirmed
          ? "Your email isn't confirmed yet. Ask an admin, or disable email confirmation in Supabase."
          : "Invalid email or password.",
        code: error?.code,
      },
      { status: 401 }
    );
  }

  const profile = await repos.users.getById(data.user.id).catch(() => null);

  if (profile?.status === "disabled") {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "This account is disabled. Contact an admin." }, { status: 403 });
  }

  await Promise.allSettled([
    repos.users.touchLastLogin(data.user.id),
    repos.presence.heartbeat(data.user.id, { ip, userAgent: ua ?? undefined }),
    repos.audit.log({
      actorId: data.user.id,
      actorUsername: profile?.username ?? parsed.data.email,
      action: "login",
      ip,
      userAgent: ua,
    }),
  ]);

  return NextResponse.json({ ok: true, mustChangePassword: profile?.mustChangePassword ?? false });
}
