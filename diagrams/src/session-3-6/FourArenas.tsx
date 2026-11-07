import React from "react";
import { Frame } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Arena = { letter: string; name: string; sub: string; color: string; cls: string; state: string[]; win: string; lose: string; tool: string };

const ARENAS: Arena[] = [
  { letter: "A", name: "Memory Card Game", sub: "The Matching Spell", color: T.green, cls: "Card { value, isFlipped, isMatched, element }", state: ["cards[] (6–10 pairs, shuffled)", "flipped[] (0, 1 or 2 cards)", "attempts · seconds"], win: "every pair matched", lose: "a move limit or the clock", tool: "shuffle() · setTimeout for the flip-back" },
  { letter: "B", name: "Whack-a-Mole", sub: "Dungeon Whacker", color: T.yellow, cls: "Mole { holeIndex, isVisible, speed, element }", state: ["holes (9–12) · activeMole", "score · highScore", "timeLeft · isPlaying"], win: "reach the target score", lose: "the timer hits zero", tool: "setInterval + clearInterval · randomInt()" },
  { letter: "C", name: "Quiz Game", sub: "The Sage's Trial", color: T.red, cls: "Quiz { questions, currentIndex, score, lives }", state: ["questions[] (10+, shuffled)", "currentIndex · score", "lives (start at 3)"], win: "answer every question", lose: "lives reach zero", tool: "shuffle() · feedback classes, green and red" },
  { letter: "D", name: "RPG Battle", sub: "Arena Combat Simulator", color: T.green, cls: "Character → Player, Enemy · Battle", state: ["player · enemies[] · current", "turn · potions", "battle log[]"], win: "every enemy defeated", lose: "player HP reaches zero", tool: "Math.max(0, atk − def) · random enemy AI" },
];

/** §R10 #26 — the four arenas: one class, the state each must track, and its win and lose conditions. */
export const FourArenas: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 21 : 18;

  const card = (a: Arena) => (
    <div key={a.letter} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: wide ? 8 : 5, padding: wide ? "14px 16px" : "9px 12px", background: T.card, border: `1.5px solid ${a.color}`, borderRadius: 14, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: F.mono, fontSize: fs + 3, color: T.ink, background: a.color, borderRadius: 8, padding: "4px 10px", fontWeight: 600, lineHeight: 1 }}>{a.letter}</span>
        <span style={{ fontFamily: F.display, fontSize: wide ? 28 : 23, color: T.heading, fontWeight: 600, whiteSpace: "nowrap" }}>{a.name}</span>
        <span style={{ fontFamily: F.story, fontStyle: "italic", fontSize: fs + 1, color: T.muted, whiteSpace: "nowrap" }}>{a.sub}</span>
      </div>
      <span style={{ fontFamily: F.mono, fontSize: fs, color: a.color, whiteSpace: "nowrap" }}>class {a.cls}</span>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.faint, letterSpacing: ".14em", textTransform: "uppercase" }}>state</span>
          {a.state.map((s) => (
            <span key={s} style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.soft, lineHeight: 1.3 }}>{s}</span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.faint, letterSpacing: ".14em", textTransform: "uppercase" }}>win · lose · tools</span>
          <span style={{ fontFamily: F.body, fontSize: fs, color: T.greenLight, lineHeight: 1.3 }}>✓ {a.win}</span>
          <span style={{ fontFamily: F.body, fontSize: fs, color: T.red, lineHeight: 1.3 }}>✗ {a.lose}</span>
          <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.muted, lineHeight: 1.3 }}>{a.tool}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 5 · Four arenas" title="Session 3.6 · Pick your game">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 8, height: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: wide ? "1fr 1fr" : "1fr", gridAutoRows: "1fr", gap: wide ? 14 : 6, flex: 1, minHeight: 0 }}>{ARENAS.map(card)}</div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 26 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Every option is the same loop with a different <span style={{ color: T.heading }}>state</span> list. Option E is your own idea at this size: <span style={{ color: T.heading }}>one meaningful class, a win and a lose condition, restart without reload, two event types, deployed</span>.
        </div>
      </div>
    </Frame>
  );
};
