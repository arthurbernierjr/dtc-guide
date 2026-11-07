import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #62 — a transition is one property moving from the value it has to the value it is given, over a duration, on a curve, after a delay. */
export const TransitionTimeline: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 18 : 16;
  const mark = (label: string, color: string, at: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "absolute", left: at, top: 0, transform: "translateX(-50%)" }}>
      <span style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />
      <span style={{ fontFamily: F.mono, fontSize: fs - 4, color, whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 1 · From this value to that one" title="Session 2.4 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 10, flexShrink: 0 }}>
          <div style={{ flex: 1, padding: wide ? "14px 16px" : "12px", background: T.card, border: `1.5px solid ${T.muted}`, borderRadius: 14 }}>
            <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>at rest</Label>
            <div style={{ marginTop: 10, alignSelf: "flex-start", padding: "10px 16px", background: T.green, color: T.ink, fontFamily: F.mono, fontWeight: 700, borderRadius: 8 }}>Accept quest</div>
          </div>
          <div style={{ flex: 1, padding: wide ? "14px 16px" : "12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14 }}>
            <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>hovered · 0.2s later</Label>
            <div style={{ marginTop: 2, alignSelf: "flex-start", padding: "10px 16px", background: "#007838", color: T.ink, fontFamily: F.mono, fontWeight: 700, borderRadius: 8, transform: "translateY(-6px)", boxShadow: "0 8px 16px rgb(0 0 0 / .35)" }}>Accept quest</div>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0, padding: wide ? "16px 18px" : "12px", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <Label size={fs - 4} color={T.yellow} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>transition: transform 0.2s ease 0s</Label>
          <div style={{ position: "relative", height: 56, marginTop: 8 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 5, height: 3, background: T.border2 }} />
            <div style={{ position: "absolute", left: "8%", right: "8%", top: 5, height: 3, background: T.green }} />
            {mark("delay", T.muted, "8%")}
            {mark("start", T.green, "22%")}
            {mark("ease", T.yellow, "55%")}
            {mark("end", T.greenLight, "92%")}
          </div>
          <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.35 }}>The property is what moves. The duration is how long. The timing function is the curve, slow at the ends for ease. The delay is the wait before it starts.</span>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          A transition needs two values. <span style={{ color: T.heading }}>Hover supplies the second one. The transition is the trip between them.</span>
        </div>
      </div>
    </Frame>
  );
};
