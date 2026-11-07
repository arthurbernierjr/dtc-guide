import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Place = { name: string; sub: string; color: string; files: { n: string; state: string }[]; status: string[] };
const PLACES: Place[] = [
  {
    name: "working directory",
    sub: "the field · your folder as it is right now",
    color: T.red,
    files: [{ n: "inventory.txt", state: "modified" }, { n: "secrets.txt", state: "untracked" }, { n: "README.md", state: "unchanged · silent" }],
    status: ["Changes not staged for commit:", "\tmodified:   inventory.txt", "Untracked files:", "\tsecrets.txt"],
  },
  {
    name: "staging area",
    sub: "the waiting room · what the next save will contain",
    color: T.yellow,
    files: [{ n: "inventory.txt", state: "staged" }],
    status: ["Changes to be committed:", "\tmodified:   inventory.txt"],
  },
  {
    name: "repository",
    sub: ".git · every save point ever made",
    color: T.green,
    files: [{ n: "c076946  Add quest tracker", state: "committed" }, { n: "df4829e  Add iron sword…", state: "committed" }, { n: "74be12d  Initial commit", state: "committed" }],
    status: ["nothing to commit,", "working tree clean"],
  },
];

/** §R10 #37 — the three states of a file: modified in the folder, staged in the waiting room, committed in .git; add and commit are the two doors. */
export const ThreeStates: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 21 : 19;

  const place = (p: Place) => (
    <div key={p.name} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: wide ? 8 : 6, padding: wide ? "14px 16px" : "10px 12px", background: T.card, border: `1.5px solid ${p.color}`, borderRadius: 14 }}>
      <span style={{ fontFamily: F.display, fontSize: fs + 7, color: T.heading, lineHeight: 1.05 }}>{p.name}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.25 }}>{p.sub}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
        {p.files.map((f) => (
          <div key={f.n} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "5px 10px", background: T.code, border: `1px solid ${T.border2}`, borderLeft: `4px solid ${p.color}`, borderRadius: 8 }}>
            <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.heading, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.n}</span>
            <span style={{ fontFamily: F.mono, fontSize: fs - 5, color: f.state.startsWith("unchanged") ? T.muted : p.color, whiteSpace: "nowrap" }}>{f.state}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "auto", padding: "8px 10px", background: T.code, borderRadius: 8, border: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 6, color: T.muted, letterSpacing: ".12em", textTransform: "uppercase" }}>git status says</span>
        {p.status.map((l, i) => (
          <div key={i} style={{ fontFamily: F.mono, fontSize: fs - 4, color: l.startsWith("\t") ? p.color : T.soft, whiteSpace: "pre", lineHeight: 1.3 }}>{l.replace("\t", "   ")}</div>
        ))}
      </div>
    </div>
  );

  const door = (cmd: string, color: string, back: string) => (
    <div style={{ display: "flex", flexDirection: wide ? "column" : "row", alignItems: "center", justifyContent: "center", gap: 6, flex: wide ? "0 0 190px" : "0 0 auto", padding: wide ? "0 8px" : "2px 0", textAlign: "center" }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color, fontWeight: 700, whiteSpace: "nowrap" }}>{cmd}</span>
      <span style={{ fontFamily: F.mono, fontSize: wide ? 34 : 26, color, lineHeight: 1 }}>{wide ? "→" : "↓"}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 7, color: T.muted, whiteSpace: wide ? "normal" : "nowrap", lineHeight: 1.3 }}>{back}</span>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 1 · Three states, two doors" title="Session 1.3 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 0 : 6, flex: 1, minHeight: 0, alignItems: "stretch" }}>
          {place(PLACES[0])}
          {door("git add", T.yellow, "back: git restore --staged")}
          {place(PLACES[1])}
          {door('git commit -m "…"', T.green, "back: git reset --soft HEAD~1")}
          {place(PLACES[2])}
        </div>
        <div style={{ display: "flex", gap: wide ? 18 : 10, flexWrap: "wrap", alignItems: "center" }}>
          {[["modified", T.red, "you changed it; Git has not been told"], ["staged", T.yellow, "you said: include this in the next save"], ["committed", T.green, "saved, hashed, safe; it can always be found again"]].map(([k, c, d]) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: F.body, fontSize: fs - 3, color: T.muted }}><span style={{ width: 12, height: 12, borderRadius: 3, background: c }} /><span style={{ color: T.heading, fontFamily: F.mono }}>{k}</span> {d}</span>
          ))}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Nothing is saved until it has walked through <span style={{ fontFamily: F.mono, color: T.yellow }}>add</span> and <span style={{ fontFamily: F.mono, color: T.green }}>commit</span>. <span style={{ fontFamily: F.mono, color: T.heading }}>git status</span> tells you which room every file is standing in.
        </div>
      </div>
    </Frame>
  );
};
