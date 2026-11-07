import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Tick = { t: string; player: string; ticks: string; timer: number; note: string };

const TICKS: Tick[] = [
  { t: "0 s", player: "Start", ticks: "", timer: 30, note: "interval #1 begins" },
  { t: "1 s", player: "", ticks: "#1", timer: 29, note: "one tick a second, as designed" },
  { t: "2 s", player: "Start again", ticks: "#1", timer: 28, note: "interval #2 begins; #1 still alive" },
  { t: "3 s", player: "", ticks: "#1 · #2", timer: 26, note: "two ticks a second, clock doubles" },
  { t: "4 s", player: "", ticks: "#1 · #2", timer: 24, note: "" },
  { t: "16 s", player: "", ticks: "#1 · #2", timer: 0, note: "endGame() runs; ticks keep coming" },
  { t: "17 s", player: "", ticks: "#1 · #2", timer: -2, note: "Game Over! Game Over! Game Over!" },
];

const FIX = `start() {
  if (this.isPlaying) return;  // 1 guard
  clearInterval(this.id);      // 2 kill the old one
  this.isPlaying = true;
  this.id = setInterval(() => this.tick(), 1000);
}
endGame() {
  clearInterval(this.id);      // 3 always, on end
  this.isPlaying = false;
  this.render();
}`;

/** §R10 #25 — the interval that never died: Start pressed twice, two timers ticking, and a game over that keeps firing. */
export const TimerLeak: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 22 : 19;
  const cell = (color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({ fontFamily: F.mono, fontSize: fs - 1, color, padding: wide ? "12px 0" : "5px 0", borderTop: `1px solid ${T.border}`, whiteSpace: "nowrap", ...extra });

  const lane = (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, padding: wide ? "14px 18px" : "10px 12px", background: T.card, border: `1.5px solid ${T.red}`, borderRadius: 14 }}>
      <Label size={wide ? 24 : 21} color={T.red} style={{ letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>what the player did · what the clock did</Label>
      <div style={{ display: "grid", gridTemplateColumns: wide ? "60px 132px 100px 60px 1fr" : "58px 130px 96px 64px 1fr", gap: wide ? "0 12px" : "0 8px", alignItems: "center" }}>
        {["when", "player", "ticks", "timer", "what happened"].map((h) => (
          <span key={h} style={{ fontFamily: F.mono, fontSize: fs - 6, color: T.faint, letterSpacing: ".12em", textTransform: "uppercase", padding: "4px 0" }}>{h}</span>
        ))}
        {TICKS.map((r, i) => (
          <React.Fragment key={i}>
            <span style={cell(T.muted)}>{r.t}</span>
            <span style={cell(T.yellow)}>{r.player}</span>
            <span style={cell(r.ticks.includes("#2") ? T.red : T.heading)}>{r.ticks}</span>
            <span style={cell(r.timer < 0 ? T.red : r.timer === 0 ? T.yellow : T.heading, { fontSize: fs, fontWeight: 600 })}>{r.timer}</span>
            <span style={cell(r.note.includes("Game Over") ? T.red : T.muted, { fontFamily: F.body, fontSize: fs - 2, whiteSpace: wide ? "nowrap" : "normal", lineHeight: 1.2 })}>{r.note}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const fix = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8, flex: wide ? "0 0 690px" : "0 0 auto", padding: wide ? "14px 18px" : "10px 12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14, minWidth: 0 }}>
      <Label size={wide ? 24 : 21} color={T.green} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>the fix · three lines</Label>
      <div style={{ fontFamily: F.mono, fontSize: wide ? 20 : 17, color: T.heading, lineHeight: 1.55, whiteSpace: "pre", padding: wide ? "10px 12px" : "8px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10, overflow: "hidden" }}>{FIX}</div>
      <span style={{ fontFamily: F.body, fontSize: fs - 1, color: T.muted, lineHeight: 1.3 }}>Keep the id <span style={{ fontFamily: F.mono, color: T.heading }}>setInterval</span> returns. Every start clears before it sets; every end clears. One timer, ever.</span>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 4 · The interval that never died" title="Session 3.6 · Where it breaks">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 22 : 10, flex: 1, minHeight: 0 }}>
          {lane}
          {fix}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 26 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, color: T.heading }}>setInterval</span> is a promise to call you forever. <span style={{ color: T.heading }}>Whoever starts a timer owns its id and must clear it</span>, on restart and on game over, or the clock keeps ticking in a game that is already finished.
        </div>
      </div>
    </Frame>
  );
};
