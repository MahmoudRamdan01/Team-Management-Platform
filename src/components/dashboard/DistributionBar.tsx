export function DistributionBar({
  title,
  data,
  colorMap,
}: {
  title: string;
  data: { label: string; value: number; color?: string }[];
  colorMap?: Record<string, string>;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-brand text-sm font-semibold text-foam">{title}</h3>
      <div className="space-y-3">
        {data.map((d) => {
          const pct = Math.round((d.value / total) * 100);
          const color = d.color ?? colorMap?.[d.label] ?? "#F7B733";
          return (
            <div key={d.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="capitalize text-mist">{d.label.replace(/_/g, " ")}</span>
                <span className="font-mono text-foam">{d.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          );
        })}
        {data.length === 0 && <p className="text-sm text-mist">—</p>}
      </div>
    </div>
  );
}
