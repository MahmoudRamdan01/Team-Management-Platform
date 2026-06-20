"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Wrench, Bell, CheckSquare, Users, EyeOff, ScrollText, Building2, X, ChevronRight } from "lucide-react";
import { AoiLogo } from "@/components/brand/AoiLogo";
import { useAccess } from "@/lib/rbac/access-context";
import { useI18n } from "@/lib/i18n/context";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { DEPARTMENT_MAP } from "@/lib/constants/departments";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { can, profile } = useAccess();
  const { t, locale } = useI18n();
  const dept = DEPARTMENT_MAP[profile.dept];

  const main = [
    { href: "/home", label: t("nav.home"), icon: Home, show: true },
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard, show: true },
    { href: "/tasks", label: t("nav.tasks"), icon: CheckSquare, show: can(PERMISSIONS.TASK_VIEW) },
    { href: "/tools", label: t("nav.tools"), icon: Wrench, show: can(PERMISSIONS.TOOL_VIEW) },
    { href: "/notifications", label: t("nav.notifications"), icon: Bell, show: true },
    { href: `/departments/${profile.dept}`, label: locale === "ar" ? dept?.nameAr : dept?.nameEn, icon: Building2, show: true },
  ].filter((i) => i.show);

  const admin = [
    { href: "/admin/users", label: t("nav.users"), icon: Users, show: can(PERMISSIONS.USER_MANAGE) },
    { href: "/admin/visibility", label: t("nav.visibility"), icon: EyeOff, show: can(PERMISSIONS.VISIBILITY_MANAGE) },
    { href: "/admin/audit", label: t("nav.audit"), icon: ScrollText, show: can(PERMISSIONS.AUDIT_VIEW) },
  ].filter((i) => i.show);

  const Item = ({ href, label, icon: Icon }: { href: string; label?: string; icon: typeof Users }) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        onClick={onClose}
        className="group relative"
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 relative z-10",
            active 
              ? "text-gold font-bold" 
              : "text-mist hover:text-white"
          )}
        >
          <Icon size={18} className={cn("shrink-0 transition-transform duration-300", active && "scale-110")} />
          <span className="truncate flex-1">{label}</span>
          {active && (
            <motion.div 
              layoutId="active-pill"
              className="absolute inset-0 bg-gold/10 border border-gold/20 rounded-xl -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {active && <ChevronRight size={14} className="opacity-50 rtl:rotate-180" />}
        </div>
      </Link>
    );
  };

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" 
            onClick={onClose} 
          />
        )}
      </AnimatePresence>
      
      <aside
        className={cn(
          "fixed inset-y-0 z-40 flex w-72 shrink-0 flex-col border-e border-white/5 bg-[#0C1218]/95 px-6 py-8 backdrop-blur-xl transition-all duration-500 md:static md:!translate-x-0",
          "ltr:left-0 rtl:right-0 shadow-2xl shadow-black/50",
          mobileOpen ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-10">
          <Link href="/home" onClick={onClose} className="hover:opacity-80 transition-opacity">
            <AoiLogo size="md" />
          </Link>
          <button 
            className="p-2 rounded-full hover:bg-white/5 text-mist md:hidden transition-colors" 
            onClick={onClose} 
            aria-label="close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-8 overflow-y-auto no-scrollbar">
          <div className="space-y-1">
            <div className="px-4 mb-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist/40">القائمة الرئيسية</div>
            <nav className="flex flex-col gap-1">
              {main.map((i) => (
                <Item key={i.href} {...i} />
              ))}
            </nav>
          </div>

          {admin.length > 0 && (
            <div className="space-y-1">
              <div className="px-4 mb-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist/40">{t("nav.admin")}</div>
              <nav className="flex flex-col gap-1">
                {admin.map((i) => (
                  <Item key={i.href} {...i} />
                ))}
              </nav>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-white/5">
          <div className="rounded-2xl bg-white/5 p-4 border border-white/5 group hover:border-gold/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-bold">
                {profile.fullName?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{profile.fullName}</div>
                <div className="text-[0.7rem] text-mist truncate uppercase tracking-wider">{profile.role}</div>
              </div>
            </div>
          </div>
          <div className="mt-4 px-2 font-mono text-[0.6rem] tracking-[0.2em] text-mist/30 text-center uppercase">
            HUB v2.0 · Enterprise Edition
          </div>
        </div>
      </aside>
    </>
  );
}
