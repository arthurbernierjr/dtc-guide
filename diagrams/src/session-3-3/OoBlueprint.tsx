import React from "react";
import { Card, Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const INSTANCES = [
  { cls: "Warrior", name: "Conan", hp: 150, attack: 20 },
  { cls: "Mage", name: "Merlin", hp: 80, attack: 35 },
  { cls: "Healer", name: "Elara", hp: 90, attack: 15 },
];

/** §R10 #4 — one blueprint, three instances made with new; fields on the instance, methods on the blueprint. */
export const OoBlueprint: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const methods = ["takeDamage(amount)", "heal(amount)", "attackTarget(target)", "getStatus()"];

  const blueprint = (
    <div
      style={{
        width: wide ? 640 : "100%",
        height: wide ? "100%" : 470,
        border: `2px solid ${T.yellow}`,
        borderRadius: 14,
        padding: 30,
        background: `linear-gradient(rgb(${T.rgb.yellow} / .07) 1px, transparent 1px), linear-gradient(90deg, rgb(${T.rgb.yellow} / .07) 1px, transparent 1px), ${T.surface}`,
        backgroundSize: "40px 40px, 40px 40px, auto",
        display: "flex",
        flexDirection: "column",
        gap: wide ? 18 : 14,
        boxSizing: "border-box",
      }}
    >
      <Label size={34} color={T.yellow} style={{ letterSpacing: ".2em", textTransform: "uppercase" }}>Blueprint</Label>
      <div style={{ fontFamily: F.mono, fontSize: wide ? 44 : 42, color: T.heading }}>class Character {"{"}</div>
      <Label size={wide ? 32 : 30} color={T.soft} style={{ marginLeft: 36 }}>constructor(name, hp, attack)</Label>
      {methods.map((m) => (
        <div key={m} style={{ display: "flex", alignItems: "center", gap: 18, marginLeft: 36 }}>
          <Label size={wide ? 40 : 36} color={T.heading}>{m}</Label>
          <span style={{ fontFamily: F.mono, fontSize: 26, color: T.ink, background: T.green, borderRadius: 6, padding: "4px 10px", letterSpacing: ".08em" }}>ONCE</span>
        </div>
      ))}
      <div style={{ fontFamily: F.mono, fontSize: wide ? 44 : 42, color: T.heading }}>{"}"}</div>
    </div>
  );

  const instance = (it: (typeof INSTANCES)[number]) => (
    <Card key={it.cls} style={{ padding: "14px 24px", width: wide ? 440 : 250, boxSizing: "border-box", border: `1.5px solid ${T.green}` }}>
      <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: wide ? 36 : 34, color: T.heading, marginBottom: 4 }}>{it.cls}</div>
      <Label size={wide ? 32 : 30} color={T.soft}>name <span style={{ color: T.heading }}>"{it.name}"</span></Label>
      <Label size={wide ? 32 : 30} color={T.soft}>hp <span style={{ color: T.heading }}>{it.hp}</span></Label>
      <Label size={wide ? 32 : 30} color={T.soft}>attack <span style={{ color: T.heading }}>{it.attack}</span></Label>
    </Card>
  );

  const arrow = (dir: "right" | "down", key: string) => (
    <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: dir === "right" ? "row" : "column", gap: 10 }}>
      <Label size={36} color={T.green}>new</Label>
      <svg width={dir === "right" ? 90 : 32} height={dir === "right" ? 32 : 70} viewBox={dir === "right" ? "0 0 90 32" : "0 0 32 70"}>
        {dir === "right" ? <path d="M4 16 H80 M66 4 L82 16 L66 28" stroke={T.green} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M16 4 V60 M4 46 L16 62 L28 46" stroke={T.green} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </div>
  );

  const note = (
    <div style={{ fontFamily: F.body, fontSize: wide ? 32 : 30, lineHeight: 1.35, color: T.soft }}>
      Fields live on the <span style={{ color: T.heading }}>instance</span>. Methods live on the <span style={{ color: T.yellow }}>blueprint</span>, once, and every instance reaches them.
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 2 · One blueprint" title="Session 3.3 · The idea">
      {wide ? (
        <div style={{ display: "flex", gap: 36, height: "100%" }}>
          {blueprint}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
            {INSTANCES.map((it) => (
              <div key={it.cls} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {arrow("right", it.cls)}
                {instance(it)}
              </div>
            ))}
            {note}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
          {blueprint}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {INSTANCES.map((it) => (
              <div key={it.cls} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                {arrow("down", it.cls)}
                {instance(it)}
              </div>
            ))}
          </div>
          {note}
        </div>
      )}
    </Frame>
  );
};
