import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tool } from "@/lib/repositories/types";
import { DEPARTMENT_MAP } from "@/lib/constants/departments";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function ToolCard({ tool, openLabel, soonLabel }: { tool: Tool; openLabel: string; soonLabel: string }) {
  const dept = DEPARTMENT_MAP[tool.dept];
  const accent = dept?.color ?? "#F7B733";
  const live = tool.status === "live";

  return (
    <div className="card relative flex flex-col gap-3 overflow-hidden p-6">
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.6rem] tracking-[0.14em]" style={{ color: accent }}>
          {tool.id}
        </span>
        <StatusBadge kind={live ? "live" : "soon"}>{live ? "LIVE" : "SOON"}</StatusBadge>
      </div>

      <h3 className="font-brand text-lg font-semibold text-foam">
        {tool.name} {tool.version && <span className="text-xs text-mist">{tool.version}</span>}
      </h3>
      <p className="flex-1 text-sm text-mist">{tool.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {tool.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[0.55rem] tracking-wider text-mist">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-2 border-t border-white/10 pt-3">
        {live ? (
          <Link
            href={`/tools/${tool.id}`}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
            style={{ color: accent, background: `${accent}1f`, border: `1px solid ${accent}40` }}
          >
            {openLabel} <ArrowRight size={14} />
          </Link>
        ) : (
          <span className="text-sm italic text-mist">{soonLabel}</span>
        )}
      </div>
    </div>
  );
}
