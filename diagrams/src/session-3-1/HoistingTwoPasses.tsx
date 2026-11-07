import React from "react";
import { Card, Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const REGISTERED = [
  { decl: "var ghost", state: "undefined", color: T.yellow, note: "registered and filled with undefined" },
  { decl: "let hero", state: "TDZ · locked", color: T.red, note: "registered, unusable until its line" },
  { decl: "function cast()", state: "ready", color: T.green, note: "whole body available at once" },
];

const LINES = [
  { n: 1, code: "console.log(ghost);", out: "undefined", color: T.yellow, tag: "silent" },
  { n: 2, code: 'var ghost = "boo";', out: "", color: T.muted, tag: "" },
  { n: 3, code: "console.log(hero);", out: "ReferenceError", color: T.red, tag: "loud" },
  { n: 4, code: 'let hero = "Aria";', out: "", color: T.muted, tag: "" },
  { n: 5, code: "cast();", out: '"fireball"', color: T.green, tag: "works" },
  { n: 6, code: "function cast() {…}", out: "", color: T.muted, tag: "" },
];

/** §R10 #9 — hoisting as two passes: registration first, execution second; nothing moves. */
export const HoistingTwoPasses: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";

  const passHead = (n: number, title: string, sub: string) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: wide ? 14 : 10 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <span style={{ fontFamily: F.display, fontWeight: 700, fontSize: wide ? 44 : 40, color: T.heading, lineHeight: 1, whiteSpace: "nowrap" }}>Pass {n}</span>
        <Label size={wide ? 28 : 26} color={T.yellow} style={{ letterSpacing: ".18em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{title}</Label>
      </div>
      <span style={{ fontFamily: F.body, fontSize: wide ? 27 : 25, color: T.muted }}>{sub}</span>
    </div>
  );

  const pass1 = (
    <Card style={{ flex: 1, padding: wide ? "22px 26px" : "18px 22px", display: "flex", flexDirection: "column", gap: wide ? 14 : 10, boxSizing: "border-box", minWidth: 0 }}>
      {passHead(1, "Registration", "before any line runs")}
      {REGISTERED.map((r) => (
        <div key={r.decl} style={{ display: "flex", flexDirection: "column", gap: 4, padding: wide ? "12px 16px" : "10px 14px", border: `1.5px solid ${T.border2}`, borderRadius: 12, background: T.code }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <Label size={wide ? 34 : 30} color={T.heading}>{r.decl}</Label>
            <Label size={wide ? 30 : 28} color={r.color}>{r.state}</Label>
          </div>
          <div style={{ fontFamily: F.body, fontSize: wide ? 26 : 25, color: T.muted, lineHeight: 1.25 }}>{r.note}</div>
        </div>
      ))}
    </Card>
  );

  const pass2 = (
    <Card style={{ flex: 1.5, padding: wide ? "22px 26px" : "18px 22px", display: "flex", flexDirection: "column", gap: wide ? 12 : 9, boxSizing: "border-box", minWidth: 0 }}>
      {passHead(2, "Execution", "top to bottom, as written")}
      {LINES.map((l) => (
        <div key={l.n} style={{ display: "grid", gridTemplateColumns: wide ? "40px auto 1fr" : "36px auto 1fr", alignItems: "baseline", gap: 14 }}>
          <Label size={wide ? 26 : 24} color={T.faint}>{l.n}</Label>
          <Label size={wide ? 31 : 28} color={l.out ? T.heading : T.soft} style={{ whiteSpace: "nowrap" }}>{l.code}</Label>
          {l.out ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, whiteSpace: "nowrap" }}>
              <Label size={wide ? 26 : 24} color={T.muted}>→</Label>
              <Label size={wide ? 29 : 27} color={l.color}>{l.out}</Label>
              <Label size={wide ? 21 : 20} color={l.color} style={{ letterSpacing: ".14em", textTransform: "uppercase", opacity: 0.85 }}>{l.tag}</Label>
            </div>
          ) : (
            <span />
          )}
        </div>
      ))}
    </Card>
  );

  return (
    <Frame layout={layout} caption="Fig 3 · Two passes, nothing moves" title="Session 3.1 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 22 : 18, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 28 : 20, flex: 1, minHeight: 0 }}>
          {pass1}
          {pass2}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 31 : 28, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Nothing is moved to the top. Declarations are <span style={{ color: T.heading }}>registered first</span>; then the lines run in order.
          <span style={{ fontFamily: F.mono, color: T.yellow }}> var</span> reads as undefined early, <span style={{ fontFamily: F.mono, color: T.red }}>let</span> and <span style={{ fontFamily: F.mono, color: T.red }}>const</span> throw until their line.
        </div>
      </div>
    </Frame>
  );
};
