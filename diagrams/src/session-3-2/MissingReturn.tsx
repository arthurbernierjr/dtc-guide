import React from "react";
import { Card, Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const COSTUMES = [
  {
    title: "Costume 1 · the forgotten word",
    bad: ["function oops(a, b) {", "  a + b;", "}", "oops(2, 3)"],
    out: "undefined",
    fix: ["function add(a, b) {", "  return a + b;", "}"],
    fixOut: "5",
  },
  {
    title: "Costume 2 · braces without return",
    bad: ["const double = x => {", "  x * 2;", "};", "double(4)"],
    out: "undefined",
    fix: ["const double = x => x * 2;", "// or braces + return"],
    fixOut: "8",
  },
  {
    title: "Costume 3 · map with a block body",
    bad: ["heroes.map(h => {", "  h.name;", "})"],
    out: "[undefined, undefined, undefined]",
    fix: ["heroes.map(h => h.name)", "// an object needs ( )", "heroes.map(h =>", "  ({ name: h.name }))"],
    fixOut: '["Goku", "Naruto", …]',
  },
];

/** §R10 #16 — the missing return in its three costumes, each with its one-line fix. */
export const MissingReturn: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";

  const code = (lines: string[], color: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: wide ? "10px 14px" : "8px 12px", background: T.code, border: `1.5px solid ${color}`, borderRadius: 10 }}>
      {lines.map((c, i) => (
        <Label key={i} size={wide ? 25 : 23} color={c.startsWith("//") ? T.muted : T.heading} style={{ whiteSpace: "pre" }}>{c}</Label>
      ))}
    </div>
  );

  const half = (lines: string[], color: string, out: string, label?: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 8 : 6, minWidth: 0, flex: 1 }}>
      {label ? <Label size={wide ? 23 : 21} color={T.green} style={{ letterSpacing: ".18em", textTransform: "uppercase" }}>{label}</Label> : null}
      {code(lines, color)}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <Label size={wide ? 24 : 22} color={T.muted}>→</Label>
        <Label size={wide ? 25 : 22} color={color}>{out}</Label>
      </div>
    </div>
  );

  const panel = (c: (typeof COSTUMES)[number]) => (
    <Card key={c.title} style={{ flex: 1, padding: wide ? "18px 22px" : "12px 16px", border: `2px solid ${T.border2}`, display: "flex", flexDirection: "column", gap: wide ? 10 : 8, boxSizing: "border-box", minWidth: 0 }}>
      <Label size={wide ? 25 : 22} color={T.yellow} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>{c.title}</Label>
      <div style={{ display: "flex", flexDirection: wide ? "column" : "row", gap: wide ? 10 : 16, flex: 1 }}>
        {half(c.bad, T.red, c.out)}
        {half(c.fix, T.green, c.fixOut, "fix")}
      </div>
    </Card>
  );

  return (
    <Frame layout={layout} caption="Fig 5 · The missing return" title="Session 3.2 · Where it breaks">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 18 : 12, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 22 : 12, flex: 1, minHeight: 0 }}>{COSTUMES.map(panel)}</div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 29 : 27, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          A function with no <span style={{ fontFamily: F.mono, color: T.heading }}>return</span> hands back <span style={{ fontFamily: F.mono, color: T.red }}>undefined</span>. Braces mean "a block of statements", so an arrow with braces needs the word; an arrow without braces returns its one expression.
        </div>
      </div>
    </Frame>
  );
};
