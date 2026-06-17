"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCheck } from "lucide-react";
import type { Notification } from "@/lib/repositories/types";
import type { Audience } from "@/lib/services/notification.service";
import { useI18n } from "@/lib/i18n/context";
import { relativeTime } from "@/lib/utils";
import { DEPARTMENTS } from "@/lib/constants/departments";
import { ROLES, ROLE_LABELS } from "@/lib/rbac/roles";

const DOT: Record<string, string> = { info: "#4FC3F7", success: "#43D9A0", warning: "#FF8E5E", urgent: "#e54d4d" };

export function NotificationCenter({
  items: initial,
  canSend,
  users,
}: {
  items: Notification[];
  canSend: boolean;
  users: { id: string; fullName: string; username: string }[];
}) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    audience: "all" as Audience,
    target: "",
    type: "info",
    titleEn: "",
    titleAr: "",
    bodyEn: "",
    bodyAr: "",
  });

  async function markRead(id: string) {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, readAt: new Date().toISOString() } : x)));
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }

  async function markAll() {
    setItems((xs) => xs.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })));
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
  }

  async function send() {
    if (!form.titleEn || !form.titleAr) return;
    setBusy(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ ...form, titleEn: "", titleAr: "", bodyEn: "", bodyAr: "" });
        router.refresh();
        alert(`${t("notif.sent")} (${data.sent})`);
      } else {
        alert(data.error ?? "Failed");
      }
    } finally {
      setBusy(false);
    }
  }

  const targetOptions =
    form.audience === "department"
      ? DEPARTMENTS.map((d) => ({ value: d.id, label: d.nameEn }))
      : form.audience === "role"
        ? ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r].en }))
        : form.audience === "user"
          ? users.map((u) => ({ value: u.id, label: `${u.fullName} (@${u.username})` }))
          : [];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* List */}
      <div className={canSend ? "lg:col-span-2" : "lg:col-span-3"}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-brand text-sm font-semibold text-foam">{t("notif.inbox")}</h2>
          <button onClick={markAll} className="flex items-center gap-1.5 text-xs text-mist hover:text-gold">
            <CheckCheck size={14} /> {t("notif.markAll")}
          </button>
        </div>
        <div className="card divide-y divide-white/5">
          {items.length === 0 && <p className="p-8 text-center text-sm text-mist">{t("notif.empty")}</p>}
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.readAt && markRead(n.id)}
              className={`flex w-full gap-3 p-4 text-start transition hover:bg-white/[0.02] ${n.readAt ? "opacity-60" : ""}`}
            >
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: DOT[n.type] ?? "#94A7B8" }} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foam">{locale === "ar" ? n.titleAr : n.titleEn}</p>
                {(locale === "ar" ? n.bodyAr : n.bodyEn) && (
                  <p className="mt-0.5 text-xs text-mist">{locale === "ar" ? n.bodyAr : n.bodyEn}</p>
                )}
                <span className="font-mono text-[0.58rem] text-mist">{relativeTime(n.createdAt, locale)}</span>
              </div>
              {!n.readAt && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold" />}
            </button>
          ))}
        </div>
      </div>

      {/* Compose (admins) */}
      {canSend && (
        <div className="card h-fit p-5">
          <h2 className="mb-4 font-brand text-sm font-semibold text-foam">{t("notif.compose")}</h2>
          <label className="label">{t("notif.audience")}</label>
          <select
            className="input mb-3"
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value as Audience, target: "" })}
          >
            <option value="all">{t("notif.audAll")}</option>
            <option value="department">{t("notif.audDept")}</option>
            <option value="role">{t("notif.audRole")}</option>
            <option value="user">{t("notif.audUser")}</option>
          </select>

          {form.audience !== "all" && (
            <>
              <label className="label">{t("notif.target")}</label>
              <select className="input mb-3" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
                <option value="">—</option>
                {targetOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </>
          )}

          <label className="label">{t("notif.priority")}</label>
          <select className="input mb-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="urgent">Urgent</option>
          </select>

          <label className="label">{t("notif.titleAr")}</label>
          <input className="input mb-3" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} dir="rtl" />
          <label className="label">{t("notif.titleEn")}</label>
          <input className="input mb-3" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} dir="ltr" />
          <label className="label">{t("notif.bodyAr")}</label>
          <textarea className="input mb-3" rows={2} value={form.bodyAr} onChange={(e) => setForm({ ...form, bodyAr: e.target.value })} dir="rtl" />
          <label className="label">{t("notif.bodyEn")}</label>
          <textarea className="input mb-4" rows={2} value={form.bodyEn} onChange={(e) => setForm({ ...form, bodyEn: e.target.value })} dir="ltr" />

          <button onClick={send} disabled={busy} className="btn-gold flex w-full items-center justify-center gap-2">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />} {t("notif.send")}
          </button>
        </div>
      )}
    </div>
  );
}
