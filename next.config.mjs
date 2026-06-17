import withPWAInit from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_WSS = SUPABASE_URL.replace("https://", "wss://");

/**
 * Strict CSP for the application itself. The only remote origins are the Supabase
 * project (REST + Realtime websockets + storage). 'unsafe-inline' is needed for
 * Next's inline runtime; we intentionally do NOT allow 'unsafe-eval' here.
 */
const appCsp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self' data:`,
  `connect-src 'self' ${SUPABASE_URL} ${SUPABASE_WSS} https://*.supabase.co wss://*.supabase.co`,
  `frame-src 'self'`,
  `frame-ancestors 'self'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join("; ");

/**
 * Scoped CSP for the wrapped legacy reconciler. It runs same-origin in an iframe
 * and loads xlsx-js-style / fflate (jsDelivr), pdf.js (cdnjs) and Google Fonts,
 * and may talk to a local Ollama instance. These allowances are confined to this
 * path only — the rest of the app keeps the strict policy above.
 */
const reconcilerCsp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com`,
  `worker-src 'self' blob: https://cdnjs.cloudflare.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' data: https://fonts.gstatic.com`,
  `img-src 'self' data: blob:`,
  `connect-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com http://localhost:11434`,
  `frame-ancestors 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
].join("; ");

const baseSecurity = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Type safety is enforced via `tsc --noEmit`; lint runs in CI, not the build.
  eslint: { ignoreDuringBuilds: true },
  async headers() {
    return [
      {
        // Reconciler keeps its own relaxed CSP.
        source: "/tools/reconciler/:path*",
        headers: [...baseSecurity, { key: "Content-Security-Policy", value: reconcilerCsp }],
      },
      {
        // Everything else gets the strict CSP (exclude the reconciler subtree).
        source: "/((?!tools/reconciler).*)",
        headers: [...baseSecurity, { key: "Content-Security-Policy", value: appCsp }],
      },
    ];
  },
};

const withPWA = withPWAInit({
  dest: "public",
  disable: isDev,
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withPWA(nextConfig);
