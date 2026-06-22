"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AoiLogo } from "@/components/brand/AoiLogo";
import { useI18n } from "@/lib/i18n/context";

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Something went wrong.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.8, 0.28, 1] }}
      className="flex flex-col"
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <AoiLogo size="md" />
        <h1 className="mt-4 font-brand text-xl font-bold text-white sm:text-2xl">{t("auth.forgotTitle")}</h1>
        <span className="mt-3 h-0.5 w-12 rounded-full bg-gold" />
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-mist">{t("auth.forgotSub")}</p>
      </div>

      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface flex flex-col items-center gap-3 px-5 py-8 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold ring-1 ring-gold/20">
              <MailCheck className="h-6 w-6" />
            </div>
            <p className="text-sm leading-relaxed text-foam">{t("auth.forgotSent")}</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} className="space-y-5" exit={{ opacity: 0 }}>
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="group">
              <label className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-mist transition-colors group-focus-within:text-gold">
                {t("auth.email")}
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-mist transition-colors group-focus-within:text-gold"
                  size={18}
                />
                <input
                  className="input ps-11"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("auth.emailPlaceholder")}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="btn-gold flex w-full items-center justify-center gap-2 py-3.5 text-sm uppercase tracking-[0.12em]"
              disabled={busy}
              type="submit"
            >
              {busy ? <Loader2 size={20} className="animate-spin" /> : t("auth.sendResetLink")}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      <Link
        href="/login"
        className="mt-7 inline-flex items-center justify-center gap-2 text-sm font-medium text-mist transition-colors hover:text-gold"
      >
        <ArrowLeft size={15} className="rtl:rotate-180" />
        {t("auth.backToLogin")}
      </Link>
    </motion.div>
  );
}
