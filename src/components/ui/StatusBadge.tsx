import { cn } from "@/lib/utils";

export function StatusBadge({ kind, children }: { kind: "live" | "soon" | "ok" | "off"; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    live: "text-[#52E5AE] bg-[#43D9A01a] border border-[#43D9A04d]",
    ok: "text-[#52E5AE] bg-[#43D9A01a] border border-[#43D9A04d]",
    soon: "text-mist border border-dashed border-white/20",
    off: "text-[#ff9d9d] border border-[#e54d4d80]",
  };
  return (
    <span className={cn("pill", styles[kind])}>
      <i
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          kind === "live" || kind === "ok" ? "bg-ops animate-pulse" : kind === "off" ? "bg-[#e54d4d]" : "bg-mist opacity-60"
        )}
      />
      {children}
    </span>
  );
}
