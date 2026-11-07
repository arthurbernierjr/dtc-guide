import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #64 — keyframes are a list of stops. A transition has two. An animation can have many, can loop, and can stay on the last stop with fill-mode forwards. */
export const KeyframeStops: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 18 : 16;
  const stop = (pct: string, scale: number, opacity: number, note: string) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.yellow }}>{pct}</span>
      <div style={{ width: wide ? 64 : 48, height: wide ? 64 : 48, borderRadius: "50%", background: T.green, opacity, transform: `scale(${scale})` }} />
      <span style={{ fontFamily: F.mono, fontSize: fs - 5, color: T.muted, textAlign: "center" }}>{note}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 3 · More than two stops" title="Session 2.4 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 8, padding: wide ? "14px 16px" : "12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14 }}>
          <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>@keyframes pulse · three stops, then it loops</Label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            {stop("0%", 1, 1, "scale 1")}
            <span style={{ color: T.muted, fontSize: fs }}>▶</span>
            {stop("50%", 1.1, 0.7, "scale 1.1")}
            <span style={{ color: T.muted, fontSize: fs }}>▶</span>
            {stop("100%", 1, 1, "scale 1")}
          </div>
          <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.soft }}>animation: pulse 2s ease-in-out infinite;</span>
        </div>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 12 : 8, flexShrink: 0 }}>
          <div style={{ flex: 1, padding: "10px 12px", background: T.card, border: `1.5px solid ${T.yellow}`, borderRadius: 12 }}>
            <Label size={fs - 5} color={T.yellow} style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>forwards</Label>
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft, lineHeight: 1.35 }}>When the animation ends, stay on the last stop. If the base rule is opacity 0, forwards keeps the final opacity 1 after the animation ends.</span>
          </div>
          <div style={{ flex: 1, padding: "10px 12px", background: T.card, border: `1.5px solid ${T.red}`, borderRadius: 12 }}>
            <Label size={fs - 5} color={T.red} style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>none · the default</Label>
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft, lineHeight: 1.35 }}>The moment the last stop is reached, the element returns to the rule it had before. That snap is the bug people file as "the fade didn't stick."</span>
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          A transition is two stops and a trigger. <span style={{ color: T.heading }}>A keyframe animation is a list of stops that can run on its own.</span>
        </div>
      </div>
    </Frame>
  );
};
