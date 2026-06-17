import { requireUser } from "@/lib/server/context";
import { getServerI18n } from "@/lib/i18n/server";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { HeroLanding, type HeroGate, type HeroFlag, type HeroLabels } from "@/components/home/HeroLanding";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const ctx = await requireUser();
  const { locale, t } = getServerI18n();

  const visible = await ctx.access.effectiveTools(ctx.profile.id);

  const gates: HeroGate[] = DEPARTMENTS.map((d) => {
    const tools = visible.filter((tool) => tool.dept === d.id);
    return {
      id: d.id,
      name: locale === "ar" ? d.nameAr : d.nameEn,
      blurb: locale === "ar" ? d.blurbAr : d.blurbEn,
      color: d.color,
      icon: d.icon,
      toolCount: tools.length,
      liveCount: tools.filter((x) => x.status === "live").length,
    };
  });

  const featured = visible.find((x) => x.featured) ?? null;
  const flagship: HeroFlag | null = featured
    ? { id: featured.id, name: featured.name, version: featured.version, desc: featured.description, tags: featured.tags }
    : null;

  const labels: HeroLabels = {
    eyebrow: t("home.eyebrow"),
    title1: t("home.title1"),
    title2: t("home.title2"),
    find: t("home.find"),
    openw: t("home.openw"),
    done: t("home.done"),
    sub: t("home.sub"),
    browse: t("home.browse"),
    search: t("home.search"),
    statDepts: t("home.statDepts"),
    statTools: t("home.statTools"),
    statLive: t("home.statLive"),
    pickDept: t("home.pickDept"),
    pickDeptSub: t("home.pickDeptSub"),
    openDept: t("home.openDept"),
    flagship: t("home.flagship"),
    flagshipSub: t("home.flagshipSub"),
    openTool: t("home.openTool"),
    tools: t("home.tools"),
    live: t("home.live"),
  };

  const stats = {
    departments: DEPARTMENTS.length,
    tools: visible.length,
    live: visible.filter((x) => x.status === "live").length,
  };

  return <HeroLanding stats={stats} gates={gates} flagship={flagship} labels={labels} />;
}
