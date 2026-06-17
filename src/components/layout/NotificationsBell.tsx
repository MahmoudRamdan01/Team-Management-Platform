"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAccess } from "@/lib/rbac/access-context";
import { useI18n } from "@/lib/i18n/context";
import { relativeTime } from "@/lib/utils";

interface Row {
  id: string;
  type: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  read_at: string | null;
  created_at: string;
}

const DOT: Record<string, string> = { info: "#4FC3F7", success: "#43D9A0", warning: "#FF8E5E", urgent: "#e54d4d" };

export function NotificationsBell() {
  const { profile } = useAccess();
  const { locale, t } = useI18n();
  const [items, setItems] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("id,type,title_en,title_ar,body_en,body_ar,read_at,created_at")
      .or(`user_id.eq.${profile.id},user_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(15);
    setItems((data as Row[]) ?? []);
  }, [profile.id]);

  useEffect(() => {
    load();
    const supabase = createClient();
    const ch = supabase
      .channel(`notif:${profile.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [profile.id, load]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((i) => !i.read_at).length;

  async function markAll() {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
    load();
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-mist transition hover:border-gold hover:text-gold"
        aria-label="notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -end-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[0.6rem] font-bold text-gold-ink">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-80 overflow-hidden rounded-brand border border-white/15 bg-panel shadow-brand">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="font-brand text-sm font-semibold text-foam">{t("nav.notifications")}</span>
            {unread > 0 && (
              <button onClick={markAll} className="flex items-center gap-1 text-[0.7rem] text-mist hover:text-gold">
                <CheckCheck size={13} /> {t("notif.markAll")}
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-mist">{t("notif.empty")}</li>}
            {items.map((n) => (
              <li
                key={n.id}
                className={`flex gap-3 border-b border-white/5 px-4 py-3 ${n.read_at ? "opacity-60" : "bg-white/[0.02]"}`}
              >
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: DOT[n.type] ?? "#94A7B8" }} />
                <div className="min-w-0">
                  <p className="truncate text-sm text-foam">{locale === "ar" ? n.title_ar : n.title_en}</p>
                  {(locale === "ar" ? n.body_ar : n.body_en) && (
                    <p className="line-clamp-2 text-xs text-mist">{locale === "ar" ? n.body_ar : n.body_en}</p>
                  )}
                  <span className="font-mono text-[0.58rem] text-mist">{relativeTime(n.created_at, locale)}</span>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-white/10 px-4 py-2.5 text-center text-xs text-gold hover:bg-white/5"
          >
            {t("notif.viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
