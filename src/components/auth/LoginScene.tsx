/**
 * Hand-drawn cinematic freight scene for the login screen — air, ocean and
 * land transport in one night-port composition (lighthouse + sweeping beam,
 * container ship, airplane, port cranes, a truck on a glowing coastal road,
 * stars and shimmering water). Rendered as an animated SVG (motion lives in
 * auth.css), so it needs no image asset and is fully reduced-motion aware.
 */

const STARS = [
  [60, 60], [140, 120], [220, 40], [300, 150], [380, 90], [470, 50], [540, 140],
  [620, 70], [700, 130], [780, 60], [860, 110], [940, 50], [1010, 120], [1060, 70],
  [110, 200], [250, 230], [410, 210], [560, 250], [690, 220], [840, 240], [980, 200],
  [180, 320], [360, 300], [520, 340], [660, 300], [820, 330], [960, 300], [1040, 260],
];

const PORT_LIGHTS = [
  [842, 470], [868, 452], [900, 478], [930, 458], [958, 484], [986, 462],
  [1012, 480], [1038, 466], [884, 496], [948, 500], [1000, 504], [820, 488],
];

const SHIMMER = [
  [120, 590, 150], [260, 640, 220], [430, 600, 180], [330, 700, 140],
  [560, 660, 120], [200, 690, 100], [470, 720, 160],
];

const CONTAINERS = ["#7d5a3a", "#3f5d63", "#5a4750", "#6b6f76", "#8a6a3c", "#445a6e", "#6f523a", "#4a5f55"];

