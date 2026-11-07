import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #60 — mobile-first: the base rule is the small screen, and each min-width query adds a layout for that width and up. Nothing is undone by a max-width. */
export const MobileFirst: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 17 : 16;
  const block = (name: string, color: string, fill: boolean) => (
    <div style={{ height: fill ? "100%" : undefined, flex: fill ? undefined : 1, display: "flex", alignItems: "center", padding: "8px 10px", background: T.code, border: `1px solid ${color}`, borderRadius: 6, fontFamily: F.mono, fontSize: fs - 4, color }}>{name}</div>
  );
  const phone = (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, height: "100%" }}>
      {block("header", T.green, false)}
      {block("nav", T.yellow, false)}
      {block("main", T.soft, false)}
      {block("aside", T.yellow, false)}
      {block("footer", T.green, false)}
    </div>
  );
  const tablet = (
    <div style={{ display: "grid", height: "100%", gridTemplateColumns: "70px 1fr", gridTemplateRows: "auto 1fr 1fr auto", gridTemplateAreas: '"h h" "n m" "n a" "f f"', gap: 4 }}>
      <div style={{ gridArea: "h", height: "100%" }}>{block("header", T.green, true)}</div>
      <div style={{ gridArea: "n", height: "100%" }}>{block("nav", T.yellow, true)}</div>
      <div style={{ gridArea: "m", height: "100%" }}>{block("main", T.soft, true)}</div>
      <div style={{ gridArea: "a", height: "100%" }}>{block("aside", T.yellow, true)}</div>
      <div style={{ gridArea: "f", height: "100%" }}>{block("footer", T.green, true)}</div>
    </div>
  );
  const desktop = (
    <div style={{ display: "grid", height: "100%", gridTemplateColumns: "64px 1fr 64px", gridTemplateRows: "auto 1fr auto", gridTemplateAreas: '"h h h" "n m a" "f f f"', gap: 4 }}>
      <div style={{ gridArea: "h", height: "100%" }}>{block("header", T.green, true)}</div>
      <div style={{ gridArea: "n", height: "100%" }}>{block("nav", T.yellow, true)}</div>
      <div style={{ gridArea: "m", height: "100%" }}>{block("main", T.soft, true)}</div>
      <div style={{ gridArea: "a", height: "100%" }}>{block("aside", T.yellow, true)}</div>
      <div style={{ gridArea: "f", height: "100%" }}>{block("footer", T.green, true)}</div>
    </div>
  );
  const step = (kicker: string, query: string, color: string, picture: React.ReactNode) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, padding: wide ? "12px 12px" : "10px 12px", background: T.card, border: `1.5px solid ${color}`, borderRadius: 14 }}>
      <Label size={fs - 5} color={color} style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>{kicker}</Label>
      <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.heading }}>{query}</span>
      <div style={{ flex: 1, minHeight: 0 }}>{picture}</div>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 4 · Start small, then add" title="Session 2.3 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 12 : 8, flex: 1, minHeight: 0, alignItems: "stretch" }}>
          {step("base · every screen", "no query", T.green, phone)}
          {wide ? <span style={{ color: T.muted, alignSelf: "center" }}>▶</span> : null}
          {step("tablets and up", "@media (min-width: 768px)", T.yellow, tablet)}
          {wide ? <span style={{ color: T.muted, alignSelf: "center" }}>▶</span> : null}
          {step("laptops and up", "@media (min-width: 1024px)", T.soft, desktop)}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          The base rule is the phone. <span style={{ color: T.heading }}>A min-width query adds a layout for that width and everything wider.</span> It does not cancel the small screen.
        </div>
      </div>
    </Frame>
  );
};
