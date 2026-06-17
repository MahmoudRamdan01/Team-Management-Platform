"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut, Languages, Circle } from "lucide-react";
import { useAccess } from "@/lib/rbac/access-context";
import { useI18n } from "@/lib/i18n/context";
import { ROLE_LABELS } from "@/lib/rbac/roles";
import { DEPARTMENT_MAP } from "@/lib/constants/departments";

export function TopNav({ onlineCount, onBurger }: { onlineCount: number; onBurger: () => void }) {
  const router = useRouter();
  const { profile } = useAccess();
  const { locale, setLocale, t } = useI18n();
  const dept = DEPARTMENT_MAP[profile.dept];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    // Clear the legacy bridge session so wrapped tools (reconciler) re-lock.
    try {
      localStorage.removeItem("AOI_SESSION_SHARED");
    } catch {
      /* ignore */
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/10 bg-ink/85 px-4 backdrop-blur sm:px-8">
      <button className="text-foam md:hidden" onClick={onBurger} aria-label="menu">
        <Menu size={22} />
      </button>

      <div className="ms-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-mist sm:flex">
          <Circle size={8} className="fill-ops text-ops" />
          {onlineCount} {t("dashboard.onlineNow")}
        </span>

        <button
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-mist transition hover:border-gold hover:text-foam"
          aria-label="toggle language"
        >
          <Languages size={15} />
          {locale === "ar" ? "EN" : "ع"}
        </button>

        <div className="flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5">
          <span className="text-xs font-bold text-[#F4D9A0]">{profile.fullName}</span>
          <span className="font-mono text-[0.56rem] tracking-wider text-gold">
            {dept?.code} · {ROLE_LABELS[profile.role][locale]}
          </span>
        </div>

        <button
          onClick={logout}
          className="grid h-9 w-9 place-items-center rounded-lg border border-white/15 text-mist transition hover:border-gold hover:text-gold"
          aria-label={t("auth.logout")}
          title={t("auth.logout")}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
