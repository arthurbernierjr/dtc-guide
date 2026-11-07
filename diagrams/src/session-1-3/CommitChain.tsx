import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const CHAIN = [
  { h: "34a7a55", msg: "Add .gitignore to exclude secrets, node_modules, and logs", refs: "HEAD -> main" },
  { h: "c076946", msg: "Add quest tracker" },
  { h: "df4829e", msg: "Add iron sword and leather armor to inventory" },
  { h: "74be12d", msg: "Initial commit: add README and inventory" },
];

/** §R10 #38 — what one commit holds and how commits chain: a snapshot of every file, plus a pointer to the parent; HEAD → main → newest. */
export const CommitChain: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 20 : 20;

  const row = (k: string, v: string, color: string = T.heading) => (
    <div style={{ display: "grid", gridTemplateColumns: wide ? "96px 1fr" : "84px 1fr", gap: 10, alignItems: "baseline" }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 5, color: T.muted, letterSpacing: ".1em", textTransform: "uppercase" }}>{k}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color, lineHeight: 1.3, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{v}</span>
    </div>
  );

  const opened = (
    <div style={{ flex: wide ? "0 0 600px" : "0 0 auto", display: "flex", flexDirection: "column", gap: wide ? 10 : 7, padding: wide ? "16px 18px" : "12px 14px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>one commit, opened · c076946</Label>
      {row("hash", "c0769461e5a3f1c0f7f2b1f0d1e2c3a4b5c6d7e8", T.greenLight)}
      {row("parent", "df4829e", T.yellow)}
      {row("author", "Arthur the Adventurer <arthur@newworld.dev>")}
      {row("date", "Tue Nov 3 2026")}
      {row("message", "Add quest tracker")}
      <div style={{ padding: wide ? "10px 12px" : "8px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10, display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 5, color: T.muted, letterSpacing: ".1em", textTransform: "uppercase" }}>snapshot · every tracked file, whole</span>
        {["README.md", "inventory.txt", "quests.txt  ← new in this save"].map((f) => (
          <span key={f} style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading }}>{f}</span>
        ))}
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.3 }}>The hash is computed from everything above. Change one byte of any file and the hash changes: a save point cannot be quietly edited.</span>
    </div>
  );

  const chain = (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>the chain · git log --oneline reads it top-down, newest first</Label>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.ink, background: T.yellow, borderRadius: 6, padding: "2px 10px", fontWeight: 700 }}>HEAD</span>
        <span style={{ fontFamily: F.mono, fontSize: fs, color: T.muted }}>→</span>
        <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.ink, background: T.green, borderRadius: 6, padding: "2px 10px", fontWeight: 700 }}>main</span>
        <span style={{ fontFamily: F.mono, fontSize: fs, color: T.muted }}>→</span>
        <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted }}>a branch is a label on one commit; HEAD is the label you are standing on</span>
      </div>
      {CHAIN.map((c, i) => (
        <div key={c.h} style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "center", padding: wide ? "9px 14px" : "10px 12px", background: T.code, border: `1px solid ${T.border2}`, borderLeft: `4px solid ${i === 0 ? T.green : T.border2}`, borderRadius: 10 }}>
            <span style={{ fontFamily: F.mono, fontSize: fs, color: T.yellow, fontWeight: 700 }}>{c.h}</span>
            <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.refs ? <span style={{ color: T.greenLight }}>({c.refs}) </span> : null}{c.msg}</span>
          </div>
          {i < CHAIN.length - 1 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 26, height: wide ? 30 : 34 }}>
              <span style={{ fontFamily: F.mono, fontSize: fs + 2, color: T.yellow, lineHeight: 1 }}>↓</span>
              <span style={{ fontFamily: F.mono, fontSize: fs - 6, color: T.muted }}>parent</span>
            </div>
          ) : null}
        </div>
      ))}
      <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, marginTop: 8, lineHeight: 1.3 }}>Arrows point backwards. A commit knows its parent, never its children, which is why the first commit is special: <span style={{ fontFamily: F.mono, color: T.heading }}>(root-commit)</span>, no parent at all.</span>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 2 · Snapshot plus parent" title="Session 1.3 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 24 : 12, flex: 1, minHeight: 0 }}>
          {opened}
          {chain}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Not a diff: a <span style={{ color: T.heading }}>whole picture</span> of the folder, named by its hash, holding its parent's hash. Follow the parents and you walk back through time.
        </div>
      </div>
    </Frame>
  );
};
