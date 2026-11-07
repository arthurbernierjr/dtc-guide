import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const ROWS = [
  { cond: "if (playerHP > 50)", out: '"You are healthy!"', taken: true },
  { cond: "else if (playerHP > 20)", out: '"You are wounded. Find a potion!"', taken: false },
  { cond: "else if (playerHP > 0)", out: '"CRITICAL HP! Run away!"', taken: false },
  { cond: "else", out: '"Game Over."', taken: false },
];

const FALSY = ["false", "0", '""', "null", "undefined", "NaN"];

/** §R10 #10 — an if / else-if chain as a road: the first true test is the only exit taken; the falsy six decide what counts as true. */
export const BranchingRoad: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const W = wide ? 1488 : 812;
  const condW = wide ? 620 : 470;
  const outW = wide ? 400 : 280;
  const outX = wide ? 740 : W - outW;
  const boxH = wide ? 104 : 96;
  const step = wide ? 150 : 140;
  const y0 = wide ? 84 : 84;
  const rowY = (i: number) => y0 + i * step;
  const roadH = rowY(3) + boxH;

  const dim = (taken: boolean) => (taken ? 1 : 0.5);

  const svgRoad = (
    <svg width={W} height={roadH + 10} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {/* entry */}
      <line x1={condW / 2} y1={56} x2={condW / 2} y2={rowY(0)} stroke={T.green} strokeWidth={4} strokeLinecap="round" />
      <path d={`M${condW / 2 - 12} ${rowY(0) - 16} L${condW / 2} ${rowY(0)} L${condW / 2 + 12} ${rowY(0) - 16}`} stroke={T.green} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {ROWS.map((r, i) => {
        const y = rowY(i) + boxH / 2;
        const yes = (
          <g key={`y${i}`} opacity={dim(r.taken)}>
            <line x1={condW} y1={y} x2={outX} y2={y} stroke={r.taken ? T.green : T.muted} strokeWidth={r.taken ? 5 : 3} strokeLinecap="round" strokeDasharray={r.taken ? undefined : "10 12"} />
            <path d={`M${outX - 16} ${y - 12} L${outX} ${y} L${outX - 16} ${y + 12}`} stroke={r.taken ? T.green : T.muted} strokeWidth={r.taken ? 5 : 3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
        const no =
          i < ROWS.length - 1 ? (
            <g key={`n${i}`} opacity={0.5}>
              <line x1={condW / 2} y1={rowY(i) + boxH} x2={condW / 2} y2={rowY(i + 1)} stroke={T.red} strokeWidth={3} strokeLinecap="round" strokeDasharray="10 12" />
              <path d={`M${condW / 2 - 12} ${rowY(i + 1) - 16} L${condW / 2} ${rowY(i + 1)} L${condW / 2 + 12} ${rowY(i + 1) - 16}`} stroke={T.red} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ) : null;
        return [yes, no];
      })}
    </svg>
  );

  const box = (x: number, y: number, w: number, text: string, color: string, taken: boolean, kind: "cond" | "out") => (
    <div
      key={`${kind}${y}`}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: boxH,
        boxSizing: "border-box",
        background: T.card,
        border: `2px solid ${taken ? color : T.border2}`,
        borderRadius: kind === "cond" ? 14 : 999,
        display: "flex",
        alignItems: "center",
        justifyContent: kind === "cond" ? "flex-start" : "center",
        padding: kind === "cond" ? "0 26px" : "0 22px",
        opacity: dim(taken),
        boxShadow: taken ? `0 0 0 1px rgb(${T.rgb.green} / .18), 6px 6px 0 0 #000` : "none",
      }}
    >
      <Label
        size={wide ? (kind === "cond" ? 36 : 28) : kind === "cond" ? 28 : 24}
        color={taken ? T.heading : T.soft}
        style={kind === "cond" ? { whiteSpace: "nowrap", fontFamily: F.mono, letterSpacing: ".02em" } : { fontFamily: F.body, letterSpacing: 0, textAlign: "center", lineHeight: 1.15 }}
      >
        {text}
      </Label>
    </div>
  );

  const tag = (x: number, y: number, text: string, color: string, opacity = 1) => (
    <Label key={`${text}${x}${y}`} size={wide ? 24 : 19} color={color} style={{ position: "absolute", left: x, top: y, letterSpacing: wide ? ".18em" : ".1em", textTransform: "uppercase", opacity, background: T.code, padding: wide ? "2px 8px" : "2px 4px", whiteSpace: "nowrap" }}>
      {text}
    </Label>
  );

  const falsy = (
    <div
      style={{
        position: "absolute",
        ...(wide ? { left: 1180, top: 0, width: 308, bottom: 0 } : { left: 0, right: 0, top: roadH + 44 }),
        boxSizing: "border-box",
        padding: wide ? "22px 24px" : "18px 22px",
        border: `1.5px solid ${T.border2}`,
        borderRadius: 14,
        background: T.surface,
        display: "flex",
        flexDirection: "column",
        gap: wide ? 14 : 12,
      }}
    >
      <Label size={wide ? 28 : 26} color={T.red} style={{ letterSpacing: ".2em", textTransform: "uppercase" }}>Falsy · the six</Label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {FALSY.map((f) => (
          <span key={f} style={{ fontFamily: F.mono, fontSize: wide ? 30 : 28, color: T.red, border: `1.5px solid ${T.red}`, borderRadius: 10, padding: "6px 12px", lineHeight: 1 }}>{f}</span>
        ))}
      </div>
      <div style={{ fontFamily: F.body, fontSize: wide ? 27 : 26, lineHeight: 1.3, color: T.soft }}>
        Everything else is truthy, <span style={{ color: T.heading }}>including</span> <span style={{ fontFamily: F.mono, color: T.green }}>"0"</span>, <span style={{ fontFamily: F.mono, color: T.green }}>[]</span> and <span style={{ fontFamily: F.mono, color: T.green }}>{"{}"}</span>.
      </div>
      <div style={{ fontFamily: F.body, fontSize: wide ? 27 : 26, lineHeight: 1.3, color: T.muted, marginTop: wide ? "auto" : 0 }}>
        <span style={{ fontFamily: F.mono, color: T.heading }}>if (username)</span> with <span style={{ fontFamily: F.mono }}>""</span> takes the else road.
      </div>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 4 · The branching road" title="Session 3.1 · Control flow">
      <div style={{ position: "relative", width: W, height: "100%" }}>
        {/* entry chip */}
        <div style={{ position: "absolute", left: 0, top: 0, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: F.mono, fontSize: wide ? 34 : 30, color: T.ink, background: T.green, borderRadius: 10, padding: "10px 16px", lineHeight: 1 }}>playerHP = 75</span>
          <span style={{ fontFamily: F.body, fontSize: wide ? 28 : 26, color: T.muted }}>enters at the top, tests in order</span>
        </div>
        {svgRoad}
        {ROWS.map((r, i) => box(0, rowY(i), condW, r.cond, T.green, r.taken, "cond"))}
        {ROWS.map((r, i) => box(outX, rowY(i), outW, r.out, T.green, r.taken, "out"))}
        {ROWS.map((r, i) => tag(condW + (wide ? 36 : 6), rowY(i) + boxH / 2 - (wide ? 30 : 26), i === 3 ? (wide ? "always" : "") : "yes", r.taken ? T.green : T.muted, dim(r.taken)))}
        {ROWS.slice(0, 3).map((_, i) => tag(condW / 2 + 16, rowY(i) + boxH + (wide ? 10 : 8), "no", T.red, 0.7))}
        {tag(0, roadH + (wide ? 14 : 8), "only the first true test is taken · order matters", T.green)}
        {falsy}
      </div>
    </Frame>
  );
};
