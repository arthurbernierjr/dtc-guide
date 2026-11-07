import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Box = { title: string; color: string; lines: string[]; note: string };

const BOXES: Box[] = [
  { title: "1 · event", color: T.yellow, lines: ["click · keydown", "submit · tick"], note: "the player, or the clock, does something" },
  { title: "2 · handler", color: T.yellow, lines: ["if (winner) return;", "board[i] = turn;", "render();"], note: "guard, update state, render: in that order" },
  { title: "3 · state", color: T.green, lines: ["{ board, turn,", "  winner, score,", "  timer, lives }"], note: "the single source of truth, plain data" },
  { title: "4 · render()", color: T.green, lines: ["renderBoard();", "renderScore();", "renderMessage();"], note: "reads state, writes the DOM, never the reverse" },
  { title: "5 · DOM", color: T.muted, lines: ["what the player", "sees right now"], note: "a display, not a database" },
];

/** §R10 #22 — the event-driven loop every browser game runs: event → handler → state → render → DOM → event. */
export const GameLoop: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 22 : 20;

  const box = (b: Box) => (
    <div key={b.title} style={{ display: "flex", flexDirection: wide ? "column" : "row", alignItems: wide ? "stretch" : "center", gap: wide ? 12 : 14, padding: wide ? "16px 14px" : "8px 12px", background: T.card, border: `1.5px solid ${b.color === T.muted ? T.border2 : b.color}`, borderRadius: 14, minWidth: 0, flex: 1 }}>
      <Label size={wide ? 24 : 21} color={b.color === T.muted ? T.heading : b.color} style={{ letterSpacing: ".14em", textTransform: "uppercase", whiteSpace: "nowrap", flex: wide ? undefined : "0 0 170px" }}>{b.title}</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: wide ? "10px 10px" : "6px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10, flex: wide ? undefined : "0 0 250px" }}>
        {b.lines.map((l) => (
          <span key={l} style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading, whiteSpace: "pre" }}>{l}</span>
        ))}
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 1, color: T.muted, lineHeight: 1.3, flex: wide ? undefined : 1 }}>{b.note}</span>
    </div>
  );

  const arrow = (dir: "right" | "down") => {
    const d = dir === "right" ? "M6 22 H34 M24 12 L36 22 L24 32" : "M22 6 V34 M12 24 L22 36 L32 24";
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
        <svg width={wide ? 36 : 26} height={wide ? 36 : 26} viewBox="0 0 44 44">
          <path d={d} stroke={T.green} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  };

  const loopBack = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", flexShrink: 0 }}>
      <span style={{ flex: 1, height: 2, background: T.border2, borderRadius: 2 }} />
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.muted, letterSpacing: ".14em", textTransform: "uppercase", whiteSpace: "nowrap" }}>⟲ the player sees the new screen and acts again</span>
      <span style={{ flex: 1, height: 2, background: T.border2, borderRadius: 2 }} />
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 1 · The game loop" title="Session 3.6 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 16 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 4 : 2, flex: 1, minHeight: 0, alignItems: "stretch" }}>
          {box(BOXES[0])}{arrow(wide ? "right" : "down")}{box(BOXES[1])}{arrow(wide ? "right" : "down")}{box(BOXES[2])}{arrow(wide ? "right" : "down")}{box(BOXES[3])}{arrow(wide ? "right" : "down")}{box(BOXES[4])}
        </div>
        {loopBack}
        <div style={{ fontFamily: F.body, fontSize: wide ? 27 : 22, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Every browser game is this one loop. <span style={{ color: T.heading }}>State is the single source of truth</span>; the DOM only displays it. When an event arrives, ask "what <span style={{ color: T.heading }}>state</span> changes?" first, and let <span style={{ fontFamily: F.mono, color: T.green }}>render()</span> catch the screen up.
        </div>
      </div>
    </Frame>
  );
};
