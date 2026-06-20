import { Truck, Gauge, ShieldCheck } from "lucide-react";
import { AoiLogo } from "@/components/brand/AoiLogo";
import { RoadFreightScene } from "@/components/auth/RoadFreightScene";
import "./auth.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060B10] p-4 font-sans">
      {/* ambient blur orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[-10%] top-[-10%] h-[50%] w-[50%] rounded-full bg-gold/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/5 bg-[#0C1218]/80 shadow-2xl backdrop-blur-2xl md:grid-cols-[1.1fr_1fr]">
        {/* ---- Brand panel with cinematic road-freight scene (desktop) ---- */}
        <div className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden p-12 md:flex">
          <RoadFreightScene />

          <div className="relative z-10">
            <AoiLogo size="lg" withTag />
          </div>

          <div className="relative z-10 mt-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-gold">
              <Truck size={13} />
              نقل برّي · Land Freight
            </div>
            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white">
              نُدير حركة <br />
              <span className="text-gold">النقل البرّي</span> بذكاء
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-mist/90">
              منصّة Air Ocean Line الموحّدة لإدارة الفِرق والعمليات — من الاستلام حتى التسليم،
              في مكان واحد متكامل.
            </p>

            <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
              {[
                { icon: Gauge, label: "متابعة فورية" },
                { icon: ShieldCheck, label: "صلاحيات دقيقة" },
                { icon: Truck, label: "تشغيل متكامل" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-foam/80">
                  <Icon size={16} className="text-gold" />
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-9 flex items-center justify-between border-t border-white/10 pt-5">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mist/60">
                Quick · Reliable · Delivered
              </span>
              <span className="text-[0.7rem] text-mist/40">© 2026 AOI HUB</span>
            </div>
          </div>
        </div>

        {/* ---- Form panel ---- */}
        <div className="relative flex items-center justify-center bg-[#10171E] p-8 sm:p-12 lg:p-16">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />

          <div className="relative z-10 w-full max-w-sm">
            {/* mobile-only brand */}
            <div className="mb-8 flex flex-col items-center gap-2 md:hidden">
              <AoiLogo size="md" />
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-gold">
                <Truck size={12} /> نقل برّي · Land Freight
              </span>
            </div>
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
