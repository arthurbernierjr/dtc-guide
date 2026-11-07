import React from "react";
import { Card, Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const ROWS = [
  { l: '5 == "5"', lr: "true", r: '5 === "5"', rr: "false" },
  { l: '"" == false', lr: "true", r: '"" === false', rr: "false" },
  { l: '0 == "0"', lr: "true", r: '0 === "0"', rr: "false" },
  { l: "null == undefined", lr: "true", r: "null === undefined", rr: "false" },
  { l: "[] == false", lr: "true", r: "[] === false", rr: "false" },
];

const PLUS = [
  { expr: '"5" + 3', out: '"53"', note: "a string on either side turns + into glue" },
  { expr: '"5" - 3', out: "2", note: "minus only knows numbers, so it converts" },
  { expr: "true + 1", out: "2", note: "true becomes 1, false becomes 0" },
];

/** §R10 #11 — two equals signs lie: == converts before it compares; === never converts. */
export const TwoEqualsSigns: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";

  const column = (op: string, color: string, sub: string, side: "l" | "r") => (
    <Card style={{ flex: 1, padding: wide ? "20px 26px" : "16px 20px", border: `2px solid ${color}`, display: "flex", flexDirection: "column", gap: wide ? 12 : 9, boxSizing: "border-box", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, flexWrap: "wrap" }}>
        <span style={{ fontFamily: F.mono, fontSize: wide ? 60 : 52, color, lineHeight: 1 }}>{op}</span>
        <span style={{ fontFamily: F.body, fontSize: wide ? 28 : 26, color: T.soft }}>{sub}</span>
      </div>
      {ROWS.map((row) => {
        const expr = side === "l" ? row.l : row.r;
        const res = side === "l" ? row.lr : row.rr;
        return (
          <div key={expr} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: wide ? "6px 0" : "4px 0", borderBottom: `1px solid ${T.border}` }}>
            <Label size={wide ? 33 : 29} color={T.heading}>{expr}</Label>
            <Label size={wide ? 33 : 29} color={color}>{res}</Label>
          </div>
        );
      })}
    </Card>
  );

  const plus = (
    <Card style={{ padding: wide ? "18px 26px" : "16px 20px", display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 28 : 10, boxSizing: "border-box", alignItems: wide ? "center" : "stretch" }}>
      <Label size={wide ? 26 : 25} color={T.yellow} style={{ letterSpacing: ".2em", textTransform: "uppercase", whiteSpace: "nowrap" }}>+ and − disagree</Label>
      <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 26 : 8, flex: 1 }}>
        {PLUS.map((p) => (
          <div key={p.expr} style={{ display: "flex", flexDirection: wide ? "column" : "row", gap: wide ? 4 : 14, alignItems: wide ? "flex-start" : "baseline", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <Label size={wide ? 32 : 29} color={T.heading}>{p.expr}</Label>
              <Label size={wide ? 26 : 24} color={T.muted}>→</Label>
              <Label size={wide ? 32 : 29} color={T.yellow}>{p.out}</Label>
            </div>
            <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 24, color: T.muted, lineHeight: 1.25 }}>{p.note}</div>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <Frame layout={layout} caption="Fig 5 · Two equals signs lie" title="Session 3.1 · Where it breaks">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 20 : 16, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 28 : 16, flex: 1, minHeight: 0 }}>
          {column("==", T.red, "loose · converts first, then compares", "l")}
          {column("===", T.green, "strict · no conversion, ever", "r")}
        </div>
        {plus}
        <div style={{ fontFamily: F.body, fontSize: wide ? 30 : 28, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Always <span style={{ fontFamily: F.mono, color: T.green }}>===</span>. When you need a conversion, do it on purpose: <span style={{ fontFamily: F.mono, color: T.heading }}>Number("5")</span>, <span style={{ fontFamily: F.mono, color: T.heading }}>String(5)</span>, <span style={{ fontFamily: F.mono, color: T.heading }}>Boolean(x)</span>.
        </div>
      </div>
    </Frame>
  );
};
