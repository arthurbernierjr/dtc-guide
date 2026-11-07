import React from "react";
import { Card, Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Vessel = {
  kw: string;
  color: string;
  decl: string;
  again: string;
  verdict: string;
  ok: boolean;
  scope: string;
  note: string;
};

const VESSELS: Vessel[] = [
  { kw: "let", color: T.green, decl: 'let hp = 100', again: "hp = 75", verdict: "✓ refilled", ok: true, scope: "block-scoped", note: "a jar with a lid: open it, change what is inside" },
  { kw: "const", color: T.yellow, decl: "const maxHp = 100", again: "maxHp = 200", verdict: "✗ TypeError", ok: false, scope: "block-scoped", note: "a sealed flask: the binding never changes" },
  { kw: "var", color: T.red, decl: "var gold = 50", again: "gold", verdict: "visible outside the block", ok: false, scope: "function-scoped · hoisted", note: "a cracked cauldron: it leaks out of the braces" },
];

/** §R10 #7 — let, const and var as three vessels; two stay inside the block, var leaks out. */
export const ManaContainers: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";

  const vessel = (v: Vessel) => (
    <Card key={v.kw} style={{ flex: 1, padding: wide ? "24px 26px" : "18px 22px", border: `2px solid ${v.color}`, display: "flex", flexDirection: "column", gap: wide ? 14 : 10, boxSizing: "border-box", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontFamily: F.mono, fontSize: wide ? 54 : 46, color: v.color, lineHeight: 1 }}>{v.kw}</span>
        <Label size={wide ? 26 : 24} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase", textAlign: "right" }}>{v.scope}</Label>
      </div>
      <Label size={wide ? 34 : 30} color={T.heading}>{v.decl}</Label>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <Label size={wide ? 34 : 30} color={T.soft}>{v.again}</Label>
        <Label size={wide ? 30 : 27} color={v.ok ? T.green : v.kw === "var" ? T.red : T.red}>{v.verdict}</Label>
      </div>
      <div style={{ fontFamily: F.body, fontSize: wide ? 29 : 27, lineHeight: 1.3, color: T.muted, marginTop: "auto" }}>{v.note}</div>
    </Card>
  );

  const block = (
    <div
      style={{
        position: "relative",
        flex: 2,
        display: "flex",
        flexDirection: wide ? "row" : "column",
        gap: wide ? 24 : 18,
        padding: wide ? "54px 26px 26px" : "50px 20px 20px",
        border: `2px dashed ${T.faint}`,
        borderRadius: 18,
        boxSizing: "border-box",
      }}
    >
      <Label size={wide ? 30 : 28} color={T.soft} style={{ position: "absolute", top: 14, left: 26, letterSpacing: ".18em", textTransform: "uppercase" }}>
        <span style={{ color: T.heading }}>{"{"}</span> a block · if, for, or bare braces <span style={{ color: T.heading }}>{"}"}</span>
      </Label>
      {VESSELS.slice(0, 2).map(vessel)}
    </div>
  );

  const leak = (
    <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", gap: wide ? 12 : 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: T.red }}>
        <svg width={wide ? 70 : 60} height={32} viewBox="0 0 70 32">
          <path d="M66 16 H8 M20 4 L6 16 L20 28" stroke={T.red} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Label size={wide ? 28 : 26} color={T.red} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>leaks out</Label>
      </div>
      {vessel(VESSELS[2])}
    </div>
  );

  const rule = (
    <div style={{ fontFamily: F.body, fontSize: wide ? 32 : 29, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
      Default to <span style={{ fontFamily: F.mono, color: T.yellow }}>const</span>. Reach for <span style={{ fontFamily: F.mono, color: T.green }}>let</span> when the value must change.
      Never write <span style={{ fontFamily: F.mono, color: T.red }}>var</span>; just recognise it in older code.
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 1 · Three ways to hold mana" title="Session 3.1 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 26 : 20, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 28 : 22, flex: 1, minHeight: 0 }}>
          {block}
          {leak}
        </div>
        {rule}
      </div>
    </Frame>
  );
};
