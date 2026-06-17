import { AoiLogo } from "@/components/brand/AoiLogo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(1100px_700px_at_78%_-10%,#14283c_0%,#0C1722_55%)] p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[22px] border border-gold/20 shadow-brand md:grid-cols-[1.05fr_1fr]">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[#13283D] to-[#0C1722] p-10 md:flex">
          <AoiLogo size="lg" withTag />
          <div className="space-y-4">
            <p className="text-sm leading-loose text-[#B9C6D2]">
              بوابة فريق Air Ocean Line — أدوات الأتمتة، التسويات المالية، وكل شغل الفريق في مكان واحد.
            </p>
            <ul className="space-y-2.5 text-sm font-semibold text-[#DCE6EF]">
              <li className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-gold/45 bg-gold/15 text-[0.7rem] text-gold">✓</span>
                QUICK — دخول واحد لكل الأدوات
              </li>
              <li className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-gold/45 bg-gold/15 text-[0.7rem] text-gold">✓</span>
                SECURE — صلاحيات وسجل تعديلات بالاسم
              </li>
              <li className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-gold/45 bg-gold/15 text-[0.7rem] text-gold">✓</span>
                REAL-TIME — تحديثات فورية لكل الفريق
              </li>
            </ul>
          </div>
          <div className="font-mono text-[0.6rem] tracking-wider text-[#5d6f80]">
            QUICK · RELIABLE · DELIVERED — airoceanline.com.eg
          </div>
        </div>

        {/* Form panel */}
        <div className="bg-[#101F30] p-8 sm:p-10">{children}</div>
      </div>
    </main>
  );
}
