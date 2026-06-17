"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
      router.replace(params.get("next") || "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col" autoComplete="on">
      <h1 className="font-brand text-2xl font-bold text-foam">أهلًا بيك تاني 👋</h1>
      <p className="mb-6 mt-1 text-sm text-mist">سجّل دخولك عشان توصل لأدوات الفريق.</p>

      {error && (
        <div className="mb-4 rounded-xl border border-[#e54d4d73] bg-[#e54d4d1f] px-3 py-2.5 text-sm text-[#ff9d9d]">{error}</div>
      )}

      <label className="label">البريد الإلكتروني</label>
      <input
        className="input mb-3"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@airoceanline.com.eg"
        autoComplete="email"
        required
      />

      <label className="label">كلمة السر</label>
      <div className="relative mb-5">
        <input
          className="input pe-10"
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
          className="absolute end-3 top-1/2 -translate-y-1/2 text-mist hover:text-gold"
          aria-label="toggle password"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <button className="btn-gold flex items-center justify-center gap-2" disabled={busy} type="submit">
        {busy && <Loader2 size={16} className="animate-spin" />}
        دخول →
      </button>

      <p className="mt-5 text-center text-sm text-mist">
        محتاج حساب؟{" "}
        <Link href="/register" className="font-semibold text-gold hover:underline">
          اعمل حساب جديد
        </Link>
      </p>
    </form>
  );
}
