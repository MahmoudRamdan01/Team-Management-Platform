"use client";

import { useState } from "react";
import { AccessProvider, type AccessSnapshot } from "@/lib/rbac/access-context";
import { useRealtimeSync } from "@/lib/realtime/useRealtime";
import { usePresence } from "@/hooks/usePresence";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { OfflineBanner } from "./OfflineBanner";

export function AppFrame({ snapshot, children }: { snapshot: AccessSnapshot; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = snapshot;

  useRealtimeSync(profile.id);
  const onlineCount = usePresence({ id: profile.id, fullName: profile.fullName, dept: profile.dept });

  return (
    <AccessProvider snapshot={snapshot}>
      <div className="flex min-h-screen">
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopNav onlineCount={onlineCount} onBurger={() => setMobileOpen((o) => !o)} />
          <OfflineBanner />
          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
            <div className="view-in mx-auto w-full max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    </AccessProvider>
  );
}
