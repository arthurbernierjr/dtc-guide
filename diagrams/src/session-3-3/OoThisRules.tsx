import React from "react";
import { Card, Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const RULES = [
  { n: 1, name: "Method call", code: ["hero.introduce()"], result: "hero", ok: true, note: "the object before the dot" },
  { n: 2, name: "Plain call", code: ["const loose = hero.introduce;", "loose()"], result: "undefined", ok: false, note: "the method lost its object" },
  { n: 3, name: "Explicit bind", code: ["const bound = hero.introduce.bind(hero);", "bound()"], result: "hero", ok: true, note: "tied back on with a rope" },
  { n: 4, name: "new", code: ['new Knight("Aria")'], result: "the fresh object", ok: true, note: "built by the constructor" },
];

/** §R10 #6 — the four rules of this, and the one bug: a method pulled off its object loses its character. */
export const OoThisRules: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const panel = (r: (typeof RULES)[number]) => {
    const color = r.ok ? T.green : T.red;
    return (
      <Card key={r.n} style={{ padding: wide ? "22px 26px" : "16px 22px", border: `2px solid ${r.ok ? T.border2 : T.red}`, display: "flex", flexDirection: "column", gap: wide ? 12 : 8, boxSizing: "border-box", height: "100%" }}>
        <Label size={wide ? 30 : 28} color={color} style={{ letterSpacing: ".2em", textTransform: "uppercase" }}>
          Rule {r.n} · {r.name}
        </Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {r.code.map((c) => (
            <Label key={c} size={wide ? 36 : 32} color={T.heading}>{c}</Label>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: "auto", flexWrap: "wrap" }}>
          <span style={{ fontFamily: F.mono, fontSize: wide ? 40 : 34, color: T.soft }}>this →</span>
          <span style={{ fontFamily: F.mono, fontSize: wide ? 40 : 34, color, fontWeight: 400 }}>{r.result}</span>
          <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: wide ? 40 : 34, color }}>{r.ok ? "✓" : "?"}</span>
          <span style={{ fontFamily: F.body, fontSize: wide ? 32 : 28, color: T.muted }}>{r.note}</span>
        </div>
      </Card>
    );
  };

  return (
    <Frame layout={layout} caption="Fig 4 · this loses its character" title="Session 3.3 · Where it breaks">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 22 : 16, height: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: wide ? "1fr 1fr" : "1fr", gridAutoRows: "1fr", gap: wide ? 22 : 16, flex: 1, minHeight: 0 }}>{RULES.map(panel)}</div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 31 : 28, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          <span style={{ color: T.yellow }}>Arrow functions</span> have no <span style={{ fontFamily: F.mono, color: T.heading }}>this</span> of their own; they borrow it from where they were written.
        </div>
      </div>
    </Frame>
  );
};
