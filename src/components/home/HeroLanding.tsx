"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Search, Check, ExternalLink } from "lucide-react";
import { DeptIcon } from "@/components/brand/DeptIcon";
import { TRUCK, SHIP, PLANE, wave } from "./heroArt";
import "./hero.css";

export interface HeroGate {
  id: string;
  name: string;
  blurb: string;
  color: string;
  icon: string;
  toolCount: number;
  liveCount: number;
}

export interface HeroFlag {
  id: string;
  name: string;
  version: string;
  desc: string;
  tags: string[];
}

export interface HeroLabels {
  eyebrow: string; title1: string; title2: string;
  find: string; openw: string; done: string; sub: string;
  browse: string; search: string;
  statDepts: string; statTools: string; statLive: string;
  pickDept: string; pickDeptSub: string; openDept: string;
  flagship: string; flagshipSub: string; openTool: string;
  tools: string; live: string;
}

export function HeroLanding({
  stats,
  gates,
  flagship,
  labels,
}: {
  stats: { departments: number; tools: number; live: number };
  gates: HeroGate[];
  flagship: HeroFlag | null;
  labels: HeroLabels;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  // reveal-on-scroll + count-up, mirroring the original hub behaviour
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    root.querySelectorAll(".rv").forEach((el) => io.observe(el));

    const nums = root.querySelectorAll<HTMLElement>(".stat .num");
    nums.forEach((el) => {
      const target = Number(el.dataset.n || "0");
      const start = performance.now();
      const dur = 900;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    return () => io.disconnect();
  }, []);

  return (
    <div className="aoi-home" ref={rootRef}>
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="sun" />
        <div className="hero-inner">
          <p className="eyebrow">{labels.eyebrow}</p>
          <h1>
            <span>{labels.title1}</span> <span className="g">{labels.title2}</span>
          </h1>
          <div className="checks">
            <span className="chk">
              <Check /> {labels.find}
            </span>
            <span className="chk">
              <Check /> {labels.openw}
            </span>
            <span className="chk">
              <Check /> {labels.done}
            </span>
          </div>
          <p className="sub">{labels.sub}</p>
          <div className="cta-row">
            <Link className="hbtn hbtn-gold" href="/tools">
              {labels.browse} <ArrowRight />
            </Link>
            <Link className="hbtn hbtn-ghost" href="/tools">
              <Search /> {labels.search}
            </Link>
          </div>
        </div>

        <div className="sea" dangerouslySetInnerHTML={{ __html: wave("w1") + wave("w2") + wave("w3") }} />
        <span className="cloud c1" />
        <span className="cloud c2" />
        <div className="shore">
          <svg viewBox="0 0 600 260" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="landg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#26405A" />
                <stop offset=".5" stopColor="#172a3d" />
                <stop offset="1" stopColor="#0c1a27" />
              </linearGradient>
            </defs>
            <path d="M0,120 L280,120 C400,120 450,170 560,238 L600,260 L0,260 Z" fill="url(#landg)" />
          </svg>
          <span className="road-dash" />
        </div>
        <div className="journey" dangerouslySetInnerHTML={{ __html: TRUCK + SHIP + PLANE }} />
        <div className="scroll-cue">SCROLL ▾</div>
      </section>

      {/* ── Stats bar ── */}
      <div className="statsbar">
        <div className="stat">
          <div className="num" data-n={stats.departments}>0</div>
          <div className="lbl">{labels.statDepts}</div>
        </div>
        <div className="stat">
          <div className="num" data-n={stats.tools}>0</div>
          <div className="lbl">{labels.statTools}</div>
        </div>
        <div className="stat">
          <div className="num" data-n={stats.live}>0</div>
          <div className="lbl">{labels.statLive}</div>
        </div>
      </div>

      {/* ── Department gates ── */}
      <section className="secn">
        <div className="sec-head rv">
          <h2 className="sec-title">{labels.pickDept}</h2>
          <span className="sec-u" />
          <p className="sec-sub">{labels.pickDeptSub}</p>
        </div>
        <div className="gates">
          {gates.map((g, i) => (
            <Link
              key={g.id}
              href={`/departments/${g.id}`}
              className={`gate rv d${(i % 4) + 1}`}
              style={{ "--c": g.color } as React.CSSProperties}
            >
              <span className="gate-ic">
                <DeptIcon name={g.icon} />
              </span>
              <h3>{g.name}</h3>
              <p className="g-meta">
                {g.toolCount} {labels.tools.toUpperCase()} · {g.liveCount} {labels.live.toUpperCase()}
              </p>
              <p className="g-blurb">{g.blurb}</p>
              <span className="g-go">
                {labels.openDept} <ArrowRight />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Flagship ── */}
      {flagship && (
        <section className="secn">
          <div className="sec-head rv">
            <h2 className="sec-title">{labels.flagship}</h2>
            <span className="sec-u" />
            <p className="sec-sub">{labels.flagshipSub}</p>
          </div>
          <div className="flag rv">
            <div className="flag-l">
              <p className="eyebrow" style={{ marginBottom: 2 }}>
                FLAGSHIP ▸ {flagship.id}
              </p>
              <h3>
                {flagship.name} <span className="verchip">{flagship.version}</span>
              </h3>
              <p>{flagship.desc}</p>
              <div className="tags">
                {flagship.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flag-r">
              <Link className="hbtn hbtn-gold" href={`/tools/${flagship.id}`}>
                {labels.openTool} <ExternalLink />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
