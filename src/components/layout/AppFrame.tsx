"use client";

import { useState } from "react";
import { AccessProvider, type AccessSnapshot } from "@/lib/rbac/access-context";
import { useRealtimeSync } from "@/lib/realtime/useRealtime";
import { usePresence } from "@/hooks/usePresence";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { OfflineBanner } from "./OfflineBanner";
import { motion, AnimatePresence } from "framer-motion";

export function AppFrame({ snapshot, children }: { snapshot: AccessSnapshot; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = snapshot;

  useRealtimeSync(profile.id);
  const onlineCount = usePresence({ id: profile.id, fullName: profile.fullName, dept: profile.dept });

  return (
    <AccessProvider snapshot={snapshot}>
      <div className="flex min-h-screen bg-[#060B10] text-foam selection:bg-gold selection:text-gold-ink">
        {/* Subtle Background Decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        
        <div className="flex min-w-0 flex-1 flex-col relative z-10">
          <TopNav onlineCount={onlineCount} onBurger={() => setMobileOpen((o) => !o)} />
          <OfflineBanner />
          
          <main className="flex-1 overflow-y-auto no-scrollbar">
            <div className="mx-auto w-full max-w-[1600px] px-6 py-8 sm:px-10 sm:py-12">
              <AnimatePresence mode="wait">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </AccessProvider>
  );
}
