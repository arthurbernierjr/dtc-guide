import React, { useEffect } from "react";
import { AbsoluteFill } from "remotion";
import { loadFonts } from "../fonts";
import { CoverLockup } from "../components/Mark";
import { F, T } from "../tokens";

export type CoverFormat = "og" | "thumb";
export const COVER_SIZE: Record<CoverFormat, { width: number; height: number }> = {
  og: { width: 1200, height: 630 },
  thumb: { width: 1280, height: 720 },
};

/** §R12: the OG image (lockup left, signature, mono line, chip) and the YouTube-safe thumbnail (lockup centred). */
export const CoverCorrection: React.FC<{ format: CoverFormat }> = ({ format }) => {
  useEffect(() => {
    loadFonts();
  }, []);
  const { width, height } = COVER_SIZE[format];
  const og = format === "og";
  return (
    <AbsoluteFill style={{ background: T.bg, width, height, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          right: -120,
          top: -120,
          width: 560,
          height: 560,
          backgroundImage: "radial-gradient(rgba(255,255,255,.09) 1px, transparent 1.5px)",
          backgroundSize: "22px 22px",
          WebkitMaskImage: "radial-gradient(closest-side,#000 40%,transparent 100%)",
          maskImage: "radial-gradient(closest-side,#000 40%,transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: og ? -80 : 80,
          top: og ? 40 : 160,
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(0,120,56,.35), transparent 70%)",
        }}
      />
      {og ? (
        <>
          <div style={{ position: "absolute", left: 72, top: 64 }}>
            <CoverLockup main={132} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 34, fontFamily: F.body, fontStyle: "italic", fontWeight: 300, fontSize: 24, color: T.red }}>
              <span style={{ width: 48, height: 1, background: T.red, display: "inline-block" }} />
              the respawn guide, by Big Poppa Code
            </div>
          </div>
          <div style={{ position: "absolute", left: 72, bottom: 52, fontFamily: F.mono, fontSize: 20, letterSpacing: ".25em", textTransform: "uppercase", color: T.muted }}>
            The path · 54 sessions · The library
          </div>
          <div
            style={{
              position: "absolute",
              right: 72,
              bottom: 48,
              fontFamily: F.mono,
              fontSize: 16,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: T.ink,
              background: T.green,
              padding: "12px 20px",
              borderRadius: 999,
              boxShadow: "4px 4px 0 0 #000",
            }}
          >
            Big Poppa Code
          </div>
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 96, display: "flex", justifyContent: "center" }}>
            <CoverLockup main={150} align="center" />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, display: "flex", justifyContent: "center", gap: 18, alignItems: "center", fontFamily: F.body, fontStyle: "italic", fontWeight: 300, fontSize: 26, color: T.red }}>
            <span style={{ width: 48, height: 1, background: T.red, display: "inline-block" }} />
            the respawn guide, by Big Poppa Code
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
