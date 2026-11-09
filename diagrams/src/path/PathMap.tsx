import React from "react";
import { Frame, Label } from "../components/Frame";
import { ActColor, actColor, F, Layout, SIZE, T } from "../tokens";
import path from "../../../website/content/path/path.json";

export const pathMapSize = (layout: Layout) => ({ ...SIZE[layout], height: layout === "tall" ? 1800 : 900 });
const actOfUnit = (unit: number): ActColor => (path.acts.find(a => a.units.includes(unit))?.color || "green") as ActColor;

/** This is a curriculum overview, not a learner's saved progress. */
export const PathMap: React.FC<{ layout: Layout; written: string[] }> = ({ layout, written }) => {
  const wide = layout === "wide";
  const { width, height } = pathMapSize(layout);
  const pad = wide ? 56 : 44;
  const w = width - pad * 2;
  const h = height - pad * 2 - 100;
  const cols = wide ? 6 : 3;
  const rows = Math.ceil(path.weeks / cols);
  const legendH = wide ? 64 : 150;
  const topGap = wide ? 16 : 28;
  const rowH = (h - legendH - topGap) / rows;
  const colW = w / cols;
  const r = wide ? 31 : 36;
  const tick = wide ? 6 : 8;
  const weeks = Array.from({ length: path.weeks }, (_, i) => {
    const n = i + 1;
    const sessions = path.sessions.filter(s => s.week === n);
    const row = Math.floor(i / cols);
    const col = row % 2 ? cols - 1 - i % cols : i % cols;
    return {
      n, sessions, units: [...new Set(sessions.map(s => s.unit))],
      act: actOfUnit(sessions[0].unit),
      x: colW * (col + .5), y: topGap + rowH * row + r + 10,
    };
  });
  return (
    <Frame layout={layout} height={height} title="The path · weeks" caption={`${path.weeks} weeks · ${path.sessions.length} sessions`}>
      <div style={{ position: "relative", width: w, height: h }}>
        <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
          {weeks.slice(1).map((wk, i) => (
            <line key={wk.n} x1={weeks[i].x} y1={weeks[i].y} x2={wk.x} y2={wk.y} stroke={actColor(wk.act)} strokeWidth={4} opacity={.7} />
          ))}
          {weeks.map(wk => (
            <g key={wk.n}>
              <circle cx={wk.x} cy={wk.y} r={r + 9} fill={`rgb(${T.rgb[wk.act]} / .12)`} />
              <circle cx={wk.x} cy={wk.y} r={r} fill={T.card} stroke={actColor(wk.act)} strokeWidth={4} />
              <text x={wk.x} y={wk.y + 12} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={wide ? 35 : 38} fill={T.heading}>{wk.n}</text>
              {/* Week 11 runs right-to-left in the wide map: keep its act transition in path order. */}
              {(wide && wk.n === 11 ? [...wk.sessions].reverse() : wk.sessions).map((s, j) => (
                <circle key={s.id} cx={wk.x + (j - (wk.sessions.length - 1) / 2) * tick * 3.4} cy={wk.y + r + 17} r={tick} fill={written.includes(s.id) ? actColor(actOfUnit(s.unit)) : T.code} stroke={written.includes(s.id) ? actColor(actOfUnit(s.unit)) : T.muted} strokeWidth={2} />
              ))}
              <text x={wk.x} y={wk.y + r + (wide ? 49 : 57)} textAnchor="middle" fontFamily={F.mono} fontSize={wide ? 22 : 28} fill={T.soft}>{`UNIT ${wk.units.join(" · ")}`}</text>
            </g>
          ))}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: legendH, display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 30 : 16, justifyContent: wide ? "space-between" : "flex-end", alignItems: wide ? "center" : "flex-start" }}>
          {path.acts.map(a => (
            <Label key={a.id} size={wide ? 23 : 28} color={T.soft} style={{ display: "flex", alignItems: "center", gap: 12, letterSpacing: ".02em", whiteSpace: "nowrap" }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: actColor(a.color as ActColor), flexShrink: 0 }} />
              Act {a.id} · {a.name}
            </Label>
          ))}
        </div>
      </div>
    </Frame>
  );
};
