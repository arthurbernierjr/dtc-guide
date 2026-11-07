import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Section = { head: string; lines: string[] };

const SECTIONS: Section[] = [
  { head: "/*----- constants -----*/", lines: ["const MAX_GUESSES = 3;", "const WIN_LINES = [[0,1,2], [3,4,5], …];"] },
  { head: "/*----- state variables -----*/", lines: ["let board, turn, winner;   // declared, not initialised"] },
  { head: "/*----- cached DOM elements -----*/", lines: ['const boardEl = document.getElementById("board");', 'const msgEl = document.getElementById("message");'] },
  { head: "/*----- event listeners -----*/", lines: ['boardEl.addEventListener("click", handleMove);', 'resetBtn.addEventListener("click", init);'] },
  { head: "/*----- functions -----*/", lines: ["init();                      // kick off", "function init() { …state…; render(); }", "function render() { renderBoard(); renderMessage(); }", "function handleMove(evt) { guard; update; render(); }"] },
];

const ORDER = [
  { n: 1, t: "declare the state variables (no values yet)" },
  { n: 2, t: "write init(): set every state value, end with render()" },
  { n: 3, t: "stub render(): it can console.log(board) at first" },
  { n: 4, t: "call init() so the app has a starting screen" },
  { n: 5, t: "register the event listeners" },
  { n: 6, t: "write each handler: guard → update state → render()" },
  { n: 7, t: "commit at every milestone; one user story at a time" },
];

/** §R10 #24 — the five labelled sections of app.js and the proven order to fill them in. */
export const FileSkeleton: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 22 : 18;

  const file = (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: wide ? 10 : 5, flex: wide ? "0 0 840px" : "0 0 auto", padding: wide ? "16px 18px" : "10px 14px", background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 14, minWidth: 0 }}>
      <Label size={wide ? 24 : 20} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>app.js · five sections, always in this order</Label>
      {SECTIONS.map((s) => (
        <div key={s.head} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.yellow, whiteSpace: "nowrap" }}>{s.head}</span>
          {s.lines.map((l) => (
            <span key={l} style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.soft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingLeft: 10 }}>{l}</span>
          ))}
        </div>
      ))}
    </div>
  );

  const order = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 8 : 4, flex: 1, minWidth: 0 }}>
      <Label size={wide ? 24 : 20} color={T.green} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>the proven order</Label>
      {ORDER.map((o) => (
        <div key={o.n} style={{ display: "grid", gridTemplateColumns: wide ? "44px 1fr" : "36px 1fr", gap: 12, alignItems: "center", padding: wide ? "9px 12px" : "4px 10px", background: T.card, border: `1.5px solid ${o.n === 7 ? T.yellow : T.border2}`, borderRadius: 12 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs + 2, color: T.ink, background: o.n === 7 ? T.yellow : T.green, borderRadius: 8, width: wide ? 40 : 32, height: wide ? 40 : 32, display: "grid", placeItems: "center", fontWeight: 600 }}>{o.n}</span>
          <span style={{ fontFamily: F.body, fontSize: fs + 1, color: T.heading, lineHeight: 1.25 }}>{o.t}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 3 · The skeleton and the order" title="Session 3.5 · The battle plan">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 28 : 8, flex: 1, minHeight: 0 }}>
          {file}
          {order}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 26 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Staring at an empty file is where projects die. <span style={{ color: T.heading }}>Sections first, then state, then init and render, then one user story at a time.</span> Ugly and working beats a perfect plan with no code.
        </div>
      </div>
    </Frame>
  );
};
