import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #13 — scope as nested rings: inner can see out, outer cannot see in; var ignores the innermost ring. */
export const ScopeRings: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";

  const ring = (title: string, vars: string[], color: string, children?: React.ReactNode, extra?: React.CSSProperties) => (
    <div
      style={{
        position: "relative",
        border: `2px solid ${color}`,
        borderRadius: 22,
        padding: wide ? "58px 26px 26px" : "52px 20px 20px",
        background: `rgb(${color === T.green ? T.rgb.green : color === T.yellow ? T.rgb.yellow : T.rgb.red} / .035)`,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxSizing: "border-box",
        flex: 1,
        ...extra,
      }}
    >
      <Label size={wide ? 27 : 25} color={color} style={{ position: "absolute", top: 16, left: 24, letterSpacing: ".18em", textTransform: "uppercase" }}>{title}</Label>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {vars.map((v) => (
          <span key={v} style={{ fontFamily: F.mono, fontSize: wide ? 29 : 26, color: T.heading, background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 10, padding: "8px 12px", lineHeight: 1, whiteSpace: "nowrap" }}>{v}</span>
        ))}
      </div>
      {children}
    </div>
  );

  const rings = ring(
    "Global scope",
    ['let worldName = "Aincrad"'],
    T.yellow,
    ring(
      "Function scope · enterDungeon()",
      ["let dungeonLevel = 5"],
      T.green,
      ring("Block scope · if (dungeonLevel > 3) { }", ['let boss = "Dragon"', 'const loot = "Legendary Sword"'], T.green, undefined, { flex: "0 0 auto" }),
    ),
  );

  const lookups = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8, flex: wide ? "0 0 580px" : "0 0 auto" }}>
      {[
        { code: "boss", from: "inside the block", res: '"Dragon"', ok: true, why: "found in its own ring" },
        { code: "dungeonLevel", from: "inside the block", res: "5", ok: true, why: "looked outward one ring" },
        { code: "worldName", from: "inside the block", res: '"Aincrad"', ok: true, why: "looked outward two rings" },
        { code: "boss", from: "after the block", res: "ReferenceError", ok: false, why: "outer rings cannot look in" },
        { code: "dungeonLevel", from: "outside the function", res: "ReferenceError", ok: false, why: "function scope is a wall too" },
      ].map((l) => (
        <div key={l.code + l.from} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2px 14px", padding: wide ? "8px 14px" : "7px 12px", background: T.card, border: `1.5px solid ${l.ok ? T.border2 : T.red}`, borderRadius: 12 }}>
          <Label size={wide ? 27 : 25} color={T.heading}>{l.code}</Label>
          <Label size={wide ? 27 : 25} color={l.ok ? T.green : T.red} style={{ textAlign: "right" }}>{l.res}</Label>
          <span style={{ fontFamily: F.body, fontSize: wide ? 22 : 21, color: T.muted, gridColumn: "1 / -1", whiteSpace: "nowrap" }}>read {l.from} · {l.why}</span>
        </div>
      ))}
    </div>
  );

  const varNote = (
    <div style={{ fontFamily: F.body, fontSize: wide ? 29 : 27, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
      Lookups walk <span style={{ color: T.heading }}>outward</span>, never inward. <span style={{ fontFamily: F.mono, color: T.red }}>var</span> ignores the innermost ring entirely, which is how <span style={{ fontFamily: F.mono, color: T.red }}>var leaked</span> escapes an <span style={{ fontFamily: F.mono }}>if</span> block into the whole function.
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 2 · The scope chain" title="Session 3.2 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 20 : 16, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 28 : 18, flex: 1, minHeight: 0 }}>
          {rings}
          {lookups}
        </div>
        {varNote}
      </div>
    </Frame>
  );
};
