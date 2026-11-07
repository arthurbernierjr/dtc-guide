import React from "react";
import { F, T } from "../tokens";

/**
 * The correction mark (§R2): the word Magic in Fraunces italic, dimmed, one red marker stroke across it,
 * and AI in Clash 700 yellow slapped over the top-right corner like a sticker.
 * `size` is the word's font size in px; everything else is in em so it scales.
 */
export const Mark: React.FC<{ size: number; shadow?: boolean; style?: React.CSSProperties }> = ({ size, shadow = true, style }) => (
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
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    Magic
    <svg
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      style={{ position: "absolute", left: "-3%", width: "106%", top: "50%", height: ".24em", transform: "translateY(-46%) rotate(-4deg)", overflow: "visible" }}
    >
      <path d="M3 12 C 25 9, 55 7, 97 9" stroke={T.red} strokeWidth={4.6} strokeLinecap="round" fill="none" />
    </svg>
    <span
      style={{
        position: "absolute",
        top: "-.5em",
        right: "-.12em",
        fontFamily: F.display,
        fontWeight: 700,
        fontStyle: "normal",
        fontVariationSettings: "normal",
        fontSize: ".56em",
        color: T.yellow,
        transform: "rotate(-8deg)",
        WebkitTextStroke: `.04em ${T.bg}`,
        paintOrder: "stroke fill",
        textShadow: shadow ? ".05em .05em 0 #000" : "none",
        lineHeight: 1,
        letterSpacing: "-.01em",
      }}
    >
      AI
    </span>
  </span>
);

/** The four-line cover lockup (§R2.1). `main` is the SUPER CODER size in px. */
export const CoverLockup: React.FC<{ main: number; align?: "left" | "center" }> = ({ main, align = "left" }) => {
  const small = Math.round(main * 0.11);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: align === "left" ? "flex-start" : "center", lineHeight: 0.92 }}>
      <div style={{ fontFamily: F.mono, fontSize: small, letterSpacing: ".28em", textTransform: "uppercase", color: T.muted, marginBottom: Math.round(main * 0.14) }}>I respawned as a</div>
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
          textTransform: "uppercase",
        }}
      >
        Super Coder
      </div>
      <div style={{ fontFamily: F.mono, fontSize: small, letterSpacing: ".28em", textTransform: "uppercase", color: T.muted, margin: `${Math.round(main * 0.18)}px 0 ${Math.round(main * 0.1)}px` }}>In a world with</div>
      <Mark size={Math.round(main * 1.1)} />
    </div>
  );
};
