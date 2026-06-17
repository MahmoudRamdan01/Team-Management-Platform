import { notFound } from "next/navigation";
import { requireUser } from "@/lib/server/context";
import { getServerI18n } from "@/lib/i18n/server";
import { DEPARTMENT_MAP } from "@/lib/constants/departments";
import { DeptIcon } from "@/components/brand/DeptIcon";
import { ToolGrid } from "@/components/tools/ToolGrid";

export const dynamic = "force-dynamic";

export default async function DepartmentPage({ params }: { params: { deptId: string } }) {
  const ctx = await requireUser();
  const { locale, t } = getServerI18n();
  const dept = DEPARTMENT_MAP[params.deptId];
  if (!dept) notFound();

  const all = await ctx.access.effectiveTools(ctx.profile.id);
  const tools = all.filter((tool) => tool.dept === dept.id);
  const accent = dept.color;

  return (
    <div className="space-y-6">
      <div className="card relative flex items-center gap-5 overflow-hidden p-6">
        <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />
        <div
          className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl"
          style={{ color: accent, background: `${accent}1f`, border: `1px solid ${accent}40` }}
        >
          <DeptIcon name={dept.icon} className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-brand text-2xl font-bold text-foam">{locale === "ar" ? dept.nameAr : dept.nameEn}</h1>
          <p className="mt-1 text-sm text-mist">{locale === "ar" ? dept.blurbAr : dept.blurbEn}</p>
        </div>
        <span className="ms-auto font-mono text-xs tracking-widest" style={{ color: accent }}>
          {dept.code}
        </span>
      </div>

      <ToolGrid tools={tools} openLabel={t("tools.open")} soonLabel={t("tools.soon")} emptyLabel={t("tools.empty")} />
    </div>
  );
}
