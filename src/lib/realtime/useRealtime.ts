"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { channels } from "./channels";

/**
 * Subscribes the signed-in client to the realtime streams that affect what they
 * can see, and refreshes server data (router.refresh) on any relevant change —
 * so permission/visibility/notification updates land WITHOUT a manual refresh.
 */
export function useRealtimeSync(userId: string | null, onEvent?: (kind: string) => void) {
  const router = useRouter();
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const personal = supabase
      .channel(channels.user(userId))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        () => {
          onEventRef.current?.("profile");
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => onEventRef.current?.("notification")
      )
      .subscribe();

    const visibility = supabase
      .channel(channels.visibility())
      .on("postgres_changes", { event: "*", schema: "public", table: "tool_visibility" }, () => {
        onEventRef.current?.("visibility");
        router.refresh();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(personal);
      supabase.removeChannel(visibility);
    };
  }, [userId, router]);
}
