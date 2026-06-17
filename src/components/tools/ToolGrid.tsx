import type { Tool } from "@/lib/repositories/types";
import { ToolCard } from "./ToolCard";

export function ToolGrid({ tools, openLabel, soonLabel, emptyLabel }: { tools: Tool[]; openLabel: string; soonLabel: string; emptyLabel: string }) {
  if (tools.length === 0) {
    return (
      <div className="card grid place-items-center p-12 text-center text-mist">
        <p>{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} openLabel={openLabel} soonLabel={soonLabel} />
      ))}
    </div>
  );
}
