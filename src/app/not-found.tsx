import Link from "next/link";
import { Home } from "lucide-react";
import { getServerI18n } from "@/lib/i18n/server";

export default function NotFound() {
  const { t } = getServerI18n();

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="card view-in w-full max-w-md p-10 text-center">
        <p className="font-brand text-6xl font-black tracking-tight text-gold drop-shadow-[0_0_24px_rgba(247,183,51,0.35)]">
          404
        </p>
        <h1 className="mt-4 font-brand text-2xl font-bold text-white">{t("errors.notFoundTitle")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-mist">{t("errors.notFoundBody")}</p>
        <Link href="/home" className="btn-gold mt-7 inline-flex items-center gap-2">
          <Home className="h-4 w-4" />
          {t("errors.backHome")}
        </Link>
      </div>
    </div>
  );
}
