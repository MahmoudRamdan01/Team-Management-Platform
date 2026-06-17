import Link from "next/link";
import { ArrowLeft, ShieldX } from "lucide-react";
import { requireUser } from "@/lib/server/context";
import { getServerI18n } from "@/lib/i18n/server";
import { ToolLauncherFrame } from "@/components/tools/ToolLauncherFrame";

export const dynamic = "force-dynamic";

export default async function ToolLauncherPage({ params }: { params: { toolId: string } }) {
  const ctx = await requireUser();
  const { t } = getServerI18n();

  const { ok, tool } = await ctx.access.canLaunch(ctx.profile, params.toolId);

  if (!ok || !tool) {
    return (
      <div className="card grid place-items-center gap-4 p-16 text-center">
        <ShieldX size={40} className="text-[#FF8E5E]" />
        <p className="text-mist">{t("tools.denied")}</p>
        <Link href="/tools" className="btn-ghost inline-flex items-center gap-2 text-sm">
          <ArrowLeft size={15} /> {t("nav.tools")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-brand text-xl font-bold text-foam">{tool.name}</h1>
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm text-mist hover:text-gold">
          <ArrowLeft size={15} /> {t("nav.tools")}
        </Link>
      </div>
      <ToolLauncherFrame tool={tool} />
    </div>
  );
}
