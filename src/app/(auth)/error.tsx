"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    console.error("[auth error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="card view-in w-full max-w-md p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/20">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="font-brand text-xl font-bold text-white">{t("errors.title")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist">{t("errors.body")}</p>
        <button onClick={reset} className="btn-gold mt-6 inline-flex items-center gap-2">
          <RotateCw className="h-4 w-4" />
          {t("errors.retry")}
        </button>
      </div>
    </div>
  );
}
