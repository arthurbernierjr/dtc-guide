import React, { useEffect } from "react";
import { AbsoluteFill } from "remotion";
import { loadFonts } from "../fonts";
import { F, T, Layout, SIZE } from "../tokens";

/**
 * The common still frame (§R10 drawing rules): --code background, the 22px dot-grid at 6%,
 * a 1px hairline frame and a mono caption strip bottom-left so a saved image still says what it is.
 */
export const Frame: React.FC<{
  layout: Layout;
  caption: string;
  title?: string;
  children: React.ReactNode;
}> = ({ layout, caption, title, children }) => {
  useEffect(() => {
    loadFonts();
  }, []);
  const { width, height } = SIZE[layout];
  const pad = layout === "wide" ? 56 : 44;
  return (
    <AbsoluteFill style={{ background: T.code, color: T.text, fontFamily: F.body, width, height }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,.06) 1px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      />
      <AbsoluteFill style={{ inset: 16, border: `1px solid ${T.border2}`, borderRadius: 14, position: "absolute", left: 16, top: 16, right: 16, bottom: 16, width: "auto", height: "auto" }} />
      {title ? (
        <div
          style={{
            position: "absolute",
            left: pad,
            top: pad - 8,
            fontFamily: F.mono,
            fontSize: layout === "wide" ? 26 : 24,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: T.yellow,
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <span style={{ width: 48, height: 1, background: T.yellow, display: "inline-block" }} />
          {title}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: pad, top: pad + (title ? 56 : 0), right: pad, bottom: pad + 44 }}>{children}</div>
      <div
        style={{
          position: "absolute",
          left: pad,
          bottom: 30,
          fontFamily: F.mono,
          fontSize: 22,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: T.muted,
        }}
      >
        {caption}
      </div>
      <div
        style={{
          position: "absolute",
          right: pad,
          bottom: 30,
          fontFamily: F.mono,
          fontSize: 22,
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: T.faint,
        }}
      >
        Big Poppa Code
      </div>
    </AbsoluteFill>
  );
};

/** Mono label used across the diagrams. */
export const Label: React.FC<{ size?: number; color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size = 40, color = T.muted, style, children }) => (
  <div style={{ fontFamily: F.mono, fontSize: size, lineHeight: 1.2, color, letterSpacing: ".02em", ...style }}>{children}</div>
);

/** Rounded card used for objects, panels and instances. */
export const Card: React.FC<{ style?: React.CSSProperties; border?: string; children?: React.ReactNode }> = ({ style, border = T.border2, children }) => (
  <div style={{ background: T.card, border: `1.5px solid ${border}`, borderRadius: 14, ...style }}>{children}</div>
);