export function LoginScene() {
  return (
    <div className="ls-scene" aria-hidden="true">
      <svg className="ls-svg" viewBox="0 0 1100 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#050b15" />
            <stop offset="0.55" stopColor="#0a1828" />
            <stop offset="1" stopColor="#122a3e" />
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0c1d2e" />
            <stop offset="1" stopColor="#05101a" />
          </linearGradient>
          <radialGradient id="portglow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#f7b733" stopOpacity="0.5" />
            <stop offset="1" stopColor="#f7b733" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ffeab0" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffeab0" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff3c8" />
            <stop offset="0.5" stopColor="#f7b733" stopOpacity="0.5" />
            <stop offset="1" stopColor="#f7b733" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#04080e" stopOpacity="0.7" />
          </radialGradient>
          <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* sky + sea */}
        <rect x="0" y="0" width="1100" height="560" fill="url(#sky)" />
        <rect x="0" y="520" width="1100" height="480" fill="url(#sea)" />
        <ellipse cx="900" cy="520" rx="340" ry="80" fill="url(#portglow)" />

        {/* stars */}
        <g fill="#eaf2ff">
          {STARS.map(([cx, cy], i) => (
            <circle key={i} className="sc-star" cx={cx} cy={cy} r={i % 4 === 0 ? 1.6 : 1} fill={i % 5 === 0 ? "#f7d98a" : "#eaf2ff"} />
          ))}
        </g>

        {/* ===== Port (right) ===== */}
        <g>
          <rect x="780" y="470" width="320" height="60" fill="#0a1626" />
          {/* gantry cranes */}
          {[830, 922, 1014].map((x, i) => (
            <g key={i} stroke="#0c1c2c" strokeWidth="5" fill="none">
              <line x1={x} y1="372" x2={x} y2="490" />
              <line x1={x + 48} y1="384" x2={x + 48} y2="490" />
              <line x1={x - 14} y1="372" x2={x + 70} y2="372" />
              <line x1={x + 24} y1="352" x2={x + 24} y2="372" />
              <line x1={x - 6} y1="382" x2={x + 24} y2="352" />
            </g>
          ))}
          {/* container stacks at quay */}
          <g>
            <rect x="800" y="498" width="40" height="22" fill="#3f5d63" opacity="0.7" />
            <rect x="844" y="500" width="40" height="20" fill="#7d5a3a" opacity="0.7" />
            <rect x="960" y="500" width="44" height="20" fill="#5a4750" opacity="0.7" />
          </g>
          {/* port lights */}
          <g fill="#ffc266">
            {PORT_LIGHTS.map(([cx, cy], i) => (
              <circle key={i} className="sc-plight" cx={cx} cy={cy} r="2.4" />
            ))}
          </g>
        </g>

        {/* ===== Airplane (top centre) ===== */}
        <g className="sc-plane">
          <g transform="translate(470 128) rotate(-8)">
            <path d="M-12 110 L120 -6" stroke="#ffffff" strokeWidth="1.4" strokeOpacity="0.12" fill="none" />
            <g fill="#0f2336" stroke="#274055" strokeWidth="1">
              <ellipse cx="60" cy="0" rx="62" ry="9" />
              <path d="M40 2 L-2 40 L14 42 L66 8 Z" />
              <path d="M64 -2 L36 -44 L50 -46 L86 -6 Z" />
              <path d="M112 -2 L132 -16 L134 -8 L120 4 Z" />
              <ellipse cx="34" cy="6" rx="9" ry="4" fill="#0a1a28" />
              <ellipse cx="56" cy="7" rx="9" ry="4" fill="#0a1a28" />
            </g>
            {/* lit cabin windows */}
            <g fill="#ffe6a8">
              <rect x="78" y="-3" width="22" height="2" rx="1" opacity="0.8" />
            </g>
            <circle className="sc-nav-l" cx="-2" cy="40" r="3" fill="#ff5a5a" />
            <circle className="sc-nav-r" cx="50" cy="-46" r="3" fill="#5ad07a" />
          </g>
        </g>

        {/* ===== Container ship (centre-left) ===== */}
        <g className="sc-ship">
          {/* containers */}
          <g>
            {Array.from({ length: 14 }).map((_, c) =>
              Array.from({ length: 3 }).map((_, r) => (
                <rect
                  key={`${c}-${r}`}
                  x={214 + c * 31}
                  y={452 + r * 17}
                  width="29"
                  height="15"
                  fill={CONTAINERS[(c + r) % CONTAINERS.length]}
                  opacity="0.85"
                />
              ))
            )}
          </g>
          {/* hull */}
          <path d="M150 506 L150 520 Q150 548 210 548 L650 548 Q686 548 700 520 L700 504 Z" fill="#0c1c2e" stroke="#21384c" strokeWidth="1.5" />
          <rect x="150" y="502" width="552" height="7" fill="#f7b733" opacity="0.85" />
          {/* superstructure (stern) */}
          <g>
            <rect x="636" y="430" width="46" height="74" fill="#16283a" stroke="#2a4258" strokeWidth="1" />
            <g fill="#ffe6a8" opacity="0.85">
              <rect x="644" y="440" width="30" height="4" rx="1" />
              <rect x="644" y="450" width="30" height="4" rx="1" />
              <rect x="644" y="460" width="30" height="4" rx="1" />
            </g>
            <line x1="659" y1="430" x2="659" y2="404" stroke="#2a4258" strokeWidth="2" />
            <circle className="sc-plight" cx="659" cy="402" r="2.2" fill="#ff7a7a" />
          </g>
          {/* deck lights */}
          <g fill="#ffd27a">
            {[230, 300, 380, 470, 560, 630].map((x, i) => (
              <circle key={i} className="sc-plight" cx={x} cy="500" r="1.8" />
            ))}
          </g>
          <text x="300" y="534" fontFamily="Comfortaa, sans-serif" fontWeight="700" fontSize="15" letterSpacing="3" fill="#cdd9e4" opacity="0.8">
            AIR OCEAN LINE
          </text>
        </g>

        {/* ===== Lighthouse (left) ===== */}
        <g>
          {/* cliff */}
          <path d="M0 470 L70 432 L150 470 L168 560 L120 640 L0 660 Z" fill="#07121d" />
          <path d="M0 560 L60 540 L150 575 L150 700 L0 720 Z" fill="#0a1622" />
          {/* tower */}
          <g>
            <path d="M86 350 L120 350 L132 470 L74 470 Z" fill="#17293c" stroke="#27425a" strokeWidth="1.5" />
            <rect x="80" y="392" width="46" height="10" fill="#f7b733" opacity="0.85" transform="skewX(0)" />
            <rect x="77" y="430" width="52" height="10" fill="#c9d6e2" opacity="0.5" />
            {/* gallery + lamp room */}
            <rect x="88" y="330" width="30" height="20" fill="#1c3045" stroke="#2a4258" strokeWidth="1" />
            <path d="M86 330 L120 330 L112 314 L94 314 Z" fill="#22384e" />
            <text x="103" y="420" textAnchor="middle" fontFamily="Comfortaa, sans-serif" fontWeight="700" fontSize="13" fill="#cdd9e4" opacity="0.55">AOI</text>
          </g>
          {/* beam + lamp glow (origin at the lamp) */}
          <g transform="translate(103 340)">
            <polygon className="sc-beam" points="0,-8 0,8 560,-95 560,95" fill="url(#beam)" filter="url(#soft)" />
            <circle cx="0" cy="0" r="30" fill="url(#lampGlow)" className="sc-lamp" />
            <circle cx="0" cy="0" r="5" fill="#fff6d8" className="sc-lamp" />
          </g>
        </g>

        {/* ===== Water shimmer / reflections ===== */}
        <g fill="#f7d98a">
          {SHIMMER.map(([cx, cy, w], i) => (
            <rect key={i} className="sc-shimmer" x={cx - w / 2} y={cy} width={w} height="3" rx="1.5" fill={i % 2 ? "#dfeaf5" : "#f7c873"} />
          ))}
        </g>

        {/* ===== Coastal road + truck (foreground) ===== */}
        <g>
          {/* roadside terrain */}
          <path d="M250 1000 Q360 760 520 720 Q700 672 760 612 L900 612 L900 1000 Z" fill="#08121d" />
          <path d="M250 1000 Q330 800 470 752 Q650 700 720 640 L760 660 Q690 724 520 772 Q380 812 320 1000 Z" fill="#0c1825" />
          {/* road surface */}
          <path d="M470 1000 Q520 812 600 740 Q680 668 742 632 L772 660 Q706 702 642 766 Q566 842 556 1000 Z" fill="#0d1722" />
          {/* glowing edges */}
          <path d="M474 1000 Q524 818 602 746 Q682 676 744 640" fill="none" stroke="#f7b733" strokeWidth="2.5" strokeOpacity="0.55" />
          <path d="M552 1000 Q562 846 638 770 Q702 708 770 662" fill="none" stroke="#f7b733" strokeWidth="2.5" strokeOpacity="0.45" />
          {/* flowing centre light */}
          <path className="sc-roadflow" d="M512 1000 Q546 826 620 752 Q690 686 756 648" fill="none" stroke="#ffd980" strokeWidth="2" strokeOpacity="0.8" />

          {/* truck */}
          <g transform="translate(470 838) rotate(-9)">
            {/* headlight glow down the road */}
            <ellipse className="sc-head" cx="-30" cy="20" rx="46" ry="16" fill="#ffe0a0" opacity="0.5" />
            <ellipse cx="74" cy="6" rx="36" ry="9" fill="rgba(0,0,0,0.4)" />
            {/* cargo box */}
            <rect x="8" y="-30" width="74" height="34" rx="4" fill="#15273a" stroke="#2a4258" strokeWidth="1.2" />
            <rect x="8" y="-8" width="74" height="5" fill="#f7b733" opacity="0.9" />
            <text x="20" y="-13" fontFamily="Comfortaa, sans-serif" fontWeight="700" fontSize="6.5" letterSpacing="1" fill="#dCE6F0">AIR OCEAN LINE</text>
            {/* cab */}
            <path d="M-30 -18 h22 v22 h-30 v-10 a12 12 0 0 1 8 -12 Z" fill="#1a2e44" stroke="#2a4258" strokeWidth="1.2" />
            <rect x="-26" y="-14" width="14" height="9" rx="2" fill="#0a1622" />
            <circle className="sc-head" cx="-30" cy="0" r="2.6" fill="#fff0bf" />
            <circle cx="80" cy="2" r="2.2" fill="#ff5a5a" />
            {/* wheels */}
            {[-22, 26, 60].map((wx) => (
              <g key={wx} className="sc-wheel">
                <circle cx={wx} cy="8" r="8" fill="#0a121c" stroke="#33485c" strokeWidth="2.4" />
                <circle cx={wx} cy="8" r="3" fill="#16273a" stroke="#f7b733" strokeWidth="1" />
              </g>
            ))}
          </g>
        </g>

        <rect x="0" y="0" width="1100" height="1000" fill="url(#vignette)" />
      </svg>
    </div>
  );
}
