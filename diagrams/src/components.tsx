import React, { useEffect } from "react";
import { AbsoluteFill } from "remotion";
import { F, T, type Layout, SIZE } from "./tokens";
import { loadFonts } from "./fonts";

/** Common still frame (§R10 drawing rules): --code background, 6% dot-grid, hairline frame, mono caption strip. */
export const Frame: React.FC<{ layout: Layout; caption: string; children: React.ReactNode; bg?: string }> = ({ layout, caption, children, bg = T.code }) => {
  useEffect(() => {
    loadFonts();
  }, []);
  const { width, height } = SIZE[layout];
  return (
    <AbsoluteFill style={{ background: bg, color: T.text, fontFamily: F.body, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,.06) 1.2px, transparent 1.8px)",
          backgroundSize: "22px 22px",
          backgroundPosition: "11px 11px",
        }}
      />
      <AbsoluteFill style={{ boxShadow: `inset 0 0 0 1px ${T.border2}` }} />
      <div style={{ position: "absolute", inset: 0, width, height }}>{children}</div>
      <div
        style={{
          position: "absolute",
          left: 40,
          bottom: 28,
          fontFamily: F.mono,
          fontSize: layout === "wide" ? 22 : 20,
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: T.muted,
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};

/** The correction mark: the struck word and the AI written over it (§R2). `size` is the word's font size. */
export const Mark: React.FC<{ size: number; hardShadow?: boolean; style?: React.CSSProperties }> = ({ size, hardShadow = false, style }) => (
  <span
    style={{
      position: "relative",
      display: "inline-block",
      fontFamily: F.story,
      fontStyle: "italic",
      fontWeight: 500,
      fontVariationSettings: '"opsz" 144, "SOFT" 60, "WONK" 1',
      color: T.struck,
      fontSize: size,
      lineHeight: 1,
      ...style,
    }}
  >
    Magic
    <svg
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      style={{ position: "absolute", left: "-3%", width: "106%", top: "50%", height: ".24em", transform: "translateY(-46%) rotate(-4deg)", overflow: "visible" }}
    >
      <path d="M3 12 C 25 9, 55 7, 97 9" stroke={T.red} strokeWidth={3.2} strokeLinecap="round" fill="none" />
    </svg>
    <span
      style={{
        position: "absolute",
        top: "-.46em",
        right: "-.22em",
        fontFamily: F.display,
        fontWeight: 700,
        fontStyle: "normal",
        fontVariationSettings: "normal",
        fontSize: ".56em",
        color: T.yellow,
        transform: "rotate(-8deg)",
        WebkitTextStroke: `.04em ${T.bg}`,
        paintOrder: "stroke fill",
        textShadow: hardShadow ? ".06em .06em 0 #000" : ".05em .05em 0 #000",
        lineHeight: 1,
        letterSpacing: "-.02em",
      }}
    >
      AI
    </span>
  </span>
);

/** The four-line cover lockup (§R2.1). `main` is the SUPER CODER size. */
export const CoverLockup: React.FC<{ main: number; align?: "left" | "center" }> = ({ main, align = "left" }) => {
  const mono: React.CSSProperties = {
    fontFamily: F.mono,
    fontSize: Math.round(main * 0.11),
    letterSpacing: ".28em",
    textTransform: "uppercase",
    color: T.muted,
    lineHeight: 1,
  };
  return (
    <div style={{ display: "grid", justifyItems: align === "center" ? "center" : "start", gap: Math.round(main * 0.14), lineHeight: 0.92 }}>
      <div style={mono}>I respawned as a</div>
      <div
        style={{
          fontFamily: F.display,
          fontWeight: 700,
          fontSize: main,
          letterSpacing: "-.02em",
          color: T.green,
          WebkitTextStroke: `2px ${T.bg}`,
          paintOrder: "stroke fill",
          textShadow: "6px 6px 0 rgba(0,0,0,.55)",
          lineHeight: 0.92,
          whiteSpace: "nowrap",
        }}
      >
        SUPER CODER
      </div>
      <div style={mono}>in a world with</div>
      <div style={{ paddingTop: Math.round(main * 0.1), paddingRight: Math.round(main * 0.3) }}>
        <Mark size={Math.round(main * 1.1)} hardShadow />
      </div>
    </div>
  );
};

export const Mono: React.FC<{ size?: number; color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 34, color = T.muted, style, children }) => (
  <div style={{ fontFamily: F.mono, fontSize: size, color, lineHeight: 1.3, letterSpacing: ".02em", ...style }}>{children}</div>
);

export const Label: React.FC<{ size?: number; color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 34, color = T.muted, style, children }) => (
  <div style={{ fontFamily: F.mono, fontSize: size, color, lineHeight: 1, letterSpacing: ".22em", textTransform: "uppercase", ...style }}>{children}</div>
);

export const Title: React.FC<{ size?: number; color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 56, color = T.heading, style, children }) => (
  <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: size, color, lineHeight: 1.05, letterSpacing: "-.01em", ...style }}>{children}</div>
);

export const Body: React.FC<{ size?: number; color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 40, color = T.soft, style, children }) => (
  <div style={{ fontFamily: F.body, fontSize: size, color, lineHeight: 1.35, ...style }}>{children}</div>
);

/** Card panel in the site's language: --card fill, hairline, radius 14 (scaled for stills). */
export const Panel: React.FC<{ style?: React.CSSProperties; accent?: string; dashed?: boolean; children?: React.ReactNode }> = ({ style, accent, dashed, children }) => (
  <div
    style={{
      position: "absolute",
      background: T.card,
      borderRadius: 24,
      border: dashed ? `2px dashed ${T.faint}` : `1.5px solid ${accent ?? T.border2}`,
      boxShadow: accent ? `0 0 0 1px rgb(${accent === T.green ? T.rgb.green : accent === T.red ? T.rgb.red : T.rgb.yellow} / .18), 8px 8px 0 0 #000` : "6px 6px 0 0 #000",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Small code chip: mono text on --code fill. */
export const Chip: React.FC<{ color?: string; size?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ color = T.text, size = 34, style, children }) => (
  <span
    style={{
      display: "inline-block",
      fontFamily: F.mono,
      fontSize: size,
      lineHeight: 1,
      color,
      background: T.code,
      border: `1.5px solid ${T.border2}`,
      borderRadius: 10,
      padding: ".32em .55em",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

/** Straight or curved arrow between two points in frame coordinates. */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color?: string; width?: number; curve?: number; dashed?: boolean }> = ({ x1, y1, x2, y2, color = T.muted, width = 3, curve = 0, dashed }) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * curve;
  const cy = my + ny * curve;
  const id = `ah-${Math.round(x1)}-${Math.round(y1)}-${Math.round(x2)}-${Math.round(y2)}-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }} width="100%" height="100%">
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M1 1 L9 5 L1 9" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <path
        d={curve ? `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}` : `M${x1} ${y1} L${x2} ${y2}`}
        stroke={color}
        strokeWidth={width}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={dashed ? "10 12" : undefined}
        markerEnd={`url(#${id})`}
      />
    </svg>
  );
};
