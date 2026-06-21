import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema } from "@/lib/validation/schemas";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/services/audit.service";
import { emailFromUsername } from "@/lib/constants/company";

/**
 * Sends a Supabase password-reset email. Always responds `ok` (even for unknown
 * accounts) so we never leak which usernames exist. The reset link lands on
 * /auth/callback, which exchanges the code for a session, then forwards to
 * /reset-password where the user sets a new password.
 */
export async function POST(req: Request) {
  const h = headers();
  const ip = clientIp(h) ?? "unknown";
  const origin = h.get("origin") ?? new URL(req.url).origin;

  const limit = await rateLimit(`forgot:${ip}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const email = emailFromUsername(parsed.data.email);
  const supabase = createClient();
  await supabase.auth
    .resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/reset-password` })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
