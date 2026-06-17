"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { channels, type PresenceMeta } from "@/lib/realtime/channels";

/**
 * Tracks live presence via Supabase Realtime and periodically persists a durable
 * heartbeat (for the dashboard's "active sessions" metric). Returns the current
 * number of distinct users online.
 */
export function usePresence(profile: { id: string; fullName: string; dept: string }) {
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(channels.presence(), {
      config: { presence: { key: profile.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setOnlineCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const meta: PresenceMeta = {
            userId: profile.id,
            name: profile.fullName,
            dept: profile.dept,
            online_at: new Date().toISOString(),
          };
          await channel.track(meta);
        }
      });

    const ping = () => {
      fetch("/api/presence", { method: "POST" }).catch(() => {});
    };
    ping();
    const interval = setInterval(ping, 60_000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [profile.id, profile.fullName, profile.dept]);

  return onlineCount;
}
