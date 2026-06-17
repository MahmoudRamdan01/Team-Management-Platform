"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { DEPARTMENTS } from "@/lib/constants/departments";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", dept: "operations", password: "", confirm: "" });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      if (data.needsConfirmation) {
        setInfo("تم إنشاء الحساب ✅ — افتح بريدك لتأكيد الحساب ثم سجّل الدخول.");
        return;
      }
      router.replace("/home");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col" autoComplete="on">
      <h1 className="font-brand text-2xl font-bold text-foam">انضم لفريق AOI</h1>
      <p className="mb-5 mt-1 text-sm text-mist">اعمل حسابك واختار قسمك.</p>

      {error && <div className="mb-4 rounded-xl border border-[#e54d4d73] bg-[#e54d4d1f] px-3 py-2.5 text-sm text-[#ff9d9d]">{error}</div>}
      {info && <div className="mb-4 rounded-xl border border-[#43D9A066] bg-[#43D9A01a] px-3 py-2.5 text-sm text-[#7ef0c4]">{info}</div>}

      <label className="label">الاسم الكامل</label>
      <input className="input mb-3" value={form.fullName} onChange={set("fullName")} placeholder="محمود أحمد" required />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">اسم المستخدم</label>
          <input className="input mb-3" value={form.username} onChange={set("username")} placeholder="mahmoud" required />
        </div>
        <div>
          <label className="label">القسم</label>
          <select className="input mb-3" value={form.dept} onChange={set("dept")}>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameEn} — {d.nameAr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="label">البريد الإلكتروني</label>
      <input className="input mb-3" type="email" value={form.email} onChange={set("email")} placeholder="you@airoceanline.com.eg" required />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">كلمة السر</label>
          <div className="relative mb-1">
            <input
              className="input pe-10"
              type={show ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
              required
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute end-3 top-1/2 -translate-y-1/2 text-mist hover:text-gold">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">تأكيد كلمة السر</label>
          <input className="input" type="password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" required />
        </div>
      </div>

      <button className="btn-gold mt-5 flex items-center justify-center gap-2" disabled={busy} type="submit">
        {busy && <Loader2 size={16} className="animate-spin" />}
        إنشاء الحساب →
      </button>

      <p className="mt-5 text-center text-sm text-mist">
        عندك حساب؟{" "}
        <Link href="/login" className="font-semibold text-gold hover:underline">
          سجّل الدخول
        </Link>
      </p>
    </form>
  );
}
