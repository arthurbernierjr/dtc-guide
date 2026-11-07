import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #55 — the selectors that paint the about page: element, class, id, descendant, group, and :hover. Each one is aimed at a region. */
export const SelectorMap: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 18 : 16;
  const aim = (sel: string, color: string, hits: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: wide ? "8px 10px" : "7px 10px", background: T.code, borderLeft: `3px solid ${color}`, borderRadius: 8 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color, fontWeight: 700 }}>{sel}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, lineHeight: 1.25 }}>{hits}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 4 · Aim the selector" title="Session 2.2 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 14 : 8, flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>the page from session 2.1</Label>
            <div style={{ padding: "8px 12px", background: "#1a1a2e", borderRadius: 10 }}>
              <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading }}>header</span>
              <span style={{ fontFamily: F.body, fontSize: fs - 4, color: "#e94560", marginLeft: 10 }}>About · Skills · Contact</span>
            </div>
            <div style={{ flex: 1, padding: "10px 12px", background: T.heading, borderRadius: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.ink }}>main, centered, max-width</span>
              <div style={{ flex: 1, padding: "8px 10px", background: "#ffffff", border: "1px solid #ddd", borderRadius: 8 }}>
                <span style={{ fontFamily: F.body, fontSize: fs - 3, color: "#1a1a2e" }}>section · a card</span>
                <div style={{ fontFamily: F.body, fontSize: fs - 4, color: "#333", marginTop: 4 }}>p.intro · the line you read, held to 65 characters</div>
              </div>
            </div>
            <div style={{ padding: "8px 12px", background: "#1a1a2e", borderRadius: 10, textAlign: "center" }}>
              <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.heading }}>footer</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6, justifyContent: "space-between" }}>
            <Label size={fs - 4} color={T.yellow} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>the selector that paints it</Label>
            {aim("header", T.green, "every header. The element selector.")}
            {aim("nav a", T.yellow, "anchors inside a nav, not every link on the page. The descendant.")}
            {aim("nav a:hover", "#e94560", "the same links, only while the pointer is on them.")}
            {aim("h1, h2, h3", T.soft, "one declaration list, three targets. The group.")}
            {aim("p.intro", T.greenLight, "a paragraph that also has the class. Not every paragraph.")}
            {aim("#welcome", T.red, "the one element with that id. Anchors and scripts, not styling, if you can help it.")}
            {aim(".card", T.yellow, "reusable. Three product cards share it. This is the one you will write most.")}
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          A class is reusable and weak, which is what you want. <span style={{ color: T.heading }}>An id is unique and strong, which is why it is a bad habit for color.</span>
        </div>
      </div>
    </Frame>
  );
};
