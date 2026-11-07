import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #59 — repeat(auto-fit, minmax(280px, 1fr)) reflows by itself: one column, then two, then three, with no media query. */
export const AutoFit: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 17 : 16;
  const card = (name: string) => (
    <div key={name} style={{ padding: "8px 10px", background: T.code, borderLeft: `3px solid ${T.green}`, borderRadius: 8 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.heading }}>{name}</span>
    </div>
  );
  const frame = (width: string, cols: number, label: string) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      <Label size={fs - 5} color={T.yellow} style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</Label>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6, padding: 8, background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12, flex: 1 }}>
        {["Dragon", "Flowers", "Escort", "Mine", "Runes", "Tournament"].map(card)}
      </div>
      <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.muted }}>{width}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 3 · Columns that wrap themselves" title="Session 2.3 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ padding: "8px 12px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.greenLight, whiteSpace: "pre" }}>{"grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 12 : 8, flex: 1, minHeight: 0 }}>
          {frame("narrow · one column fits", 1, "under 560px")}
          {frame("wider · two columns fit", 2, "around 768px")}
          {frame("wide · three columns fit", 3, "around 1024px")}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Each column is at least 280px and shares whatever is left. <span style={{ color: T.heading }}>When another 280 will not fit, the next card moves down.</span> No breakpoint required.
        </div>
      </div>
    </Frame>
  );
};
