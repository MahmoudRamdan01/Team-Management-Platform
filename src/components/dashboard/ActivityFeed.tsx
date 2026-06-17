import type { AuditEntry } from "@/lib/repositories/types";
import { relativeTime } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  login: "#43D9A0",
  logout: "#94A7B8",
  login_failed: "#FF8E5E",
  tool_access: "#4FC3F7",
  visibility_change: "#F7B733",
  permission_change: "#F7B733",
  role_change: "#B49CFF",
  register: "#43D9A0",
};

export function ActivityFeed({ entries, title }: { entries: AuditEntry[]; title: string }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-brand text-sm font-semibold text-foam">{title}</h3>
      <ul className="space-y-3">
        {entries.map((e) => (
          <li key={String(e.id)} className="flex items-start gap-3 text-sm">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: ACTION_COLORS[e.action] ?? "#94A7B8" }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-foam">
                <span className="font-medium">{e.actorUsername || "system"}</span>{" "}
                <span className="text-mist">{e.action.replace(/_/g, " ")}</span>
                {e.targetId && <span className="font-mono text-xs text-mist"> · {e.targetId}</span>}
              </p>
              <span className="font-mono text-[0.6rem] text-mist">{relativeTime(e.createdAt)}</span>
            </div>
          </li>
        ))}
        {entries.length === 0 && <li className="text-sm text-mist">No activity yet.</li>}
      </ul>
    </div>
  );
}
