"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, User, ArrowRight, Plane, Ship, Truck, ShieldCheck, ChevronRight, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/context";

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

  const modes = [
    { icon: Plane, title: t("auth.airFreight"), sub: t("auth.airFreightSub") },
    { icon: Ship, title: t("auth.oceanFreight"), sub: t("auth.oceanFreightSub") },
    { icon: Truck, title: t("auth.domestic"), sub: t("auth.domesticSub") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 0.8, 0.28, 1] }}
      className="flex flex-col"
    >
      {/* ---- Brand ---- */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="font-brand text-4xl font-black tracking-wide text-gold drop-shadow-[0_0_18px_rgba(247,183,51,0.35)]">
          AOI<span className="text-gold">.</span>
        </div>
        <h1 className="mt-2 font-brand text-2xl font-bold uppercase tracking-[0.18em] text-white sm:text-[1.7rem]">
          {t("auth.brandName")}
        </h1>
        <span className="mt-3 h-0.5 w-12 rounded-full bg-gold" />
        <p className="mt-3 text-sm font-medium text-gold/90">{t("auth.tagline")}</p>
      </div>

      {/* ---- Freight-mode chips ---- */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        {modes.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/[0.03] px-1 py-3 text-center">
            <Icon size={18} className="text-gold" />
            <span className="text-[0.68rem] font-bold leading-tight text-white">{title}</span>
            <span className="text-[0.58rem] leading-tight text-mist/70">{sub}</span>
          </div>
        ))}
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

      <form onSubmit={onSubmit} className="space-y-4" autoComplete="on">
        <div className="group">
          <label className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-mist transition-colors group-focus-within:text-gold">
            {t("auth.email")}
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-mist transition-colors group-focus-within:text-gold" size={18} />
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
            <Lock className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-mist transition-colors group-focus-within:text-gold" size={18} />
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
            <Link href="/forgot-password" className="text-xs font-medium text-gold/90 underline-offset-4 transition-colors hover:text-gold hover:underline">
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

      <div className="my-5 flex items-center gap-4">
        <span className="h-px flex-1 bg-white/10" />
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-mist/60">{t("auth.or")}</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <Link
        href="/register"
        className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-foam transition-all duration-300 hover:border-gold/60 hover:bg-white/[0.08] hover:text-white"
      >
        <UserPlus size={16} className="text-gold" />
        {t("auth.requestAccess")}
        <ChevronRight size={15} className="text-mist rtl:rotate-180" />
      </Link>

      {/* ---- Trust footer ---- */}
      <div className="mt-7 flex items-start justify-center gap-2 text-center">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-gold" />
        <div className="text-xs leading-relaxed">
          <span className="font-medium text-foam">{t("auth.secureLine")}</span>{" "}
          <span className="text-mist/70">{t("auth.secureSub")}</span>
        </div>
      </div>
    </motion.div>
  );
}
