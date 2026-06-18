"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col"
    >
      <div className="mb-8">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="font-brand text-3xl font-bold text-white tracking-tight"
        >
          أهلاً بك مجدداً 👋
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-mist"
        >
          سجّل دخولك للوصول إلى منصة إدارة الفريق
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit} className="space-y-5" autoComplete="on">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group"
        >
          <label className="label group-focus-within:text-gold transition-colors">اسم المستخدم أو البريد</label>
          <div className="relative">
            <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 text-mist group-focus-within:text-gold transition-colors" size={18} />
            <input
              className="input ps-11 bg-panel/50 border-white/5 focus:bg-panel transition-all duration-300"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="اسم المستخدم أو البريد الإلكتروني"
              autoComplete="username"
              required
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="group"
        >
          <label className="label group-focus-within:text-gold transition-colors">كلمة السر</label>
          <div className="relative">
            <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 text-mist group-focus-within:text-gold transition-colors" size={18} />
            <input
              className="input ps-11 pe-12 bg-panel/50 border-white/5 focus:bg-panel transition-all duration-300"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 text-mist hover:text-gold transition-colors p-1"
              aria-label="toggle password"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-gold flex items-center justify-center gap-2 py-3.5 shadow-lg shadow-gold/10"
          disabled={busy}
          type="submit"
        >
          {busy ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <span>تسجيل الدخول</span>
              <ArrowRight size={18} className="rtl:rotate-180" />
            </>
          )}
        </motion.button>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center text-sm text-mist"
        >
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-bold text-gold hover:text-white transition-colors underline underline-offset-4 decoration-gold/30 hover:decoration-white">
            إنشاء حساب جديد
          </Link>
        </motion.p>
      </form>
    </motion.div>
  );
}
