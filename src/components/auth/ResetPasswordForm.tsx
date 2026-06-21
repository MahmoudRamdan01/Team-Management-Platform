"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { AoiLogo } from "@/components/brand/AoiLogo";
import { useI18n } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [ready, setReady] = useState<null | boolean>(null); // null = checking
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getUser()
      .then(({ data }) => active && setReady(!!data.user))
      .catch(() => active && setReady(false));
    return () => {
      active = false;
    };
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError(t("auth.pwdShort"));
    if (password !== confirm) return setError(t("auth.pwdMismatch"));
    setBusy(true);
    try {
      const { error: updErr } = await supabase.auth.updateUser({ password });
      if (updErr) {
        setError(updErr.message);
        return;
      }
      setDone(true);
      await supabase.auth.signOut().catch(() => {});
      setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1800);
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
        <h1 className="mt-4 font-brand text-xl font-bold text-white sm:text-2xl">{t("auth.resetTitle")}</h1>
        <span className="mt-3 h-0.5 w-12 rounded-full bg-gold" />
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-mist">{t("auth.resetSub")}</p>
      </div>

      {ready === null && (
        <div className="flex justify-center py-10 text-mist">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {ready === false && !done && (
        <div className="surface flex flex-col items-center gap-3 px-5 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="text-sm leading-relaxed text-foam">{t("auth.resetInvalid")}</p>
          <Link href="/forgot-password" className="mt-1 text-sm font-bold text-gold hover:underline underline-offset-4">
            {t("auth.forgotTitle")}
          </Link>
        </div>
      )}

      {done && (
        <div className="surface flex flex-col items-center gap-3 px-5 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm leading-relaxed text-foam">{t("auth.resetDone")}</p>
        </div>
      )}

      {ready === true && !done && (
        <form onSubmit={onSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <div className="group">
            <label className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-mist transition-colors group-focus-within:text-gold">
              {t("auth.newPassword")}
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
                autoComplete="new-password"
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
          </div>

          <div className="group">
            <label className="mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-mist transition-colors group-focus-within:text-gold">
              {t("auth.confirm")}
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-mist transition-colors group-focus-within:text-gold"
                size={18}
              />
              <input
                className="input ps-11"
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                autoComplete="new-password"
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
            {busy ? <Loader2 size={20} className="animate-spin" /> : t("auth.updatePassword")}
          </motion.button>
        </form>
      )}
    </motion.div>
  );
}
