import React, { useEffect } from "react";
import { AbsoluteFill } from "remotion";
import { loadFonts } from "../fonts";
import { F, T } from "../tokens";

export type FaviconSize = 16 | 32 | 180 | 240;

/**
 * §R2.3: a dark rounded square, the M of Magic in Fraunces italic, one red stroke across it,
 * and AI in Clash 700 yellow in the bottom-right corner (dropped at 16px).
 * Drawn at 32 and scaled, so every size is the same picture.
 */
export const Favicon: React.FC<{ size: FaviconSize }> = ({ size }) => {
  useEffect(() => {
    loadFonts();
  }, []);
  const s = size / 32;
  const showAI = size >= 32;
  return (
    <AbsoluteFill style={{ width: size, height: size, background: "transparent" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${s})`, transformOrigin: "top left", width: 32, height: 32 }}>
        <div style={{ position: "absolute", inset: 0, background: T.bg, borderRadius: 7 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1,
            textAlign: "center",
            fontFamily: F.story,
            fontStyle: "italic",
            fontWeight: 600,
            fontVariationSettings: '"opsz" 144, "SOFT" 60, "WONK" 1',
            fontSize: 26,
            lineHeight: "30px",
            color: T.soft,
          }}
        >
          M
        </div>
        <svg viewBox="0 0 32 32" width={32} height={32} style={{ position: "absolute", inset: 0 }}>
          <path d="M5 20.5 C 12 18.5, 20 15.5, 27 12.5" stroke={T.red} strokeWidth={size >= 32 ? 3 : 2.4} strokeLinecap="round" fill="none" />
        </svg>
        {showAI ? (
          <div
            style={{
              position: "absolute",
              right: 2,
              bottom: 1,
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 10.5,
              lineHeight: 1,
              color: T.yellow,
              transform: "rotate(-8deg)",
              WebkitTextStroke: "1px #000",
              paintOrder: "stroke fill",
              letterSpacing: "-.02em",
            }}
          >
            AI
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
