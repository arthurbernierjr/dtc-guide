import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #42 — the whole repository lives on your machine; GitHub holds a second, named copy (origin). Three verbs move commits between them: clone, push, pull. */
export const LocalAndRemote: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 23 : 18;

  const box = (title: string, color: string, rows: { k: string; v: string }[], foot: string) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: wide ? 10 : 8, padding: wide ? "14px 18px" : "12px 14px", background: T.card, border: `1.5px solid ${color}`, borderRadius: 16 }}>
      <Label size={fs - 3} color={color} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>{title}</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 8 : 6 }}>
        {rows.map((r) => (
          <div key={r.k} style={{ display: "flex", flexDirection: "column", gap: 2, padding: wide ? "8px 12px" : "6px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10 }}>
            <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.heading }}>{r.k}</span>
            <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.3 }}>{r.v}</span>
          </div>
        ))}
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft, lineHeight: 1.3, marginTop: "auto" }}>{foot}</span>
    </div>
  );

  const arrow = (label: string, cmd: string, color: string, dir: "right" | "left") => wide ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color, fontWeight: 700, whiteSpace: "nowrap" }}>{cmd}</span>
      <div style={{ display: "flex", alignItems: "center", width: 150 }}>
        {dir === "left" ? <span style={{ color, fontSize: fs + 4, lineHeight: 1 }}>◀</span> : null}
        <div style={{ flex: 1, height: 3, background: color }} />
        {dir === "right" ? <span style={{ color, fontSize: fs + 4, lineHeight: 1 }}>▶</span> : null}
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, whiteSpace: "nowrap" }}>{label}</span>
    </div>
  ) : (
    <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "0 18px" }}>
      <span style={{ color, fontSize: fs + 2, lineHeight: 1, width: 24, textAlign: "center" }}>{dir === "right" ? "▼" : "▲"}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color, fontWeight: 700, whiteSpace: "nowrap", width: 120 }}>{cmd}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted }}>{label}</span>
    </div>
  );

  const middle = (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: wide ? 22 : 8, flex: "0 0 auto", padding: wide ? "0 6px" : "6px 0" }}>
      {arrow("your commits go up", "git push", T.green, "right")}
      {arrow("their commits come down", "git pull", T.yellow, "left")}
      {arrow("the first copy, once", "git clone", T.soft, "left")}
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 1 · Local and remote" title="Session 1.4 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 10 : 8, flex: 1, minHeight: 0, alignItems: "stretch" }}>
          {box("your machine · local", T.green, [
            { k: "~/git-quest/", v: "working directory: the files you edit" },
            { k: "~/git-quest/.git/", v: "the full history: every commit, every branch, offline" },
            { k: "main", v: "your branch label, moves on every commit" },
          ], "Everything Session 1.3 taught lives here. Git works with no network at all.")}
          {middle}
          {box("github.com · remote named origin", T.yellow, [
            { k: "adventurer-dev/git-quest", v: "the same repository, hosted; a web page plus a .git" },
            { k: "origin/main", v: "the remote's main as of your last push or fetch" },
            { k: "git@github.com:adventurer-dev/git-quest.git", v: "the address; a remote is a name for a URL" },
          ], "Not a backup service. A second full copy that other people (and your other machines) can reach.")}
        </div>
        <div style={{ padding: wide ? "10px 14px" : "8px 12px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.soft, whiteSpace: "pre", lineHeight: 1.35 }}>{"$ git remote -v\norigin  git@github.com:adventurer-dev/git-quest.git (fetch)\norigin  git@github.com:adventurer-dev/git-quest.git (push)"}</span>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Git is the tool; GitHub is one place to put a copy. <span style={{ color: T.heading }}>Commits are made locally and sent later.</span> Nothing you commit reaches GitHub until you push.
        </div>
      </div>
    </Frame>
  );
};
