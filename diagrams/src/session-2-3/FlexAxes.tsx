import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #57 — flex is one axis. justify-content moves along the main axis, align-items along the cross axis, and flex-direction swaps which is which. */
export const FlexAxes: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 18 : 16;
  const chip = (t: string, color: string) => (
    <span style={{ padding: "8px 12px", background: color, color: T.ink, fontFamily: F.mono, fontSize: fs - 3, fontWeight: 700, borderRadius: 8 }}>{t}</span>
  );
  const panel = (dir: "row" | "column", title: string, main: string, cross: string, color: string) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${color}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={color} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>{title}</Label>
      <div style={{ flex: 1, display: "flex", flexDirection: dir, justifyContent: "space-between", alignItems: "center", gap: 8, padding: 12, background: T.code, borderRadius: 10, minHeight: wide ? 120 : 100 }}>
        {chip("Home", T.green)}
        {chip("Quests", T.yellow)}
        {chip("Party", T.soft)}
      </div>
      <span style={{ fontFamily: F.mono, fontSize: fs - 4, color, lineHeight: 1.35 }}>{main}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.muted, lineHeight: 1.35 }}>{cross}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 1 · One axis, then the other" title="Session 2.3 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 14 : 8, flex: 1, minHeight: 0 }}>
          {panel("row", "flex-direction: row · the default", "justify-content moves left and right. This row is space-between.", "align-items moves up and down. These chips are centered on the cross axis.", T.green)}
          {panel("column", "flex-direction: column", "justify-content now moves up and down. The same property, the other axis.", "align-items now moves left and right. The cross axis flipped with the main one.", T.yellow)}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Say the axis first. <span style={{ color: T.heading }}>justify-content is the main axis, align-items is the cross axis</span>, and direction decides which way those words point.
        </div>
      </div>
    </Frame>
  );
};
