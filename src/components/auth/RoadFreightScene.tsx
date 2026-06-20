/**
 * Cinematic land-freight backdrop for the auth screen.
 * Pure-CSS animation (see app/(auth)/auth.css) — no client JS, and fully
 * disabled under prefers-reduced-motion. Air Ocean Line specialises in road
 * transport, so the scene is a night highway with a freight truck on the move.
 */
export function RoadFreightScene() {
  return (
    <div className="rf-scene" aria-hidden="true">
      <div className="rf-sky" />
      <div className="rf-stars" />
      <div className="rf-glow" />

      {/* distant skyline */}
      <div className="rf-hills">
        <svg viewBox="0 0 1200 96" preserveAspectRatio="none" fill="#0a1826">
          <path d="M0 96 V60 h40 v-14 h26 v14 h34 V40 h30 v20 h40 V52 h54 v44 h60 V46 h28 v-18 h18 v18 h26 v50 h70 V58 h44 v38 h64 V42 h30 v22 h48 V54 h40 v42 h70 V48 h26 v-16 h16 v16 h30 v48 h80 V60 h50 v36 h60 V50 h34 v46 h70 V58 h44 v38 H1200 V96 Z" />
        </svg>
      </div>

      {/* perspective road with flowing centre line */}
      <div className="rf-stage">
        <div className="rf-ground">
          <div className="rf-lane" />
        </div>
      </div>

      {/* streaming light poles */}
      <div className="rf-pole l" style={{ animationDelay: "0s" }} />
      <div className="rf-pole r" style={{ animationDelay: "0.4s" }} />
      <div className="rf-pole l" style={{ animationDelay: "1.3s" }} />
      <div className="rf-pole r" style={{ animationDelay: "1.8s" }} />

      {/* speed streaks */}
      <div className="rf-streak" style={{ bottom: "32%", animationDelay: "0s" }} />
      <div className="rf-streak" style={{ bottom: "26%", animationDelay: "0.5s" }} />
      <div className="rf-streak" style={{ bottom: "22%", animationDelay: "0.9s" }} />

      {/* hero freight truck */}
      <div className="rf-truck">
        <svg viewBox="0 0 248 132" xmlns="http://www.w3.org/2000/svg">
          {/* ground shadow */}
          <ellipse cx="120" cy="118" rx="116" ry="9" fill="rgba(0,0,0,0.45)" />

          {/* cargo box */}
          <rect x="12" y="32" width="150" height="62" rx="9" fill="#16273a" stroke="rgba(247,183,51,0.25)" strokeWidth="1.5" />
          <rect x="20" y="40" width="134" height="20" rx="4" fill="#1e3044" />
          <rect x="12" y="70" width="150" height="8" fill="#f7b733" opacity="0.9" />
          <text x="58" y="56" fontFamily="Comfortaa, sans-serif" fontWeight="700" fontSize="20" fill="#f2f6fa" letterSpacing="2">
            AOI
          </text>

          {/* cab */}
          <path d="M164 50 h44 a8 8 0 0 1 7 4 l9 18 a10 10 0 0 1 1 5 v17 a4 4 0 0 1 -4 4 H164 Z" fill="#1b2e44" stroke="rgba(247,183,51,0.25)" strokeWidth="1.5" />
          <path d="M212 56 h-30 v18 h40 l-7 -14 a5 5 0 0 0 -3 -4 Z" fill="#0b1622" stroke="rgba(120,150,180,0.3)" strokeWidth="1" />

          {/* headlamp */}
          <circle className="rf-headlamp" cx="228" cy="84" r="4.5" fill="#ffe39a" />
          <circle cx="228" cy="84" r="9" fill="rgba(247,183,51,0.25)" />

          {/* wheels (spinning) */}
          {[48, 110, 196].map((cx) => (
            <g key={cx} className="rf-wheel">
              <circle cx={cx} cy="100" r="15" fill="#0a121c" stroke="#2a3a4d" strokeWidth="3" />
              <circle cx={cx} cy="100" r="6.5" fill="#16273a" stroke="#f7b733" strokeWidth="1.5" />
              <rect x={cx - 1} y="90" width="2" height="20" fill="#2a3a4d" />
              <rect x={cx - 10} y="99" width="20" height="2" fill="#2a3a4d" />
            </g>
          ))}
        </svg>
      </div>

      <div className="rf-scrim" />
      <div className="rf-vignette" />
    </div>
  );
}
