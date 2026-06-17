import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getRepositories } from "@/lib/repositories";
import { AccessService } from "@/lib/services/access.service";
import { buildLegacySession } from "@/lib/services/session-bridge.service";
import { clientIp } from "@/lib/services/audit.service";

/**
 * Server-side tool launch. Verifies access (RLS-backed visibility + role), writes
 * a `tool_access` audit row, then mints the short-lived legacy session payload
 * the wrapped HTML tool reads from localStorage. The Supabase JWT is never
 * exposed to the tool.
 */
export async function POST(_req: Request, { params }: { params: { toolId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const repos = getRepositories(supabase);
  const profile = await repos.users.getById(user.id);
  if (!profile) return NextResponse.json({ error: "no profile" }, { status: 403 });

  const access = new AccessService(repos);
  const { ok, tool, reason } = await access.canLaunch(profile, params.toolId);
  if (!ok || !tool) {
    return NextResponse.json({ error: "forbidden", reason }, { status: 403 });
  }

  const h = headers();
  await repos.audit
    .log({
      actorId: profile.id,
      actorUsername: profile.username,
      action: "tool_access",
      targetType: "tool",
      targetId: tool.id,
      metadata: { name: tool.name },
      ip: clientIp(h),
      userAgent: h.get("user-agent"),
    })
    .catch(() => {});

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const expMs = session?.expires_at ? session.expires_at * 1000 : Date.now() + 8 * 3600_000;

  return NextResponse.json({
    session: buildLegacySession(profile, expMs),
    launchUrl: tool.launchUrl,
  });
}
