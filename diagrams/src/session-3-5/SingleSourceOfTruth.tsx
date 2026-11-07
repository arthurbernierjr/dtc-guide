import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Row = { tag: string; code: string[]; ok: boolean; why: string };

/** §R10 #23 — two rules of the arena: never store game data in the DOM, and never store what you can compute. */
export const SingleSourceOfTruth: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 23 : 20;

  const panel = (rule: string, title: string, color: string, rows: Row[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, flex: 1, minWidth: 0, padding: wide ? "16px 18px" : "12px 14px", background: T.card, border: `1.5px solid ${color}`, borderRadius: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <Label size={wide ? 24 : 21} color={color} style={{ letterSpacing: ".16em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{rule}</Label>
        <span style={{ fontFamily: F.display, fontSize: wide ? 26 : 22, color: T.heading, fontWeight: 600 }}>{title}</span>
      </div>
      {rows.map((r) => (
        <div key={r.tag} style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 8, flex: wide ? 1 : undefined, padding: wide ? "12px 14px" : "8px 10px", background: T.code, border: `1px solid ${r.ok ? T.green : T.red}`, borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: r.ok ? T.green : T.red, letterSpacing: ".14em", textTransform: "uppercase" }}>{r.tag}</span>
            <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.muted }}>{r.why}</span>
          </div>
          {r.code.map((c) => (
            <span key={c} style={{ fontFamily: F.mono, fontSize: fs, color: r.ok ? T.heading : T.soft, whiteSpace: "pre" }}>{c}</span>
          ))}
        </div>
      ))}
    </div>
  );

  const dom = panel("Rule 1", "The DOM is a display, not a database", T.yellow, [
    { tag: "wrong", ok: false, code: ["const n = parseInt(scoreEl.textContent);", "scoreEl.textContent = n + 1;"], why: 'breaks the day the label says "Score: 3"' },
    { tag: "right", ok: true, code: ["state.score += 1;", "render();  // scoreEl.textContent = state.score"], why: "the number lives in one place" },
  ]);

  const computed = panel("Rule 2", "Never store what you can compute", T.green, [
    { tag: "wrong", ok: false, code: ["let moveCount = 0;  // bumped in the handler", "if (moveCount === 9 && !winner) tie();"], why: "two facts that can drift apart" },
    { tag: "right", ok: true, code: ["const isTie = !winner &&", "  board.every((sq) => sq !== null);"], why: "the board already knows" },
  ]);

  const extras = [
    { k: "constants", v: "if (guesses > MAX_GUESSES)   not   > 5" },
    { k: "group state", v: "players = { x: {…}, o: {…} }   not   p1Name, p1Score, p2Name…" },
    { k: "cache elements", v: 'const boardEl = document.getElementById("board");   once, at the top' },
  ];

  return (
    <Frame layout={layout} caption="Fig 2 · Single source of truth" title="Session 3.5 · The rules of the arena">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 20 : 10, flex: 1, minHeight: 0 }}>
          {dom}
          {computed}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: wide ? "8px 20px" : "4px 12px", padding: wide ? "12px 16px" : "10px 12px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 12, flexShrink: 0 }}>
          {extras.map((e) => (
            <React.Fragment key={e.k}>
              <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.yellow, letterSpacing: ".12em", textTransform: "uppercase", whiteSpace: "nowrap", paddingTop: 2 }}>{e.k}</span>
              <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.soft, whiteSpace: wide ? "pre" : "pre-wrap" }}>{e.v}</span>
            </React.Fragment>
          ))}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 26 : 22, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Redundant state drifts; <span style={{ color: T.heading }}>computed values never lie</span>. If you are reading a number out of an element to do maths on it, stop: that number belongs in a variable.
        </div>
      </div>
    </Frame>
  );
};
