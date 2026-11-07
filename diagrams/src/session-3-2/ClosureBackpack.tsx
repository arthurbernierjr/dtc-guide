import React from "react";
import { Card, Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #14 — a closure is a function carrying a backpack: the outer call is over, the variables it enclosed are not. */
export const ClosureBackpack: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";

  const factory = (
    <Card style={{ flex: 1, padding: wide ? "20px 24px" : "16px 20px", border: `2px dashed ${T.faint}`, display: "flex", flexDirection: "column", gap: 10, boxSizing: "border-box", opacity: 0.85, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <Label size={wide ? 27 : 25} color={T.muted} style={{ letterSpacing: ".18em", textTransform: "uppercase" }}>createCounter()</Label>
        <Label size={wide ? 24 : 22} color={T.red} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>finished · gone</Label>
      </div>
      {["function createCounter() {", "  let count = 0;", "  return function () {", "    count++;", "    return count;", "  };", "}"].map((c) => (
        <Label key={c} size={wide ? 28 : 25} color={c.includes("count = 0") ? T.yellow : T.soft} style={{ whiteSpace: "pre" }}>{c}</Label>
      ))}
    </Card>
  );

  const backpack = (label: string, count: string, color: string) => (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <Card style={{ padding: wide ? "16px 22px" : "14px 18px", border: `2px solid ${color}`, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start", minWidth: wide ? 300 : 250 }}>
        <Label size={wide ? 27 : 25} color={T.muted}>{label}</Label>
        <Label size={wide ? 31 : 28} color={T.heading}>function () {"{ … }"}</Label>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, padding: "8px 12px", background: T.code, border: `1.5px solid ${color}`, borderRadius: 10 }}>
          <svg width={wide ? 30 : 26} height={wide ? 30 : 26} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8h12l1 12H5z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
          </svg>
          <Label size={wide ? 28 : 26} color={T.yellow}>count = {count}</Label>
        </div>
      </Card>
    </div>
  );

  const calls = (name: string, results: string[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {results.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <Label size={wide ? 29 : 26} color={T.heading}>{name}()</Label>
          <Label size={wide ? 26 : 24} color={T.muted}>→</Label>
          <Label size={wide ? 29 : 26} color={T.green}>{r}</Label>
        </div>
      ))}
    </div>
  );

  const right = (
    <div style={{ flex: 1.3, display: "flex", flexDirection: "column", gap: wide ? 18 : 14, minWidth: 0 }}>
      <div style={{ display: "flex", gap: wide ? 26 : 16, alignItems: "flex-start", flexWrap: wide ? "nowrap" : "wrap" }}>
        {backpack("const hitCounter =", "3", T.green)}
        {calls("hitCounter", ["1", "2", "3"])}
      </div>
      <div style={{ display: "flex", gap: wide ? 26 : 16, alignItems: "flex-start", flexWrap: wide ? "nowrap" : "wrap" }}>
        {backpack("const comboCounter =", "1", T.yellow)}
        {calls("comboCounter", ["1"])}
      </div>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 3 · The backpack" title="Session 3.2 · Closures">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 20 : 16, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 30 : 18, flex: 1, minHeight: 0 }}>
          {factory}
          {right}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 30 : 27, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          The outer call returned and is gone. The inner function left carrying a <span style={{ color: T.yellow }}>backpack</span> with <span style={{ fontFamily: F.mono, color: T.heading }}>count</span> inside.
          Each call to <span style={{ fontFamily: F.mono, color: T.heading }}>createCounter()</span> packs a <span style={{ color: T.heading }}>new</span> backpack, and nothing outside can open one.
        </div>
      </div>
    </Frame>
  );
};
