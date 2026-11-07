import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #54 — four layers, and the width that surprises people: content-box adds padding and border on top of 300; border-box keeps the 300 and shrinks the content. */
export const BoxModel: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 18 : 16;
  return (
    <Frame layout={layout} caption="Fig 3 · Every element is a box" title="Session 2.2 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 10, flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1.1, minWidth: 0, display: "flex", flexDirection: "column", padding: wide ? 8 : 6, background: "rgb(232 216 0 / .35)", borderRadius: 16 }}>
            <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.ink, fontWeight: 700, letterSpacing: ".08em", marginBottom: 4 }}>MARGIN · outside, transparent</span>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: wide ? 8 : 6, background: T.red, borderRadius: 12 }}>
              <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.ink, fontWeight: 700, letterSpacing: ".08em", marginBottom: 4 }}>BORDER · the line you can see</span>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: wide ? 8 : 6, background: T.green, borderRadius: 10 }}>
                <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.ink, fontWeight: 700, letterSpacing: ".08em", marginBottom: 4 }}>PADDING · inside, painted</span>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: T.card, borderRadius: 8, padding: 8 }}>
                  <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.heading, fontWeight: 700 }}>CONTENT</span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${T.red}`, borderRadius: 14 }}>
              <Label size={fs - 4} color={T.red} style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>content-box · the default</Label>
              <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.soft, whiteSpace: "pre", lineHeight: 1.4 }}>{"width: 300px;\npadding: 20px;\nborder: 3px solid;"}</span>
              <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.heading }}>300 + 40 + 6 = 346px on the page</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14 }}>
              <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>border-box · what you wanted</Label>
              <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.soft, whiteSpace: "pre", lineHeight: 1.4 }}>{"box-sizing: border-box;\nwidth: 300px;"}</span>
              <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.heading }}>300px on the page. The content shrinks to fit.</span>
            </div>
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Padding is inside and gets the background. Margin is outside and does not. <span style={{ color: T.heading }}>Put border-box on everything, on the first line of the file.</span>
        </div>
      </div>
    </Frame>
  );
};
