import React from "react";
import { Card, Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #3 — five hundred hand-copied players, each carrying its own attack(). */
export const OoHandCopied: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const cols = wide ? 10 : 5;
  const rows = 5;
  const cards = Array.from({ length: cols * rows }, (_, i) => i);
  const cardW = wide ? 84 : 132;
  const cardH = wide ? 112 : 108;
  const gap = wide ? 14 : 18;

  const grid = (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cardW}px)`, gap, alignContent: "start" }}>
      {cards.map((i) => (
        <div key={i} style={{ width: cardW, height: cardH, background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 8, width: "70%", background: T.faint, borderRadius: 4 }} />
          <div style={{ height: 8, width: "45%", background: T.faint, borderRadius: 4 }} />
          <div style={{ marginTop: "auto", height: wide ? 34 : 32, background: `rgb(${T.rgb.red} / .22)`, border: `1.5px solid ${T.red}`, borderRadius: 6 }} />
        </div>
      ))}
    </div>
  );

  const zoom = (
    <Card style={{ width: wide ? 420 : 380, padding: 20, border: `2px solid ${T.border2}`, boxSizing: "border-box" }}>
      <Label size={30} color={T.muted} style={{ marginBottom: 8 }}>player #017 · its own copy</Label>
      <Label size={wide ? 34 : 30} color={T.soft}>name <span style={{ color: T.heading }}>"Conan"</span></Label>
      <Label size={wide ? 34 : 30} color={T.soft}>hp <span style={{ color: T.heading }}>150</span></Label>
      <div style={{ marginTop: 14, padding: "10px 16px", background: `rgb(${T.rgb.red} / .18)`, border: `2px solid ${T.red}`, borderRadius: 10 }}>
        <Label size={36} color={T.red}>attack() {"{ … }"}</Label>
      </div>
    </Card>
  );

  const counter = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontFamily: F.display, fontWeight: 700, fontSize: wide ? 84 : 80, lineHeight: 1, color: T.heading }}>× 500</div>
      <Label size={36} color={T.red}>500 copies of attack()</Label>
      <div style={{ fontFamily: F.body, fontSize: wide ? 32 : 32, lineHeight: 1.35, color: T.soft, maxWidth: wide ? 440 : 380, marginTop: 6 }}>
        One bug in <span style={{ fontFamily: F.mono, color: T.heading }}>attack()</span> is five hundred fixes. Same code, stamped on every player.
      </div>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 1 · Hand-copied players" title="Session 3.3 · The problem">
      {wide ? (
        <div style={{ display: "flex", gap: 56, alignItems: "flex-start", height: "100%" }}>
          {grid}
          <div style={{ display: "flex", flexDirection: "column", gap: 28, flex: 1 }}>
            {counter}
            {zoom}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 40, height: "100%" }}>
          {grid}
          <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
            {zoom}
            {counter}
          </div>
        </div>
      )}
    </Frame>
  );
};
