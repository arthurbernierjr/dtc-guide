import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #58 — named grid areas: the layout is readable as a string, and each element is placed by the name rather than by counting lines. */
export const GridAreas: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 18 : 16;
  const cell = (area: string, label: string, color: string) => (
    <div style={{ gridArea: area, background: T.code, border: `1.5px solid ${color}`, borderRadius: 10, padding: wide ? "10px 12px" : "8px 10px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 2 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color, fontWeight: 700 }}>{label}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 5, color: T.muted }}>grid-area: {label}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 2 · The layout you can read" title="Session 2.3 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 10, flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1.3, minWidth: 0, display: "grid", gridTemplateColumns: wide ? "110px 1fr 110px" : "72px 1fr 72px", gridTemplateRows: "auto 1fr auto", gridTemplateAreas: '"header header header" "nav main aside" "footer footer footer"', gap: 8 }}>
            {cell("header", "header", T.green)}
            {cell("nav", "nav", T.yellow)}
            {cell("main", "main", T.soft)}
            {cell("aside", "aside", T.yellow)}
            {cell("footer", "footer", T.green)}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>the same picture, as text</Label>
            <div style={{ padding: "12px 14px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10 }}>
              <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.soft, whiteSpace: "pre", lineHeight: 1.45 }}>{"grid-template-columns:\n  200px 1fr 200px;\ngrid-template-areas:\n  \"header header header\"\n  \"nav    main   aside\"\n  \"footer footer footer\";"}</span>
            </div>
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.35 }}>Each name is a cell. Repeat the name and the element spans those cells. The string is the picture.</span>
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Grid is two axes at once. <span style={{ color: T.heading }}>Name the areas, then point each element at its name.</span> You should be able to see the page without opening the browser.
        </div>
      </div>
    </Frame>
  );
};
