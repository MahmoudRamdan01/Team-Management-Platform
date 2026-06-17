import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Comfortaa, Poppins, JetBrains_Mono, Cairo } from "next/font/google";
import { DEFAULT_LOCALE, DIR, type Locale, getDictionary } from "@/lib/i18n/config";
import { Providers } from "./providers";
import "./globals.css";

const comfortaa = Comfortaa({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-comfortaa" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-jetbrains" });
const cairo = Cairo({ subsets: ["arabic", "latin"], weight: ["400", "600", "700"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "AOI. Team Hub — Air Ocean Line",
  description: "Enterprise team management platform for Air Ocean Line.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "AOI Team Hub", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0C1722",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (cookies().get("NEXT_LOCALE")?.value as Locale) || DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  return (
    <html lang={locale} dir={DIR[locale]} suppressHydrationWarning>
      <body
        className={`${comfortaa.variable} ${poppins.variable} ${jetbrains.variable} ${cairo.variable} min-h-screen`}
      >
        <Providers locale={locale} dict={dict}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
