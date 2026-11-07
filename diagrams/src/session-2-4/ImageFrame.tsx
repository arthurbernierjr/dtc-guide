import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

// The same square source in two 16:9 frames, using actual image object-fit.
const source = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#111114"/><rect x="12" y="12" width="376" height="376" rx="16" fill="none" stroke="#E8D800" stroke-width="8"/><circle cx="200" cy="200" r="105" fill="#00A868"/><path d="M145 220 L200 150 L255 220 Z" fill="#07110C"/><text x="200" y="62" fill="#F5F2EE" font-size="28" text-anchor="middle" font-family="sans-serif">TOP EDGE</text><text x="200" y="358" fill="#F5F2EE" font-size="28" text-anchor="middle" font-family="sans-serif">BOTTOM EDGE</text></svg>`)}`;
export const ImageFrame: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const picture = (fit: "cover" | "contain", color: string) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      <Label size={26} color={color}>object-fit: {fit}</Label>
      <div style={{ width: wide ? "100%" : 520, maxWidth: "100%", alignSelf: "center", aspectRatio: "16 / 9", background: T.surface, border: `2px solid ${color}`, borderRadius: 12, overflow: "hidden" }}>
        <img src={source} style={{ display: "block", width: "100%", height: "100%", objectFit: fit }} />
      </div>
      <span style={{ fontFamily: F.body, fontSize: wide ? 26 : 24, color: T.soft, lineHeight: 1.4 }}>
        {fit === "cover" ? "Fills the frame. The top and bottom edges are cropped." : "Keeps every edge. Empty space appears at the sides."}
      </span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 5 · The frame and the picture" title="Session 2.4 · The idea">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 16, justifyContent: "center" }}>
        <div style={{ fontFamily: F.mono, fontSize: 26, color: T.muted }}>SAME SQUARE IMAGE · SAME 16:9 FRAME</div>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 28 : 24 }}>
          {picture("cover", T.green)}
          {picture("contain", T.yellow)}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 30 : 26, color: T.soft, lineHeight: 1.4 }}>
          The frame has a ratio. The file has another. <span style={{ color: T.heading }}>Choose whether to fill the frame or keep the whole picture.</span>
        </div>
      </div>
    </Frame>
  );
};
