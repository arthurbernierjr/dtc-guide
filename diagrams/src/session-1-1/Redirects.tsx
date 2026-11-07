import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Step = { cmd: string; file: string[]; note: string; color: string };

const STEPS: Step[] = [
  { cmd: 'echo "Day 1: I woke up in a terminal." > day-01.txt', file: ["Day 1: I woke up in a terminal."], note: "> creates the file, or replaces everything in it", color: T.green },
  { cmd: 'echo "I learned echo, pwd, whoami." >> day-01.txt', file: ["Day 1: I woke up in a terminal.", "I learned echo, pwd, whoami."], note: ">> adds to the end and keeps what was there", color: T.green },
  { cmd: 'echo "I might actually be able to do this." > day-01.txt', file: ["I might actually be able to do this."], note: "one missing > and two lines are gone, silently", color: T.red },
];

/** §R10 #30 — `>` overwrites, `>>` appends: the same file after three echo commands. */
export const Redirects: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 22 : 19;

  const col = (s: Step, i: number) => (
    <div key={i} style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 6, flex: 1, minWidth: 0, padding: wide ? "14px 16px" : "10px 12px", background: T.card, border: `1.5px solid ${s.color}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={s.color} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>{i === 0 ? "1 · write" : i === 1 ? "2 · append" : "3 · the trap"}</Label>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading, lineHeight: 1.35, whiteSpace: wide ? "pre-wrap" : "pre-wrap", wordBreak: "break-word" }}><span style={{ color: T.greenLight }}>$</span> {s.cmd.split(/(>>?)/).map((p, j) => (p === ">" || p === ">>" ? <span key={j} style={{ color: s.color, fontWeight: 700 }}>{p}</span> : <span key={j}>{p}</span>))}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: wide ? "10px 12px" : "8px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10, flex: wide ? 1 : undefined, minHeight: wide ? 0 : 72 }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 6, color: T.faint, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>day-01.txt after</span>
        {s.file.map((l, j) => (
          <span key={j} style={{ fontFamily: F.mono, fontSize: fs - 2, color: i === 2 ? T.red : T.soft, lineHeight: 1.4 }}>{l}</span>
        ))}
        {i === 2 ? <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.faint, lineHeight: 1.4, textDecoration: "line-through" }}>Day 1: I woke up in a terminal.</span> : null}
        {i === 2 ? <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.faint, lineHeight: 1.4, textDecoration: "line-through" }}>I learned echo, pwd, whoami.</span> : null}
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.muted, lineHeight: 1.3 }}>{s.note}</span>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 4 · > overwrites, >> appends" title="Session 1.1 · Where it breaks">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 8, flex: 1, minHeight: 0 }}>{STEPS.map(col)}</div>
        <div style={{ display: "grid", gridTemplateColumns: wide ? "auto 1fr auto 1fr" : "auto 1fr", gap: wide ? "6px 16px" : "4px 12px", padding: wide ? "10px 16px" : "8px 12px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 12, alignItems: "baseline", flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs + 2, color: T.green, fontWeight: 700 }}>&gt;</span><span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.soft }}>one arrow: <b style={{ color: T.heading }}>replace</b>. The file is emptied first, then written. No warning.</span>
          <span style={{ fontFamily: F.mono, fontSize: fs + 2, color: T.green, fontWeight: 700 }}>&gt;&gt;</span><span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.soft }}>two arrows: <b style={{ color: T.heading }}>add</b>. Created if missing, extended if present.</span>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 26 : 22, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Both redirect output <span style={{ color: T.heading }}>into a file instead of the screen</span>. Habit for the week: first line with <span style={{ fontFamily: F.mono, color: T.heading }}>&gt;</span>, every line after with <span style={{ fontFamily: F.mono, color: T.heading }}>&gt;&gt;</span>, then <span style={{ fontFamily: F.mono, color: T.heading }}>cat</span> to check.
        </div>
      </div>
    </Frame>
  );
};
