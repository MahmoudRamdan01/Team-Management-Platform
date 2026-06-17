export function AoiLogo({ size = "md", withTag = false }: { size?: "sm" | "md" | "lg"; withTag?: boolean }) {
  const cls = size === "lg" ? "text-4xl" : size === "sm" ? "text-xl" : "text-2xl";
  return (
    <div className="flex flex-col">
      <span className={`font-brand font-bold tracking-wide text-foam ${cls}`}>
        AOI<span className="text-gold">.</span>
      </span>
      {withTag && <span className="mt-1 font-mono text-[0.6rem] tracking-[0.3em] text-gold">TEAM HUB · INTERNAL</span>}
    </div>
  );
}
