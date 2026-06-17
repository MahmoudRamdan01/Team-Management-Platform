import type { Config } from "tailwindcss";

/**
 * Brand tokens are lifted verbatim from the original AOI Team Hub :root block
 * (dark navy + gold, Comfortaa / Poppins / JetBrains Mono). Keeping the exact
 * hex values guarantees visual continuity with the existing tools (reconciler).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#0C1722",
        navy: "#111E2C",
        panel: "#192634",
        panel2: "#22313F",
        foam: "#F2F6FA",
        mist: "#94A7B8",
        gold: { DEFAULT: "#F7B733", dark: "#E9A41C", ink: "#3A2A05" },
        // department accents
        fin: "#4FC3F7",
        sls: "#FF8E5E",
        ops: "#43D9A0",
        cs: "#B49CFF",
        log: "#5EC8C8",
        hr: "#F78DA7",
        mkt: "#FFC857",
        it: "#7AA2F7",
      },
      fontFamily: {
        brand: ["var(--font-comfortaa)", "var(--font-cairo)", "Comfortaa", "sans-serif"],
        sans: ["var(--font-poppins)", "var(--font-cairo)", "Poppins", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      borderRadius: { brand: "18px" },
      boxShadow: { brand: "0 22px 48px -20px rgba(0,0,0,.6)" },
      keyframes: {
        viewIn: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "none" },
        },
        pulse: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(67,217,160,.5)" },
          "50%": { boxShadow: "0 0 0 5px rgba(67,217,160,0)" },
        },
      },
      animation: {
        viewIn: "viewIn .55s cubic-bezier(.22,.8,.28,1) both",
        pulse: "pulse 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
