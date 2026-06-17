"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, Wrench, Bell, CheckSquare, Users, EyeOff, ScrollText, Building2, X } from "lucide-react";
import { AoiLogo } from "@/components/brand/AoiLogo";
import { useAccess } from "@/lib/rbac/access-context";
import { useI18n } from "@/lib/i18n/context";
import { PERMISSIONS } from "@/lib/rbac/permissions";
import { DEPARTMENT_MAP } from "@/lib/constants/departments";
import { cn } from "@/lib/utils";

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
        className={cn(
          "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition",
          active ? "bg-gold-soft font-medium text-gold" : "text-mist hover:bg-white/5 hover:text-foam"
        )}
      >
        <Icon size={18} className="shrink-0" />
        <span className="truncate">{label}</span>
      </Link>
    );
  };

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />}
      <aside
        className={cn(
          // `md:!translate-x-0` must use !important: in RTL, `rtl:translate-x-full`
          // has higher specificity than a plain `md:translate-x-0` and would keep
          // the sidebar off-canvas on desktop.
          "fixed inset-y-0 z-40 flex w-64 shrink-0 flex-col border-e border-white/10 bg-navy/95 px-4 py-5 backdrop-blur transition-transform md:static md:!translate-x-0",
          "ltr:left-0 rtl:right-0",
          mobileOpen ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-1">
          <Link href="/home" onClick={onClose}>
            <AoiLogo />
          </Link>
          <button className="text-mist md:hidden" onClick={onClose} aria-label="close">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {main.map((i) => (
            <Item key={i.href} {...i} />
          ))}

          {admin.length > 0 && (
            <>
              <div className="mt-6 px-3.5 font-mono text-[0.58rem] tracking-[0.2em] text-mist">{t("nav.admin")}</div>
              {admin.map((i) => (
                <Item key={i.href} {...i} />
              ))}
            </>
          )}
        </nav>

        <div className="px-2 font-mono text-[0.55rem] tracking-wider text-mist">HUB v2.0 · ENTERPRISE</div>
      </aside>
    </>
  );
}
