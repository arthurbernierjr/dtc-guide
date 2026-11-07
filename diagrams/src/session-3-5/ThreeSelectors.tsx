import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const NODES = [
  { tag: "h3", note: "#main-title" },
  { tag: "p", note: "#subtitle" },
  { tag: "p", note: ".message" },
  { tag: "p", note: ".message" },
  { tag: "button", note: "#change-btn" },
  { tag: "ul", note: "#quest-list" },
];

type Sel = { code: string; color: string; hits: number[]; returns: string; nothing: string; foot: string };

const SELECTORS: Sel[] = [
  { code: 'document.getElementById("subtitle")', color: T.yellow, hits: [1], returns: "→ one element", nothing: "null if no such id", foot: "by id · no # in the string" },
  { code: 'document.querySelector(".message")', color: T.green, hits: [2], returns: "→ the FIRST match", nothing: "null if nothing matches", foot: "any CSS selector · one element" },
  { code: 'document.querySelectorAll(".message")', color: T.red, hits: [2, 3], returns: "→ a NodeList of ALL matches", nothing: "an empty NodeList, never null", foot: "forEach works · map/filter need Array.from()" },
];

/** §R10 #18 — the three selectors: one by id, the first match, every match. Only the third returns a list. */
export const ThreeSelectors: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 24 : 22;

  const chips = (s: Sel) => (
    <div style={{ display: "flex", gap: wide ? 10 : 8, flexWrap: "wrap" }}>
      {NODES.map((n, i) => {
        const hit = s.hits.includes(i);
        return (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "baseline",
              gap: 8,
              fontFamily: F.mono,
              fontSize: fs,
              lineHeight: 1,
              color: hit ? T.ink : T.faint,
              background: hit ? s.color : T.code,
              border: `1.5px solid ${hit ? s.color : T.border}`,
              borderRadius: 8,
              padding: wide ? "8px 12px" : "7px 10px",
              whiteSpace: "nowrap",
              fontWeight: hit ? 600 : 400,
            }}
          >
            {n.tag}
            <span style={{ fontSize: fs - 3, opacity: hit ? 0.85 : 0.7, fontWeight: 400 }}>{n.note}</span>
          </span>
        );
      })}
    </div>
  );

  const row = (s: Sel) => (
    <div key={s.code} style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 10, padding: wide ? "16px 20px" : "12px 14px", background: T.card, border: `1.5px solid ${s.color}`, borderRadius: 14 }}>
      <div style={{ display: "flex", flexDirection: wide ? "row" : "column", justifyContent: "space-between", alignItems: wide ? "baseline" : "flex-start", gap: wide ? 20 : 4 }}>
        <Label size={wide ? 26 : 23} color={T.heading} style={{ whiteSpace: "nowrap" }}>{s.code}</Label>
        <Label size={wide ? 26 : 23} color={s.color} style={{ whiteSpace: "nowrap" }}>{s.returns}</Label>
      </div>
      {chips(s)}
      <div style={{ display: "flex", flexDirection: wide ? "row" : "column", justifyContent: "space-between", gap: wide ? 20 : 2 }}>
        <span style={{ fontFamily: F.body, fontSize: wide ? 22 : 20, color: T.muted, whiteSpace: "nowrap" }}>{s.foot}</span>
        <span style={{ fontFamily: F.body, fontSize: wide ? 22 : 20, color: T.muted, whiteSpace: "nowrap" }}>{s.nothing}</span>
      </div>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 2 · Three selectors" title="Session 3.5 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 12, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 10, flex: 1, justifyContent: "center" }}>{SELECTORS.map(row)}</div>
        <div style={{ display: "grid", gridTemplateColumns: wide ? "1fr 1fr" : "1fr", gap: wide ? 24 : 8, flexShrink: 0 }}>
          <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 23, lineHeight: 1.3, color: T.soft }}>
            Two of them hand back <span style={{ color: T.heading }}>one element or null</span>. Check for null before you touch <span style={{ fontFamily: F.mono }}>.textContent</span>, or the error says "Cannot read properties of null".
          </div>
          <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 23, lineHeight: 1.3, color: T.soft }}>
            A <span style={{ fontFamily: F.mono, color: T.red }}>NodeList</span> looks like an array and is not one: <span style={{ fontFamily: F.mono }}>forEach</span> yes, <span style={{ fontFamily: F.mono }}>map</span> no. <span style={{ fontFamily: F.mono, color: T.heading }}>Array.from(list)</span> makes it a real array.
          </div>
        </div>
      </div>
    </Frame>
  );
};
