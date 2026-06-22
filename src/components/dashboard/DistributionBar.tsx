"use client";

import { motion } from "framer-motion";

export function DistributionBar({
  title,
  data,
  colorMap,
  emptyLabel = "No data available yet",
}: {
  title: string;
  data: { label: string; value: number; color?: string }[];
  colorMap?: Record<string, string>;
  emptyLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="group rounded-[24px] border border-white/5 bg-[#0C1218]/50 p-6 backdrop-blur-sm transition-all hover:border-white/10 hover:bg-[#0C1218]/80 shadow-xl shadow-black/20 h-full">
      <h3 className="mb-6 font-brand text-base font-bold text-white flex items-center gap-2">
        <span className="w-1.5 h-4 bg-gold/50 rounded-full" />
        {title}
      </h3>
      <div className="space-y-5">
        {data.map((d, index) => {
          const pct = Math.round((d.value / total) * 100);
          const color = d.color ?? colorMap?.[d.label] ?? "#F7B733";
          return (
            <div key={d.label} className="group/item">
              <div className="mb-2 flex justify-between text-xs">
                <span className="capitalize text-mist font-medium group-hover/item:text-white transition-colors">
                  {d.label.replace(/_/g, " ")}
                </span>
                <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                  {d.value}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/5 border border-white/5 p-[1px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: index * 0.1, ease: "circOut" }}
                  className="h-full rounded-full relative" 
                  style={{ background: color }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </motion.div>
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-mist/30 italic">
            <p className="text-sm">{emptyLabel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
