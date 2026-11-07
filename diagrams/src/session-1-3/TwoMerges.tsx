import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #40 — the two shapes a merge can take: fast-forward (main just catches up) and three-way (a new commit with two parents), with the lines git prints for each. */
export const TwoMerges: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 21 : 16;
  const R = wide ? 24 : 18;

  const dot = (color: string, label?: string, labelColor?: string, hollow = false) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: wide ? 92 : 74 }}>
      <div style={{ height: 20 }}>{label ? <span style={{ fontFamily: F.mono, fontSize: fs - 6, color: T.ink, background: labelColor || color, borderRadius: 5, padding: "1px 7px", fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span> : null}</div>
      <div style={{ width: R, height: R, borderRadius: "50%", background: hollow ? "transparent" : color, border: `3px solid ${color}` }} />
    </div>
  );
  const seg = (color: string, w: number) => <div style={{ width: w, height: 3, background: color, marginTop: 20 + R / 2 - 1, flex: "0 0 auto" }} />;
  const out = (lines: { t: string; c?: string }[]) => (
    <div style={{ padding: wide ? "10px 12px" : "8px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10, display: "flex", flexDirection: "column", gap: 1 }}>
      {lines.map((l, i) => (
        <span key={i} style={{ fontFamily: F.mono, fontSize: fs - 4, color: l.c || T.soft, whiteSpace: "pre", lineHeight: 1.3 }}>{l.t}</span>
      ))}
    </div>
  );

  const ff = (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: wide ? 8 : 6, padding: wide ? "12px 16px" : "10px 12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>fast-forward · main never moved, so it just catches up</Label>
      <div style={{ display: "flex", gap: wide ? 24 : 10, flexDirection: wide ? "row" : "column" }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted }}>before</span>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {dot(T.green, "main")}
            {seg(T.yellow, wide ? 40 : 24)}
            {dot(T.yellow, "side-quest", T.yellow)}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted }}>after git merge side-quest</span>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {dot(T.green)}
            {seg(T.green, wide ? 40 : 24)}
            {dot(T.green, "main, side-quest")}
          </div>
        </div>
      </div>
      {out([{ t: "Updating d1a2a91..f7b168e" }, { t: "Fast-forward", c: T.greenLight }, { t: " inventory.txt  | 1 +" }, { t: " side-quest.txt | 2 ++" }, { t: " 2 files changed, 3 insertions(+)" }])}
      <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.3 }}>No new commit. The label slides forward along a straight line. The history stays a single lane.</span>
    </div>
  );

  const three = (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: wide ? 8 : 6, padding: wide ? "12px 16px" : "10px 12px", background: T.card, border: `1.5px solid ${T.yellow}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={T.yellow} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>three-way · both moved, so git makes a merge commit</Label>
      <div style={{ display: "flex", gap: wide ? 24 : 10, flexDirection: wide ? "row" : "column" }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted }}>before</span>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {dot(T.green)}
            {seg(T.green, wide ? 40 : 24)}
            {dot(T.green, "main")}
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", marginTop: -14, paddingLeft: wide ? 46 : 37 }}>
            <span style={{ fontFamily: F.mono, fontSize: fs + 4, color: T.yellow, marginTop: 6 }}>╲</span>
            {seg(T.yellow, wide ? 40 : 24)}
            {dot(T.yellow, "dragon-slayer", T.yellow)}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted }}>after git merge dragon-slayer</span>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {dot(T.green)}
            {seg(T.green, wide ? 40 : 24)}
            {dot(T.green)}
            {seg(T.green, wide ? 40 : 24)}
            {dot(T.greenLight, "main", T.greenLight)}
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", marginTop: -14, paddingLeft: wide ? 46 : 37 }}>
            <span style={{ fontFamily: F.mono, fontSize: fs + 4, color: T.yellow, marginTop: 6 }}>╲</span>
            {seg(T.yellow, wide ? 40 : 24)}
            {dot(T.yellow, "dragon-slayer", T.yellow)}
            <span style={{ fontFamily: F.mono, fontSize: fs + 4, color: T.yellow, marginTop: 6, marginLeft: -6 }}>╱</span>
          </div>
        </div>
      </div>
      {out([{ t: "Merge made by the 'ort' strategy.", c: T.greenLight }, { t: " quests.txt | 2 +-" }, { t: " 1 file changed, 1 insertion(+), 1 deletion(-)" }, { t: "…or, when both sides edited the same lines:", c: T.muted }, { t: "CONFLICT (content): Merge conflict in quests.txt", c: T.red }])}
      <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.3 }}>The merge commit has <span style={{ color: T.heading }}>two parents</span>. Git combines the two sides itself unless they changed the same lines; then it stops and asks you (Fig 5).</span>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 4 · Two shapes of merge" title="Session 1.3 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 18 : 10, flex: 1, minHeight: 0 }}>
          {ff}
          {three}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Read the first line git prints. <span style={{ fontFamily: F.mono, color: T.greenLight }}>Fast-forward</span> means nothing was combined; <span style={{ fontFamily: F.mono, color: T.greenLight }}>Merge made</span> means a new save joined two timelines; <span style={{ fontFamily: F.mono, color: T.red }}>CONFLICT</span> means it needs you.
        </div>
      </div>
    </Frame>
  );
};
