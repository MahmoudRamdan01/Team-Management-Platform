import { AoiLogo } from "@/components/brand/AoiLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060B10] p-4 font-sans">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/5 bg-[#0C1218]/80 backdrop-blur-2xl shadow-2xl md:grid-cols-[1.1fr_1fr]">
        
        {/* Brand/Logistic Panel */}
        <div className="relative hidden flex-col justify-between p-12 md:flex overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-gold/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <AoiLogo size="lg" withTag />
            <div className="mt-16 space-y-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
                  الجيل القادم من <br />
                  <span className="text-gold">إدارة اللوجستيات</span>
                </h2>
                <p className="text-lg text-mist max-w-md leading-relaxed">
                  نحن نجمع بين القوة والمرونة لتوفير بيئة عمل ذكية ومتكاملة لفريق Air Ocean Line.
                </p>
              </div>

              <div className="grid gap-6">
                {[
                  { title: "أتمتة ذكية", desc: "توفير الوقت عبر أتمتة المهام المتكررة", icon: "⚡" },
                  { title: "بيانات فورية", desc: "متابعة دقيقة لكل العمليات في وقتها الفعلي", icon: "📊" },
                  { title: "أمان متطور", desc: "نظام حماية متكامل وصلاحيات دقيقة", icon: "🛡️" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl group-hover:border-gold/50 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{item.title}</h3>
                      <p className="text-sm text-mist">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-8 mt-8">
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-mist/50">
              Quick · Reliable · Delivered
            </div>
            <div className="text-[0.7rem] text-mist/40">
              © 2026 AOI HUB
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="relative flex items-center justify-center bg-[#10171E] p-8 sm:p-12 lg:p-16">
          {/* Subtle Form Border Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-sm">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
