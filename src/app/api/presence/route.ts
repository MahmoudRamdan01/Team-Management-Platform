import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getRepositories } from "@/lib/repositories";
import { clientIp } from "@/lib/services/audit.service";

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const h = headers();
  await getRepositories(supabase)
    .presence.heartbeat(user.id, { ip: clientIp(h) ?? undefined, userAgent: h.get("user-agent") ?? undefined })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
