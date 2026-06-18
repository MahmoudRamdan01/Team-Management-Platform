"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut, Languages, Circle, User } from "lucide-react";
import { useAccess } from "@/lib/rbac/access-context";
import { useI18n } from "@/lib/i18n/context";
import { ROLE_LABELS } from "@/lib/rbac/roles";
import { DEPARTMENT_MAP } from "@/lib/constants/departments";
import { NotificationsBell } from "./NotificationsBell";
import { motion } from "framer-motion";

export function TopNav({ onlineCount, onBurger }: { onlineCount: number; onBurger: () => void }) {
  const router = useRouter();
  const { profile } = useAccess();
  const { locale, setLocale, t } = useI18n();
  const dept = DEPARTMENT_MAP[profile.dept];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    try {
      localStorage.removeItem("AOI_SESSION_SHARED");
    } catch {
      /* ignore */
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center gap-4 border-b border-white/5 bg-[#0C1218]/80 px-6 backdrop-blur-xl sm:px-10">
      <motion.button 
        whileTap={{ scale: 0.95 }}
        className="p-2 rounded-xl bg-white/5 text-foam md:hidden hover:bg-white/10 transition-colors" 
        onClick={onBurger} 
        aria-label="menu"
      >
        <Menu size={22} />
      </motion.button>

      <div className="ms-auto flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-full bg-white/5 border border-white/5 px-4 py-2 text-xs text-mist sm:flex group hover:border-white/10 transition-colors">
          <Circle size={8} className="fill-emerald-500 text-emerald-500 animate-pulse" />
          <span className="font-medium">{onlineCount} {t("dashboard.onlineNow")}</span>
        </div>

        <NotificationsBell />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/5 px-4 py-2 text-xs font-bold text-mist transition-all hover:bg-white/10 hover:text-white"
          aria-label="toggle language"
        >
          <Languages size={16} />
          <span className="uppercase">{locale === "ar" ? "EN" : "عربي"}</span>
        </motion.button>

        <div className="hidden md:flex items-center gap-3 ps-4 border-s border-white/5">
          <div className="text-end">
            <div className="text-sm font-bold text-white leading-none">{profile.fullName}</div>
            <div className="mt-1 font-mono text-[0.6rem] tracking-wider text-gold/80 uppercase">
              {dept?.code} · {ROLE_LABELS[profile.role][locale]}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center text-gold">
            <User size={20} />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/5 text-mist transition-colors hover:text-red-400 hover:border-red-400/30"
          aria-label={t("auth.logout")}
          title={t("auth.logout")}
        >
          <LogOut size={18} />
        </motion.button>
      </div>
    </header>
  );
}
