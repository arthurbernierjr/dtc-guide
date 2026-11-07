import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #39 — a branch is a parallel timeline: the same folder shows different files depending on which label HEAD is standing on. */
export const BranchTimelines: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 22 : 17;

  const node = (h: string, color: string, label?: string, labelColor?: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: wide ? 110 : 92 }}>
      <div style={{ height: 22 }}>
        {label ? <span style={{ fontFamily: F.mono, fontSize: fs - 5, color: T.ink, background: labelColor || color, borderRadius: 6, padding: "1px 8px", fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span> : null}
      </div>
      <div style={{ width: wide ? 26 : 22, height: wide ? 26 : 22, borderRadius: "50%", background: color, border: `3px solid ${T.code}`, boxShadow: `0 0 0 2px ${color}` }} />
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.heading }}>{h}</span>
    </div>
  );
  const line = (w: number, color: string) => <div style={{ width: w, height: 3, background: color, marginTop: wide ? 34 : 32, flex: "0 0 auto" }} />;

  const timelines = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 6 : 4, padding: wide ? "14px 18px" : "10px 12px", background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>two timelines from one fork · git checkout -b side-quest</Label>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.green, width: wide ? 140 : 96, marginTop: wide ? 30 : 28 }}>main</span>
        {node("d1a2a91", T.green, "main")}
        <div style={{ width: wide ? 90 : 50, height: 0, borderTop: `3px dashed ${T.faint}`, marginTop: wide ? 34 : 32, flex: "0 0 auto" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: wide ? 110 : 92 }}>
          <div style={{ height: 22 }} />
          <div style={{ width: wide ? 26 : 22, height: wide ? 26 : 22, borderRadius: "50%", border: `2px dashed ${T.faint}` }} />
          <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, whiteSpace: "nowrap" }}>next save on main</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", marginTop: wide ? -8 : -6 }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.yellow, width: wide ? 140 : 96, marginTop: wide ? 30 : 28 }}>side-quest</span>
        <div style={{ minWidth: wide ? 110 : 92, display: "flex", justifyContent: "center" }}>
          <span style={{ fontFamily: F.mono, fontSize: fs + 6, color: T.yellow, marginTop: 8 }}>╲</span>
        </div>
        {line(wide ? 90 : 50, T.yellow)}
        {node("f7b168e", T.yellow, "HEAD → side-quest", T.yellow)}
        <div style={{ width: wide ? 90 : 50, height: 0, borderTop: `3px dashed ${T.faint}`, marginTop: wide ? 34 : 32, flex: "0 0 auto" }} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: wide ? 110 : 92 }}>
          <div style={{ height: 22 }} />
          <div style={{ width: wide ? 26 : 22, height: wide ? 26 : 22, borderRadius: "50%", border: `2px dashed ${T.faint}` }} />
          <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, whiteSpace: "nowrap" }}>next save here</span>
        </div>
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.3 }}>Both timelines share <span style={{ fontFamily: F.mono, color: T.heading }}>d1a2a91</span>. A new commit lands on whichever label HEAD is standing on; the other label does not move.</span>
    </div>
  );

  const view = (branch: string, color: string, ls: string, inv: string[], extra?: string) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6, padding: wide ? "12px 14px" : "10px 12px", background: T.code, border: `1.5px solid ${color}`, borderRadius: 12 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color }}>$ git checkout {branch}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.muted }}>Switched to branch &apos;{branch}&apos;</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.heading, marginTop: 4 }}>$ ls</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.soft, whiteSpace: "pre-wrap" }}>{ls}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.heading, marginTop: 4 }}>$ cat inventory.txt</span>
      {inv.map((l) => (
        <span key={l} style={{ fontFamily: F.mono, fontSize: fs - 3, color: l === "magic-staff" ? T.yellow : T.soft }}>{l}</span>
      ))}
      {extra ? <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, marginTop: "auto", lineHeight: 1.3 }}>{extra}</span> : null}
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 3 · One folder, two timelines" title="Session 1.3 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        {timelines}
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 18 : 10, flex: 1, minHeight: 0 }}>
          {view("side-quest", T.yellow, "inventory.txt  quests.txt  side-quest.txt", ["wooden-sword", "magic-staff"], "side-quest.txt exists. The staff is in the bag. This is the experiment.")}
          {view("main", T.green, "inventory.txt  quests.txt", ["wooden-sword"], "side-quest.txt is gone and the staff with it. Nothing was deleted: the folder is showing a different save.")}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, color: T.heading }}>checkout</span> rewrites the folder to match the branch. Run <span style={{ fontFamily: F.mono, color: T.heading }}>git branch</span> before you commit: the star says which timeline the save will land on.
        </div>
      </div>
    </Frame>
  );
};
