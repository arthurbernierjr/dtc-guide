import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #63 — transform paints the element somewhere else and leaves its layout box where it was. Translate, rotate, scale, and the origin they pivot on. */
export const TransformBox: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 18 : 16;
  const fn = (name: string, code: string, color: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 10px", background: T.code, borderLeft: `3px solid ${color}`, borderRadius: 8 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color, fontWeight: 700 }}>{name}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.muted }}>{code}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 2 · The paint moves, the box stays" title="Session 2.4 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 10, flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1.1, minWidth: 0, position: "relative", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: wide ? 36 : 24, top: wide ? 48 : 36, width: wide ? 150 : 120, height: wide ? 88 : 72, border: `1.5px dashed ${T.muted}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: F.mono, fontSize: fs - 5, color: T.muted }}>layout box</span>
            </div>
            <div style={{ position: "absolute", left: wide ? 78 : 56, top: wide ? 28 : 20, width: wide ? 150 : 120, height: wide ? 88 : 72, background: T.green, borderRadius: 10, transform: "rotate(-8deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.ink, fontWeight: 700 }}>painted</span>
            </div>
            <span style={{ position: "absolute", left: 16, bottom: 12, fontFamily: F.body, fontSize: fs - 4, color: T.soft, maxWidth: "90%" }}>The dashed box is where layout still thinks the card is. The green card is translate plus rotate.</span>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            <Label size={fs - 4} color={T.yellow} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>one property, many functions</Label>
            {fn("translate", "translateY(-8px)", T.green)}
            {fn("rotate", "rotate(45deg)", T.yellow)}
            {fn("scale", "scale(1.03)", T.soft)}
            {fn("origin", "transform-origin: top left", T.muted)}
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.35 }}>Several functions go in one transform, and their order changes the result. The origin is the pivot, not a movement.</span>
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          A transform does not push its neighbors. <span style={{ color: T.heading }}>Use it instead of margin or top when the only goal is to look like it moved.</span>
        </div>
      </div>
    </Frame>
  );
};
