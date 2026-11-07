import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #56 — custom properties live on :root and flow into every rule that calls var(). Change the token, and the header, the headings, the accent and the page background move together. */
export const CustomProperties: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 18 : 16;
  const token = (name: string, value: string, swatch: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 18, height: 18, borderRadius: 4, background: swatch, flexShrink: 0, boxShadow: `0 0 0 1px ${T.border2}` }} />
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.yellow }}>{name}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.muted }}>{value}</span>
    </div>
  );
  const use = (where: string, calls: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: wide ? "8px 12px" : "7px 10px", background: T.code, borderRadius: 10, border: `1px solid ${T.border2}` }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading }}>{where}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.greenLight }}>{calls}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 5 · Name the value once" title="Session 2.2 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 10, flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10, padding: wide ? "14px 16px" : "12px 12px", background: T.card, border: `1.5px solid ${T.yellow}`, borderRadius: 14 }}>
            <Label size={fs - 4} color={T.yellow} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>:root · the tokens</Label>
            {token("--color-primary", "#1a1a2e", "#1a1a2e")}
            {token("--color-accent", "#00A868", T.green)}
            {token("--color-bg", "#f5f5f5", "#f5f5f5")}
            {token("--color-surface", "#ffffff", "#ffffff")}
            {token("--font-heading", "Poppins", T.soft)}
            {token("--space-lg", "32px", T.muted)}
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.3, marginTop: "auto" }}>Defined once, on the root, so every element can see them. A custom property is just a named value.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, fontSize: fs + 4, flexShrink: 0 }}>{wide ? "▶" : "▼"}</div>
          <div style={{ flex: 1.15, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>the rules that call var()</Label>
            {use("header", "background: var(--color-primary)")}
            {use("h1, h2, h3", "font-family: var(--font-heading)")}
            {use("a, .price", "color: var(--color-accent)")}
            {use("body", "background: var(--color-bg)")}
            {use("section", "background: var(--color-surface); padding: var(--space-lg)")}
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Change <span style={{ fontFamily: F.mono, color: T.yellow }}>--color-accent</span> in one place and every link, price and button moves. <span style={{ color: T.heading }}>That is the whole point of a variable: the decision happens once.</span>
        </div>
      </div>
    </Frame>
  );
};
