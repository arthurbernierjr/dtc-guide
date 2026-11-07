import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type L = { t: string; kind: "marker-ours" | "ours" | "divider" | "theirs" | "marker-theirs" };
const FILE: L[] = [
  { t: "<<<<<<< HEAD", kind: "marker-ours" },
  { t: "Quest 1: Learn Git (COMPLETE)", kind: "ours" },
  { t: "Status: Done!", kind: "ours" },
  { t: "=======", kind: "divider" },
  { t: "Quest 1: Slay the Dragon", kind: "theirs" },
  { t: "Status: Ready", kind: "theirs" },
  { t: ">>>>>>> dragon-slayer", kind: "marker-theirs" },
];
const COLOR: Record<L["kind"], string> = { "marker-ours": T.green, ours: T.greenLight, divider: T.muted, theirs: T.yellowSoft, "marker-theirs": T.yellow };
const NOTE: Partial<Record<L["kind"], string>> = { "marker-ours": "from here: yours (the branch you are on)", divider: "the fence", "marker-theirs": "up to here: theirs (the branch coming in)" };

/** §R10 #41 — the conflict markers read as three regions, and the three moves that end a conflict: edit, add, commit (or abort). */
export const ConflictMarkers: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 21 : 17;

  const file = (
    <div style={{ flex: wide ? "0 0 760px" : "0 0 auto", display: "flex", flexDirection: "column", gap: 6, padding: wide ? "14px 16px" : "10px 12px", background: T.card, border: `1.5px solid ${T.red}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>cat quests.txt · after CONFLICT (content)</Label>
      {FILE.map((l, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: wide ? "330px 1fr" : "1fr", gap: wide ? 14 : 0, alignItems: "center", padding: "4px 10px", background: T.code, border: `1px solid ${T.border}`, borderLeft: `4px solid ${COLOR[l.kind]}`, borderRadius: 8 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: COLOR[l.kind], whiteSpace: "pre", fontWeight: l.kind.startsWith("marker") || l.kind === "divider" ? 700 : 400 }}>{l.t}</span>
          {NOTE[l.kind] ? <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.25 }}>{NOTE[l.kind]}</span> : null}
        </div>
      ))}
      <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.3, marginTop: 4 }}>Nothing is broken. Git wrote both versions into the file and drew fences around them so you can choose. <span style={{ fontFamily: F.mono, color: T.heading }}>git status</span> lists it under <span style={{ fontFamily: F.mono, color: T.red }}>both modified</span>.</span>
    </div>
  );

  const step = (n: string, title: string, body: React.ReactNode, color: string) => (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "start", padding: wide ? "10px 14px" : "8px 10px", background: T.code, border: `1px solid ${T.border2}`, borderLeft: `4px solid ${color}`, borderRadius: 10 }}>
      <span style={{ fontFamily: F.display, fontSize: fs + 10, color, lineHeight: 1 }}>{n}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontFamily: F.body, fontSize: fs - 1, color: T.heading, fontWeight: 600 }}>{title}</span>
        <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.soft, whiteSpace: "pre-wrap", lineHeight: 1.35 }}>{body}</span>
      </div>
    </div>
  );

  const resolve = (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: wide ? 8 : 6 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>three moves end every conflict</Label>
      {step("1", "Edit until only the file you want remains", "Quest 1: Learn Git (COMPLETE)\nQuest 2: Slay the Dragon\nStatus: In Progress\n\nno <<<<<<<, no =======, no >>>>>>>", T.green)}
      {step("2", "Tell git the fight is over", "git add quests.txt", T.yellow)}
      {step("3", "Save the merge", 'git commit -m "Merge dragon-slayer: …"', T.greenLight)}
      <div style={{ padding: wide ? "8px 14px" : "6px 10px", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 10, display: "flex", gap: 10, alignItems: "baseline" }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.red, whiteSpace: "nowrap" }}>git merge --abort</span>
        <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.3 }}>the escape hatch: back to the moment before the merge, nothing lost</span>
      </div>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 5 · Reading a conflict" title="Session 1.3 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 24 : 12, flex: 1, minHeight: 0 }}>
          {file}
          {resolve}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          A conflict is a question, not an error: <span style={{ color: T.heading }}>two timelines changed the same lines, which do you want?</span> You answer by editing the file.
        </div>
      </div>
    </Frame>
  );
};
