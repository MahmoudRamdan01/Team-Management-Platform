import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "#F7B733",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="card relative overflow-hidden p-5">
      <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accent }} />
      <div className="flex items-center justify-between">
        <div>
          <div className="font-brand text-3xl font-bold text-foam">{value}</div>
          <div className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-mist">{label}</div>
        </div>
        <div
          className="grid h-11 w-11 place-items-center rounded-xl"
          style={{ color: accent, background: `${accent}1f`, border: `1px solid ${accent}40` }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
