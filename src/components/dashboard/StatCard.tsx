"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

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
    <motion.div 
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-[#0C1218]/50 p-6 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-[#0C1218]/80 shadow-xl shadow-black/20"
    >
      {/* Decorative Glow */}
      <div 
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: accent }}
      />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-3">
          <div 
            className="inline-flex p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
            style={{ color: accent, background: `${accent}15`, border: `1px solid ${accent}25` }}
          >
            <Icon size={24} />
          </div>
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist/60 group-hover:text-mist transition-colors">
              {label}
            </div>
            <div className="mt-1 font-brand text-4xl font-black text-white tracking-tight">
              {value}
            </div>
          </div>
        </div>
        
        {/* Sparkle/Line decoration */}
        <div className="h-1 w-8 rounded-full opacity-30" style={{ background: accent }} />
      </div>
    </motion.div>
  );
}
