import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const HEROES = [
  { name: "Goku", power: 9001, keep: true },
  { name: "Naruto", power: 7500, keep: false },
  { name: "Sailor Moon", power: 8200, keep: true },
  { name: "Deku", power: 6800, keep: false },
  { name: "Jotaro", power: 8500, keep: true },
];

/** §R10 #15 — the combo chain: filter keeps fewer, map keeps the count but changes the shape, reduce folds to one. The original is never touched. */
export const ComboChain: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";

  const card = (text: string, color: string, dim = false, small = false) => (
    <div
      key={text}
      style={{
        fontFamily: F.mono,
        fontSize: wide ? (small ? 24 : 26) : small ? 22 : 24,
        color: dim ? T.faint : T.heading,
        background: T.card,
        border: `1.5px solid ${dim ? T.border : color}`,
        borderRadius: 10,
        padding: wide ? "8px 12px" : "7px 10px",
        lineHeight: 1.15,
        whiteSpace: "nowrap",
        textDecoration: dim ? "line-through" : "none",
        opacity: dim ? 0.6 : 1,
      }}
    >
      {text}
    </div>
  );

  const stage = (title: string, code: string, color: string, items: React.ReactNode, foot: string) => (
    <div style={{ flex: wide ? 1 : "0 0 auto", display: "flex", flexDirection: "column", gap: wide ? 12 : 6, minWidth: 0 }}>
      <Label size={wide ? 26 : 24} color={color} style={{ letterSpacing: ".18em", textTransform: "uppercase" }}>{title}</Label>
      <Label size={wide ? 24 : 22} color={T.soft} style={{ lineHeight: 1.2 }}>{code}</Label>
      <div style={{ display: "flex", flexDirection: wide ? "column" : "row", flexWrap: wide ? "nowrap" : "wrap", gap: 8, padding: wide ? "14px" : "10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 14, flex: wide ? 1 : "0 0 auto", justifyContent: wide ? "center" : "flex-start" }}>{items}</div>
      <span style={{ fontFamily: F.body, fontSize: wide ? 25 : 23, color: T.muted, lineHeight: 1.25 }}>{foot}</span>
    </div>
  );

  const arrow = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "stretch", padding: wide ? "0 4px" : "0", flex: "0 0 auto" }}>
      <svg width={wide ? 44 : 28} height={wide ? 44 : 28} viewBox="0 0 44 44">
        {wide ? <path d="M6 22 H34 M24 12 L36 22 L24 32" stroke={T.green} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M22 6 V34 M12 24 L22 36 L32 24" stroke={T.green} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </div>
  );

  const n = (i: number, s: string) => (wide ? s : `${i} · ${s}`);
  const original = stage(n(1, "heroes"), "5 objects", T.muted, HEROES.map((h) => card(`{ ${h.name}, ${h.power} }`, T.border2)), "the original array, untouched the whole way");
  const filtered = stage(n(2, "filter"), "h => h.power > 8000", T.yellow, HEROES.map((h) => card(`{ ${h.name}, ${h.power} }`, T.yellow, !h.keep)), "keeps the ones that pass · 5 → 3");
  const mapped = stage(n(3, "map"), "h => h.power", T.green, HEROES.filter((h) => h.keep).map((h) => card(`${h.power}`, T.green)), "same count, new shape · 3 → 3");
  const reduced = stage(
    n(4, "reduce"),
    "(sum, p) => sum + p, 0",
    T.red,
    [card("0 + 9001 + 8200 + 8500", T.red, false, true), card("= 25701", T.red)],
    "folds everything into one value · 3 → 1",
  );

  return (
    <Frame layout={layout} caption="Fig 4 · The combo chain" title="Session 3.2 · Array methods">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 18 : 14, height: "100%" }}>
        {wide ? (
          <div style={{ display: "flex", flexDirection: "row", gap: 10, flex: 1, minHeight: 0 }}>
            {original}
            {arrow}
            {filtered}
            {arrow}
            {mapped}
            {arrow}
            {reduced}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, flex: 1, minHeight: 0, alignContent: "start" }}>
            {original}
            {filtered}
            {mapped}
            {reduced}
          </div>
        )}
        <div style={{ fontFamily: F.body, fontSize: wide ? 29 : 27, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Every stage returns a <span style={{ color: T.heading }}>new</span> value and hands it to the next. <span style={{ fontFamily: F.mono, color: T.yellow }}>filter</span> fewer or equal, <span style={{ fontFamily: F.mono, color: T.green }}>map</span> the same number, <span style={{ fontFamily: F.mono, color: T.red }}>reduce</span> exactly one.
          <span style={{ fontFamily: F.mono, color: T.heading }}> forEach</span> is not in the chain: it returns undefined.
        </div>
      </div>
    </Frame>
  );
};
