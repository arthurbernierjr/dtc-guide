import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Move = { from: string; cmd: string; to: string; kind: "down" | "up" | "jump" | "back" };
const MOVES: Move[] = [
  { from: "~", cmd: "cd Desktop/navigation-practice/dungeon", to: "dungeon", kind: "down" },
  { from: "dungeon", cmd: "cd floor-1/room-a", to: "room-a", kind: "down" },
  { from: "room-a", cmd: "cd ..", to: "floor-1", kind: "up" },
  { from: "floor-1", cmd: "cd ..", to: "dungeon", kind: "up" },
  { from: "dungeon", cmd: "cd floor-2/boss-room", to: "boss-room", kind: "down" },
  { from: "boss-room", cmd: "cd ~", to: "~", kind: "jump" },
  { from: "~", cmd: "cd ~/Desktop/navigation-practice/dungeon/floor-2/boss-room", to: "boss-room", kind: "jump" },
  { from: "boss-room", cmd: "cd -", to: "~", kind: "back" },
];
const KIND = { down: T.green, up: T.yellow, jump: T.greenLight, back: T.red } as const;
const KIND_NAME = { down: "down a branch (relative)", up: ".. is up one", jump: "absolute or ~ · from anywhere", back: "- · back to the previous folder" } as const;

/** §R10 #35 — the navigation drill as a dungeon map: every cd is a move, and .. is always the way up. */
export const DungeonMoves: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 20 : 17;

  const room = (name: string, color: string, sub?: string) => (
    <div style={{ padding: wide ? "8px 14px" : "6px 10px", border: `1.5px solid ${color}`, borderRadius: 10, background: T.code, display: "flex", flexDirection: "column", alignItems: "center", minWidth: wide ? 120 : 96 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs, color: T.heading, fontWeight: 600 }}>{name}</span>
      {sub ? <span style={{ fontFamily: F.body, fontSize: fs - 6, color: T.muted }}>{sub}</span> : null}
    </div>
  );
  const edge = (h: number) => <div style={{ width: 2, height: h, background: T.border2, alignSelf: "center" }} />;

  const map = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, flex: wide ? "0 0 560px" : "0 0 auto", padding: wide ? "14px 16px" : "10px 12px", background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase", alignSelf: "flex-start", marginBottom: 8 }}>the dungeon · ~/Desktop/navigation-practice</Label>
      {room("~", T.yellow, "home")}
      {edge(14)}
      {room("Desktop", T.border2)}
      {edge(14)}
      {room("navigation-practice", T.border2)}
      {edge(14)}
      {room("dungeon", T.heading)}
      {edge(14)}
      <div style={{ display: "flex", gap: wide ? 60 : 36, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {room("floor-1", T.border2)}
          {edge(12)}
          <div style={{ display: "flex", gap: 12 }}>{room("room-a", T.green)}{room("room-b", T.border2)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {room("floor-2", T.border2)}
          {edge(12)}
          {room("boss-room", T.green, "the target")}
        </div>
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, marginTop: 10, textAlign: "center", lineHeight: 1.3 }}>Every folder has one parent. <span style={{ fontFamily: F.mono, color: T.yellow }}>..</span> is always the step towards the root; <span style={{ fontFamily: F.mono, color: T.yellow }}>.</span> is where you stand.</span>
    </div>
  );

  const moves = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 6 : 4, flex: 1, minWidth: 0 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 2 }}>the drill · eight moves, where each one lands</Label>
      {MOVES.map((m, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: wide ? "96px 1fr 110px" : "80px 1fr 96px", gap: 10, alignItems: "center", padding: wide ? "6px 12px" : "5px 10px", background: T.code, border: `1px solid ${T.border2}`, borderLeft: `4px solid ${KIND[m.kind]}`, borderRadius: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.muted, whiteSpace: "nowrap" }}>{m.from}</span>
          <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading, whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.25 }}><span style={{ color: T.greenLight }}>$</span> {m.cmd}</span>
          <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: KIND[m.kind], fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>→ {m.to}</span>
        </div>
      ))}
      <div style={{ display: "flex", gap: wide ? 18 : 10, flexWrap: "wrap", marginTop: 4 }}>
        {(["down", "up", "jump", "back"] as const).map((k) => (
          <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: F.body, fontSize: fs - 4, color: T.muted }}><span style={{ width: 12, height: 12, borderRadius: 3, background: KIND[k] }} />{KIND_NAME[k]}</span>
        ))}
      </div>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 4 · Every cd is a move on the map" title="Session 1.2 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 24 : 12, flex: 1, minHeight: 0 }}>
          {map}
          {moves}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Say where you think you are <span style={{ color: T.heading }}>before</span> you run <span style={{ fontFamily: F.mono, color: T.heading }}>pwd</span>. When the two agree eight times in a row, you can navigate anywhere.
        </div>
      </div>
    </Frame>
  );
};
