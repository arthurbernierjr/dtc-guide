import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Key = { keys: string; does: string; group: "move" | "edit" | "recall" | "control" };
const KEYS: Key[] = [
  { keys: "↑ / ↓", does: "walk back and forward through commands you already typed", group: "recall" },
  { keys: "Tab", does: "finish a file or folder name for you; press twice to see every option", group: "recall" },
  { keys: "Ctrl + R", does: "search history: type a few letters, the last matching command appears", group: "recall" },
  { keys: "Ctrl + A", does: "jump to the beginning of the line", group: "move" },
  { keys: "Ctrl + E", does: "jump to the end of the line", group: "move" },
  { keys: "Ctrl + U", does: "erase everything before the cursor", group: "edit" },
  { keys: "Ctrl + K", does: "erase everything after the cursor", group: "edit" },
  { keys: "Ctrl + W", does: "erase just the last word (fix one typo, keep the rest)", group: "edit" },
  { keys: "Ctrl + Y", does: "paste back whatever U, K or W erased", group: "edit" },
  { keys: "Ctrl + C", does: "cancel: stop whatever is running, or throw away the line", group: "control" },
  { keys: "Ctrl + L", does: "clear the screen (same as typing clear)", group: "control" },
];
const COLOR = { move: T.green, edit: T.yellow, recall: T.greenLight, control: T.red } as const;
const GROUP = { recall: "recall", move: "move", edit: "edit", control: "control" } as const;

/** §R10 #31 — the keyboard shortcuts that make a terminal fast, grouped by what they do to the line. */
export const KeyboardMap: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 21 : 18;

  const lineDemo = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: wide ? "14px 18px" : "10px 12px", background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 14, flexShrink: 0 }}>
      <Label size={fs - 3} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>one line, with the cursor in the middle</Label>
      <div style={{ fontFamily: F.mono, fontSize: wide ? 28 : 22, color: T.heading, whiteSpace: "pre" }}>
        <span style={{ color: T.greenLight }}>$ </span><span style={{ textDecoration: "underline", textDecorationColor: T.yellow, textDecorationThickness: 3, textUnderlineOffset: 8 }}>mkdir -p isekai-camp/</span><span style={{ background: T.green, color: T.ink }}>i</span><span style={{ textDecoration: "underline", textDecorationColor: T.green, textDecorationThickness: 3, textUnderlineOffset: 8 }}>nventory/weapons</span>
      </div>
      <div style={{ display: "flex", gap: wide ? 28 : 14, flexWrap: "wrap" }}>
        <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.yellow }}>← Ctrl+U erases this part</span>
        <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.green }}>Ctrl+K erases this part →</span>
        <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.muted }}>Ctrl+A / Ctrl+E jump to either end · Ctrl+W takes back "isekai-camp/i"</span>
      </div>
    </div>
  );

  const table = (
    <div style={{ display: "grid", gridTemplateColumns: wide ? "1fr 1fr" : "1fr", gap: wide ? "8px 16px" : "5px", flex: 1, minHeight: 0, alignContent: "start" }}>
      {KEYS.map((k) => (
        <div key={k.keys} style={{ display: "grid", gridTemplateColumns: wide ? "120px 1fr" : "104px 1fr", gap: 12, alignItems: "center", padding: wide ? "7px 12px" : "5px 10px", background: T.code, border: `1px solid ${T.border2}`, borderLeft: `4px solid ${COLOR[k.group]}`, borderRadius: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.heading, fontWeight: 600, whiteSpace: "nowrap" }}>{k.keys}</span>
          <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.soft, lineHeight: 1.25 }}>{k.does}</span>
        </div>
      ))}
    </div>
  );

  const legend = (
    <div style={{ display: "flex", gap: wide ? 20 : 12, flexWrap: "wrap", flexShrink: 0 }}>
      {(["recall", "move", "edit", "control"] as const).map((g) => (
        <span key={g} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: F.mono, fontSize: fs - 5, color: T.muted, letterSpacing: ".14em", textTransform: "uppercase" }}><span style={{ width: 14, height: 14, borderRadius: 4, background: COLOR[g] }} />{GROUP[g]}</span>
      ))}
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 5 · The keyboard map" title="Session 1.1 · Pro tips">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 8, height: "100%" }}>
        {lineDemo}
        {table}
        {legend}
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Learn <span style={{ color: T.heading }}>↑, Tab and Ctrl+C</span> today and you are already faster than the mouse. The rest arrive one at a time, the day a long line annoys you enough.
        </div>
      </div>
    </Frame>
  );
};
