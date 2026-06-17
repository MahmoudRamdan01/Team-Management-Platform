/* Brand SVG art ported verbatim from the original AOI Team Hub hero. Rendered as
   trusted, static markup (no user input) via dangerouslySetInnerHTML. */

export const TRUCK = `<svg class="veh veh-truck" viewBox="0 0 240 120" aria-hidden="true">
  <ellipse cx="120" cy="112" rx="92" ry="6" fill="rgba(0,0,0,.28)"/>
  <circle cx="62" cy="96" r="14" fill="#0E1922"/><circle cx="62" cy="96" r="6.5" fill="#2C4257"/>
  <circle cx="150" cy="96" r="14" fill="#0E1922"/><circle cx="150" cy="96" r="6.5" fill="#2C4257"/>
  <circle cx="178" cy="96" r="14" fill="#0E1922"/><circle cx="178" cy="96" r="6.5" fill="#2C4257"/>
  <rect x="38" y="32" width="154" height="56" rx="4" fill="#F3F7FB" stroke="rgba(12,23,34,.12)" stroke-width="1"/>
  <rect x="38" y="74" width="154" height="14" rx="2" fill="#0C1722"/>
  <rect x="38" y="32" width="154" height="9" rx="3" fill="#F7B733"/>
  <text x="112" y="66" font-family="Comfortaa, sans-serif" font-weight="700" font-size="22" fill="#0C1722" text-anchor="middle">AOI<tspan fill="#F7B733">.</tspan></text>
  <path d="M192 48h16l14 18v22h-30z" fill="#16273A"/>
  <path d="M192 48h16l14 18h-30z" fill="#1E3349"/>
  <rect x="198" y="56" width="16" height="13" rx="2" fill="#9FC7E6" opacity=".6"/>
  <circle cx="218" cy="86" r="2.4" fill="#F7B733"/>
</svg>`;

export const SHIP = `<svg class="veh veh-ship" viewBox="0 0 240 110" aria-hidden="true">
  <rect x="150" y="14" width="22" height="30" rx="2" fill="#22313F"/>
  <rect x="153" y="20" width="16" height="6" rx="1" fill="#F7B733"/>
  <rect x="60" y="30" width="22" height="16" rx="1.5" fill="#F7B733"/>
  <rect x="84" y="30" width="22" height="16" rx="1.5" fill="#4FC3F7"/>
  <rect x="108" y="30" width="22" height="16" rx="1.5" fill="#FF8E5E"/>
  <rect x="36" y="48" width="22" height="16" rx="1.5" fill="#43D9A0"/>
  <rect x="60" y="48" width="22" height="16" rx="1.5" fill="#B49CFF"/>
  <rect x="84" y="48" width="22" height="16" rx="1.5" fill="#F7B733"/>
  <rect x="108" y="48" width="22" height="16" rx="1.5" fill="#4FC3F7"/>
  <rect x="132" y="48" width="22" height="16" rx="1.5" fill="#FF8E5E"/>
  <path d="M14 66h212l-20 30H34z" fill="#101D2B" stroke="rgba(178,204,230,.18)" stroke-width="1"/>
  <path d="M16 66h208v5H16z" fill="#1B2A39"/>
  <text x="120" y="88" font-family="Comfortaa, sans-serif" font-weight="700" font-size="15" fill="#EAF2FA" text-anchor="middle">AOI<tspan fill="#F7B733">.</tspan></text>
</svg>`;

export const PLANE = `<svg class="veh veh-plane" viewBox="0 0 240 100" aria-hidden="true">
  <path d="M150 44 C172 40 196 42 214 46 C220 47 220 51 214 52 C196 56 172 58 150 54 Z" fill="#16273A"/>
  <path d="M16 50 C44 41 130 36 196 40 C214 41 226 45 226 49 C226 53 214 57 196 58 C130 62 44 59 16 50 Z" fill="#F3F7FB"/>
  <path d="M16 50 C44 54 130 57 196 58 C150 60 80 60 16 50 Z" fill="#0C1722" opacity=".9"/>
  <path d="M150 44 C172 41 196 43 214 47 C200 49 176 51 154 51 Z" fill="#F7B733"/>
  <path d="M88 50 L150 50 L126 78 L100 78 Z" fill="#1E3349"/>
  <path d="M88 50 L150 50 L138 64 L96 64 Z" fill="#16273A"/>
  <path d="M70 48 L46 22 L60 22 L86 48 Z" fill="#22313F"/>
  <path d="M70 52 L48 74 L60 74 L84 52 Z" fill="#1A2A3A"/>
  <rect x="58" y="46" width="70" height="6" rx="3" fill="#F7B733" opacity=".9"/>
  <text x="108" y="51" font-family="Comfortaa, sans-serif" font-weight="700" font-size="15" fill="#0C1722" text-anchor="middle">AOI<tspan fill="#F7B733">.</tspan></text>
  <circle cx="214" cy="49" r="3" fill="#F7B733"/>
  <path d="M16 50 C40 54 70 55 98 54" stroke="#F7B733" stroke-width="2.5" fill="none" opacity=".5" stroke-linecap="round"/>
  <path d="M8 52 C30 56 56 57 84 56" stroke="rgba(226,238,250,.4)" stroke-width="1.5" fill="none" opacity=".4" stroke-linecap="round"/>
</svg>`;

export const wave = (cls: string) =>
  `<svg class="wave ${cls}" viewBox="0 0 2880 120" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" d="M0,64 C240,100 480,18 720,50 C960,82 1200,28 1440,64 C1680,100 1920,18 2160,50 C2400,82 2640,28 2880,64 L2880,120 L0,120 Z"/></svg>`;
