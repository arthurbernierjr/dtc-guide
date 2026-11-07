import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #49 — the same page drawn twice: a wall of divs that names nothing, and the semantic skeleton (header, nav, main, section, article, aside, footer) that tells a reader, a screen reader and a search engine what each region is. */
export const SemanticSkeleton: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 18 : 17;
  const region = (tag: string, note: string, color: string, grow = 1) => (
    <div style={{ flex: grow ? "1 1 auto" : "0 0 auto", minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, padding: wide ? "8px 12px" : "7px 10px", background: T.code, border: `1.5px solid ${color}`, borderRadius: 10 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 1, color, fontWeight: 700 }}>{tag}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, lineHeight: 1.25 }}>{note}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 3 · Name the region, or it is just a box" title="Session 2.1 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 10, flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${T.red}`, borderRadius: 14 }}>
            <Label size={fs - 4} color={T.red} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>div soup · looks the same, means nothing</Label>
            {["div.top", "div.links", "div.wrapper", "div.box", "div.box-2", "div.side", "div.bottom"].map((d) => (
              <div key={d} style={{ flex: 1, display: "flex", alignItems: "center", padding: "4px 10px", background: T.code, border: `1px dashed ${T.border2}`, borderRadius: 8 }}>
                <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.muted }}>{`<${d.replace("-2", "")}>`}</span>
              </div>
            ))}
            <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.soft, lineHeight: 1.3, marginTop: "auto" }}>A screen reader cannot announce "navigation" from a class name. A search engine cannot find your article. You, in six months, cannot either.</span>
          </div>
          <div style={{ flex: 1.3, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14 }}>
            <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>the same page, named</Label>
            {region("header", "the banner: the name of the site, once", T.green, 0)}
            {region("nav", "the way around: a list of links, not a row of divs", T.yellow, 0)}
            <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: wide ? "row" : "column", gap: 8 }}>
              <div style={{ flex: 1.4, display: "flex", flexDirection: "column", gap: 8 }}>
                {region("main", "the one reason this page exists; exactly one", T.green, 0)}
                {region("section", "a theme, with a heading: About, Quests", T.soft, 1)}
                {region("article", "a quest that would still make sense alone", T.greenLight, 1)}
              </div>
              {region("aside", "related, not required: announcements, tips", T.yellow, 0)}
            </div>
            {region("footer", "the close: copyright, a couple of links", T.muted, 0)}
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 24 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Reach for the element that names the content. <span style={{ color: T.heading }}>div and span are what you use when no semantic element fits</span>, not the element you start with.
        </div>
      </div>
    </Frame>
  );
};
