import React from "react";
import { Card, Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const TYPES = [
  { name: "string", ex: '"Kirito"', typeofv: '"string"', bug: false, what: "text in quotes or backticks" },
  { name: "number", ex: "42 · 3.14 · -7", typeofv: '"number"', bug: false, what: "integers and decimals, one type" },
  { name: "boolean", ex: "true · false", typeofv: '"boolean"', bug: false, what: "the two answers a question can have" },
  { name: "undefined", ex: "let questLog;", typeofv: '"undefined"', bug: false, what: "declared, never given a value" },
  { name: "null", ex: "null", typeofv: '"object"', bug: true, what: "intentionally empty" },
  { name: "symbol", ex: 'Symbol("id")', typeofv: '"symbol"', bug: false, what: "a guaranteed-unique key" },
  { name: "bigint", ex: "9007199254740993n", typeofv: '"bigint"', bug: false, what: "integers past the safe limit" },
];

/** §R10 #8 — the seven primitives, each with its typeof answer; null's answer is the 1995 bug. */
export const SevenPrimitives: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";

  const card = (t: (typeof TYPES)[number]) => (
    <Card key={t.name} style={{ padding: wide ? "18px 22px" : "16px 20px", border: `2px solid ${t.bug ? T.red : T.border2}`, display: "flex", flexDirection: "column", gap: wide ? 8 : 6, boxSizing: "border-box", minWidth: 0, position: "relative" }}>
      <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: wide ? 40 : 36, color: T.heading, lineHeight: 1 }}>{t.name}</div>
      <Label size={wide ? 30 : 28} color={T.soft} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.ex}</Label>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: "auto", flexWrap: "wrap" }}>
        <Label size={wide ? 26 : 24} color={T.muted}>typeof →</Label>
        <Label size={wide ? 31 : 28} color={t.bug ? T.red : T.green}>{t.typeofv}</Label>
      </div>
      {t.bug ? (
        <div style={{ alignSelf: "flex-start", fontFamily: F.mono, fontSize: wide ? 21 : 20, letterSpacing: ".14em", textTransform: "uppercase", color: T.ink, background: T.red, borderRadius: 8, padding: "5px 10px", lineHeight: 1 }}>
          a 1995 bug
        </div>
      ) : (
        <div style={{ fontFamily: F.body, fontSize: wide ? 26 : 25, lineHeight: 1.25, color: T.muted }}>{t.what}</div>
      )}
    </Card>
  );

  return (
    <Frame layout={layout} caption="Fig 2 · The seven primitives" title="Session 3.1 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 22 : 18, height: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: wide ? "repeat(4, 1fr)" : "1fr 1fr", gridAutoRows: "1fr", gap: wide ? 22 : 16, flex: 1, minHeight: 0 }}>
          {TYPES.map(card)}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10, padding: wide ? "0 8px" : "0 4px" }}>
            <div style={{ fontFamily: F.body, fontSize: wide ? 30 : 28, lineHeight: 1.3, color: T.soft }}>
              Seven primitives. <span style={{ color: T.heading }}>Everything else</span> is an object: arrays, functions, dates, your hero.
            </div>
            <Label size={wide ? 27 : 25} color={T.muted}>typeof [] → "object" · typeof (() =&gt; 1) → "function"</Label>
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 31 : 28, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, color: T.red }}>typeof null</span> says <span style={{ fontFamily: F.mono, color: T.red }}>"object"</span>. It is wrong, it is from 1995, and fixing it would break the web. Test for null with <span style={{ fontFamily: F.mono, color: T.green }}>x === null</span>.
        </div>
      </div>
    </Frame>
  );
};
