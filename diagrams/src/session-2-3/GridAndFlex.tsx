import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #61 — the page is a grid; the pieces inside it are flex. A navbar is a row, a card is a column with the reward pushed to the end, and the grid only decides where the cards sit. */
export const GridAndFlex: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 17 : 16;
  const quest = (name: string, reward: string) => (
    <div key={name} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: T.code, borderLeft: `3px solid ${T.green}`, borderRadius: 8, minHeight: wide ? 92 : 78 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading }}>{name}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, lineHeight: 1.3 }}>flex-direction: column</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.yellow, marginTop: "auto" }}>{reward}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 5 · Grid for the page, flex for the piece" title="Session 2.3 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8, height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 14px", background: "#16161A", border: `1px solid ${T.border2}`, borderRadius: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.green, fontWeight: 700 }}>Quest Board</span>
          <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.soft }}>{wide ? "Home    Quests    Party    Profile" : "Home · Quests · Party"}</span>
        </div>
        <Label size={fs - 5} color={T.green} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>display: flex · space-between · the bar is one row</Label>
        <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: wide ? "repeat(3, 1fr)" : "1fr 1fr", gap: 8 }}>
          {quest("Slay the Dragon", "500 gold")}
          {quest("Gather Moonflowers", "50 gold")}
          {quest("Escort the Merchant", "150 gold")}
          {quest("Clear the Dungeon", "300 gold")}
          {quest("Decode the Runes", "200 gold")}
          {quest("Win the Tournament", "400 gold")}
        </div>
        <Label size={fs - 5} color={T.yellow} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>display: grid · auto-fit · the cards are the page</Label>
        <div style={{ fontFamily: F.body, fontSize: wide ? 22 : 19, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          The reward sits at the bottom of every card because <span style={{ fontFamily: F.mono, color: T.yellow }}>margin-top: auto</span> eats the free space in a column. <span style={{ color: T.heading }}>Grid placed the cards. Flex arranged what is inside them.</span>
        </div>
      </div>
    </Frame>
  );
};
