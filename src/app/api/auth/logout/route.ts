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

  if (user) {
    const repos = getRepositories(supabase);
    const profile = await repos.users.getById(user.id).catch(() => null);
    const h = headers();
    await Promise.allSettled([
      repos.presence.revoke(user.id),
      repos.audit.log({
        actorId: user.id,
        actorUsername: profile?.username ?? "",
        action: "logout",
        ip: clientIp(h),
        userAgent: h.get("user-agent"),
      }),
    ]);
  }

  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
