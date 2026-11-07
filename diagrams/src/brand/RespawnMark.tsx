import React, { useEffect } from "react";
import { AbsoluteFill } from "remotion";
import { loadFonts } from "../fonts";
import { Mark } from "../components/Mark";

/** §R12: the mark alone on a transparent 600×240 canvas, for places that need pixels. */
export const RespawnMark: React.FC = () => {
  useEffect(() => {
    loadFonts();
  }, []);
  return (
    <AbsoluteFill style={{ width: 600, height: 240, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Mark size={150} style={{ marginTop: 30 }} />
    </AbsoluteFill>
  );
};
