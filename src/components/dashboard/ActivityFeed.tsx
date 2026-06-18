"use client";

import type { AuditEntry } from "@/lib/repositories/types";
import { relativeTime } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <div className="rounded-[24px] border border-white/5 bg-[#0C1218]/50 p-6 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-[#0C1218]/80 shadow-xl shadow-black/20 h-full">
      <h3 className="mb-6 font-brand text-base font-bold text-white flex items-center gap-2">
        <span className="w-1.5 h-4 bg-blue-500/50 rounded-full" />
        {title}
      </h3>
      <ul className="space-y-4">
        {entries.map((e, index) => (
          <motion.li 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            key={String(e.id)} 
            className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group/item"
          >
            <div className="relative mt-1">
              <span className="block h-3 w-3 shrink-0 rounded-full relative z-10" style={{ background: ACTION_COLORS[e.action] ?? "#94A7B8" }} />
              <span className="absolute inset-0 h-3 w-3 rounded-full animate-ping opacity-20" style={{ background: ACTION_COLORS[e.action] ?? "#94A7B8" }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-white text-sm">
                  <span className="font-bold group-hover/item:text-gold transition-colors">{e.actorUsername || "system"}</span>{" "}
                  <span className="text-mist text-xs uppercase tracking-wider font-medium ml-1">{e.action.replace(/_/g, " ")}</span>
                </p>
                <span className="font-mono text-[0.65rem] text-mist/50 whitespace-nowrap">{relativeTime(e.createdAt)}</span>
              </div>
              {e.targetId && (
                <div className="mt-1 inline-block px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[0.6rem] text-mist/60">
                  Target: {e.targetId}
                </div>
              )}
            </div>
          </motion.li>
        ))}
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-mist/30 italic">
            <p className="text-sm">لا يوجد نشاط مسجل حالياً</p>
          </div>
        )}
      </ul>
    </div>
  );
}
