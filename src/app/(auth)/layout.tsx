import { LoginScene } from "@/components/auth/LoginScene";
import { getServerI18n } from "@/lib/i18n/server";
import "./auth.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { locale } = getServerI18n();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    // Lock the split to LTR so the scene stays on the left and the form on the
    // right (matching the mockup) in every language; the form text itself still
    // follows the active locale's direction.
    <main dir="ltr" className="relative min-h-screen w-full overflow-hidden bg-[#070d15] font-sans">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[1.3fr_1fr]">
        {/* ---- Cinematic scene (desktop left) ---- */}
        <div className="relative hidden overflow-hidden md:block">
          <LoginScene />
        </div>

        {/* ---- Form panel (also dimmed-scene backdrop on mobile) ---- */}
        <div className="ls-form-panel relative flex items-center justify-center px-6 py-12 sm:px-10">
          <div dir={dir} className="relative z-10 w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
