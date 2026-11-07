import React from "react";
import { Card, Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const FORMS = [
  {
    name: "Declaration",
    color: T.green,
    code: ["function calculateDamage(attack, defense) {", "  return Math.max(0, attack - defense);", "}"],
    traits: [
      { t: "hoisted · callable above its line", ok: true },
      { t: "has its own this", ok: true },
    ],
  },
  {
    name: "Expression",
    color: T.yellow,
    code: ["const calculateDamage = function (attack, defense) {", "  return Math.max(0, attack - defense);", "};"],
    traits: [
      { t: "not hoisted · define before use", ok: false },
      { t: "has its own this", ok: true },
    ],
  },
  {
    name: "Arrow",
    color: T.green,
    code: ["const calculateDamage = (attack, defense) =>", "  Math.max(0, attack - defense);"],
    traits: [
      { t: "not hoisted · define before use", ok: false },
      { t: "no this of its own · implicit return", ok: true },
    ],
  },
];

/** §R10 #12 — the same spell written three ways, and what each spelling buys you. */
export const FunctionsThreeWays: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";

  const row = (f: (typeof FORMS)[number]) => (
    <Card key={f.name} style={{ flex: 1, padding: wide ? "16px 22px" : "14px 18px", border: `2px solid ${f.color}`, display: wide ? "grid" : "flex", gridTemplateColumns: "230px 1fr 400px", flexDirection: "column", gap: wide ? 24 : 8, alignItems: "center", boxSizing: "border-box", minWidth: 0 }}>
      <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: wide ? 40 : 34, color: T.heading, lineHeight: 1 }}>{f.name}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: wide ? "10px 14px" : "8px 12px", background: T.code, borderRadius: 10, border: `1px solid ${T.border2}`, minWidth: 0, alignSelf: "stretch" }}>
        {f.code.map((c) => (
          <Label key={c} size={wide ? 23 : 21} color={T.heading} style={{ whiteSpace: "pre" }}>{c}</Label>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {f.traits.map((tr) => (
          <div key={tr.t} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: wide ? 28 : 25, color: tr.ok ? T.green : T.red, lineHeight: 1 }}>{tr.ok ? "✓" : "✗"}</span>
            <span style={{ fontFamily: F.body, fontSize: wide ? 27 : 24, color: T.soft, lineHeight: 1.25 }}>{tr.t}</span>
          </div>
        ))}
      </div>
    </Card>
  );

  const callVsRef = (
    <Card style={{ padding: wide ? "14px 22px" : "12px 18px", display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 36 : 6, alignItems: wide ? "center" : "stretch", boxSizing: "border-box" }}>
      <Label size={wide ? 25 : 23} color={T.yellow} style={{ letterSpacing: ".2em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Call vs reference</Label>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <Label size={wide ? 29 : 25} color={T.heading}>calculateDamage(25, 10)</Label>
        <Label size={wide ? 25 : 22} color={T.muted}>→</Label>
        <Label size={wide ? 29 : 25} color={T.green}>15</Label>
        <span style={{ fontFamily: F.body, fontSize: wide ? 24 : 22, color: T.muted }}>parentheses cast the spell</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
        <Label size={wide ? 29 : 25} color={T.heading}>calculateDamage</Label>
        <Label size={wide ? 25 : 22} color={T.muted}>→</Label>
        <Label size={wide ? 29 : 25} color={T.yellow}>[Function]</Label>
        <span style={{ fontFamily: F.body, fontSize: wide ? 24 : 22, color: T.muted }}>no parentheses hands over the scroll</span>
      </div>
    </Card>
  );

  return (
    <Frame layout={layout} caption="Fig 1 · One spell, three spellings" title="Session 3.2 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 16 : 12, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: wide ? 16 : 12, flex: 1, minHeight: 0 }}>{FORMS.map(row)}</div>
        {callVsRef}
      </div>
    </Frame>
  );
};
