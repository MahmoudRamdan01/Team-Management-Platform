import { AoiLogo } from "@/components/brand/AoiLogo";
import { LoginScene } from "@/components/auth/LoginScene";
import { getServerI18n } from "@/lib/i18n/server";
import "./auth.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = getServerI18n();

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#070d15] font-sans">
      {/* full-bleed cinematic scene (also serves as the dimmed mobile backdrop) */}
      <div className="absolute inset-0">
        <LoginScene />
      </div>

      <div className="relative z-10 grid min-h-screen grid-cols-1 md:grid-cols-[1.3fr_1fr]">
        {/* ---- Brand overlay over the scene (desktop) ---- */}
        <div className="relative hidden flex-col justify-between p-10 md:flex lg:p-14">
          <div className="relative z-10">
            <AoiLogo size="lg" />
          </div>
          <div className="relative z-10 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-foam/90 sm:text-sm">
            <span className="h-px w-10 bg-gold/70" />
            {t("auth.modesLine")}
          </div>
        </div>

        {/* ---- Form panel ---- */}
        <div className="ls-form-panel relative flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="relative z-10 w-full max-w-sm">{children}</div>
        </div>
      </div>
    </main>
  );
}
