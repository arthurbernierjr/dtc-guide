import React from "react";
import { Frame, Label } from "../components/Frame";
import { ActColor, actColor, F, Layout, SIZE, T } from "../tokens";
import path from "../../../website/content/path/path.json";

type Session = (typeof path.sessions)[number];

const actOfUnit = (unit: number): ActColor => {
  const act = path.acts.find((a) => a.units.includes(unit));
  return (act ? act.color : "green") as ActColor;
};

/** Inner drawing box of the Frame for a layout (keep in step with Frame.tsx paddings). */
const inner = (layout: Layout) => {
  const pad = layout === "wide" ? 56 : 44;
  const { width, height } = SIZE[layout];
  return { w: width - pad * 2, h: height - (pad + 56) - (pad + 44) };
};

/** The route: one stop per week, serpentine, three acts, a tick per session, a flag on the latest written session. */
export const PathMap: React.FC<{ layout: Layout; written: string[] }> = ({ layout, written }) => {
  const wide = layout === "wide";
  const { w, h } = inner(layout);
  const cols = wide ? 7 : 3;
  const rows = Math.ceil(path.weeks / cols);
  const legendH = wide ? 60 : 150;
  const topGap = wide ? 36 : 28;
  const gridH = h - legendH - topGap;
  const rowH = gridH / rows;
  const colW = w / cols;
  const r = wide ? 42 : 34;
  const tick = wide ? 9 : 7;
  const labelSize = wide ? 34 : 30;

  const weeks = Array.from({ length: path.weeks }, (_, i) => i + 1).map((n) => {
    const sessions = path.sessions.filter((s) => s.week === n);
    const idx = n - 1;
    const row = Math.floor(idx / cols);
    const colRaw = idx % cols;
    const col = row % 2 === 0 ? colRaw : cols - 1 - colRaw;
    return {
      n,
      sessions,
      units: [...new Set(sessions.map((s) => s.unit))],
      act: actOfUnit(sessions[0].unit),
      x: colW * (col + 0.5),
      y: topGap + rowH * (row + 0.5) - (wide ? 14 : 22),
      written: sessions.some((s) => written.includes(s.id)),
    };
  });

  const latest = [...path.sessions].reverse().find((s: Session) => written.includes(s.id));
  const latestWeek = latest ? weeks.find((wk) => wk.n === latest.week) : null;

  const segments = weeks.slice(1).map((wk, i) => ({ a: weeks[i], b: wk }));

  return (
    <Frame layout={layout} caption={`The path · ${path.weeks} weeks · ${path.sessions.length} sessions`} title="The path">
      <div style={{ position: "relative", width: w, height: h }}>
        <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {segments.map(({ a, b }, i) => (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={actColor(b.act)} strokeWidth={6} strokeLinecap="round" opacity={0.85} />
          ))}
          {weeks.map((wk) => (
            <g key={wk.n}>
              {wk.written ? <circle cx={wk.x} cy={wk.y} r={r + 14} fill={`rgb(${T.rgb[wk.act]} / .14)`} /> : null}
              <circle cx={wk.x} cy={wk.y} r={r} fill={T.card} stroke={actColor(wk.act)} strokeWidth={wk.written ? 5 : 3} />
              <text x={wk.x} y={wk.y + (wide ? 15 : 13)} textAnchor="middle" fontFamily={F.display} fontWeight={700} fontSize={wide ? 42 : 38} fill={T.heading}>
                {wk.n}
              </text>
              {wk.sessions.map((s, j) => {
                const cx = wk.x + (j - (wk.sessions.length - 1) / 2) * (tick * 3.4);
                const cy = wk.y + r + 22;
                const isW = written.includes(s.id);
                return <circle key={s.id} cx={cx} cy={cy} r={tick} fill={isW ? actColor(actOfUnit(s.unit)) : "none"} stroke={isW ? actColor(actOfUnit(s.unit)) : T.faint} strokeWidth={2} />;
              })}
              {!wide && latestWeek && latestWeek.n === wk.n ? (
                <text x={wk.x} y={wk.y + r + 22 + tick + labelSize - 4} textAnchor="middle" fontFamily={F.mono} fontSize={26} letterSpacing="1" fill={actColor(wk.act)}>
                  {`HERE · ${latest ? latest.id : ""}`}
                </text>
              ) : (
                <text x={wk.x} y={wk.y + r + 22 + tick + labelSize - (wide ? 0 : 4)} textAnchor="middle" fontFamily={F.mono} fontSize={wide ? 28 : 24} letterSpacing="2" fill={T.muted}>
                  {`UNIT ${wk.units.join("·")}`}
                </text>
              )}
            </g>
          ))}
          {latestWeek && latest ? (
            <g>
              <path
                d={`M${latestWeek.x} ${latestWeek.y - r - 2} v-${wide ? 50 : 44}`}
                stroke={actColor(latestWeek.act)}
                strokeWidth={4}
                strokeLinecap="round"
              />
              <path
                d={`M${latestWeek.x + 2} ${latestWeek.y - r - (wide ? 52 : 46)} h${wide ? 34 : 30} l-${wide ? 10 : 9} ${wide ? 11 : 10} l${wide ? 10 : 9} ${wide ? 11 : 10} h-${wide ? 34 : 30} z`}
                fill={actColor(latestWeek.act)}
              />
            </g>
          ) : null}
        </svg>
        {wide && latestWeek && latest
          ? (() => {
              const text = `YOU ARE HERE · ${latest.id}`;
              const tw = text.length * labelSize * 0.64;
              const cx = Math.min(Math.max(latestWeek.x, tw / 2), w - tw / 2);
              return (
                <div
                  style={{
                    position: "absolute",
                    left: cx - tw / 2,
                    width: tw,
                    textAlign: "center",
                    top: latestWeek.y - r - (wide ? 104 : 96),
                    fontFamily: F.mono,
                    fontSize: labelSize,
                    letterSpacing: ".06em",
                    color: actColor(latestWeek.act),
                    whiteSpace: "nowrap",
                  }}
                >
                  {text}
                </div>
              );
            })()
          : null}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: legendH, display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 56 : 14, alignItems: wide ? "center" : "flex-start", justifyContent: wide ? "flex-start" : "flex-end" }}>
          {path.acts.map((a) => (
            <Label key={a.id} size={wide ? 30 : 28} color={T.soft} style={{ display: "flex", alignItems: "center", gap: 14, letterSpacing: ".1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              <span style={{ width: 16, height: 16, borderRadius: 4, background: actColor(a.color as ActColor), display: "inline-block" }} />
              Act {a.id} · {a.name}{wide ? "" : ` · weeks ${a.weeks}`}
            </Label>
          ))}
        </div>
      </div>
    </Frame>
  );
};
