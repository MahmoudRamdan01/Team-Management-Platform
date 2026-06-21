"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AoiLogo } from "@/components/brand/AoiLogo";
import { useI18n } from "@/lib/i18n/context";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@airocean.com";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }
      router.replace(params.get("next") || "/home");
      router.refresh();
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
      {/* ---- Brand ---- */}
      <div className="mb-8 flex flex-col items-center text-center">
        <AoiLogo size="lg" />
        <h1 className="mt-4 font-brand text-2xl font-bold uppercase tracking-[0.18em] text-white sm:text-3xl">
          {t("auth.brandName")}
        </h1>
        <span className="mt-3 h-0.5 w-12 rounded-full bg-gold" />
        <p className="mt-3 text-sm font-medium text-gold/90">{t("auth.tagline")}</p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-red-500" />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit} className="space-y-5" autoComplete="on">
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

        <div className="group">
          <label className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-mist transition-colors group-focus-within:text-gold">
            {t("auth.password")}
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-mist transition-colors group-focus-within:text-gold"
              size={18}
            />
            <input
              className="input ps-11 pe-12"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.passwordPlaceholder")}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 p-1 text-mist transition-colors hover:text-gold"
              aria-label="toggle password"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="mt-2 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-gold/90 transition-colors hover:text-gold hover:underline underline-offset-4"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="btn-gold flex w-full items-center justify-center gap-2 py-3.5 text-sm uppercase tracking-[0.12em]"
          disabled={busy}
          type="submit"
        >
          {busy ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <span>{t("auth.login")}</span>
              <ArrowRight size={18} className="rtl:rotate-180" />
            </>
          )}
        </motion.button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-white/10" />
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist/60">{t("auth.or")}</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <a
        href={`mailto:${ADMIN_EMAIL}`}
        className="block text-center text-sm font-medium text-mist transition-colors hover:text-gold"
      >
        {t("auth.contactAdmin")}
      </a>

      {/* mobile-only modes line */}
      <div className="mt-8 flex items-center justify-center gap-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-mist/50 md:hidden">
        <span className="h-px w-6 bg-gold/50" />
        {t("auth.modesLine")}
      </div>
    </motion.div>
  );
}
