import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Node = { name: string; dir?: boolean; kids?: Node[] };
const TREE: Node = {
  name: "isekai-camp/", dir: true, kids: [
    { name: "inventory/", dir: true, kids: [
      { name: "weapons/", dir: true, kids: [{ name: "wooden-sword.txt" }] },
      { name: "armor/", dir: true, kids: [{ name: "cloth-shirt.txt" }] },
      { name: "potions/", dir: true, kids: [{ name: "health-potion.txt" }] },
    ] },
    { name: "quests/", dir: true, kids: [
      { name: "main-story/", dir: true, kids: [{ name: "learn-the-terminal.txt" }] },
      { name: "side-quests/", dir: true },
    ] },
    { name: "journal/", dir: true, kids: [{ name: "day-01.txt" }] },
  ],
};

const CMDS = [
  { c: "mkdir -p isekai-camp/inventory/weapons", n: "-p builds the whole chain, from home" },
  { c: "mkdir -p isekai-camp/inventory/armor isekai-camp/inventory/potions", n: "two arguments, two folders" },
  { c: "mkdir -p isekai-camp/quests/main-story isekai-camp/quests/side-quests", n: "" },
  { c: "mkdir isekai-camp/journal", n: "parent exists: plain mkdir is fine" },
  { c: "touch isekai-camp/inventory/weapons/wooden-sword.txt", n: "empty file, named · the other four the same way" },
  { c: 'echo "Day 1: I woke up in a terminal." > isekai-camp/journal/day-01.txt', n: "> writes the file" },
  { c: 'echo "I learned echo, pwd, mkdir, touch." >> isekai-camp/journal/day-01.txt', n: ">> adds a line" },
];

/** §R10 #29 — the Adventurer's Camp: the commands on the left build the tree on the right. */
export const CampTree: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 20 : 16;

  const lines: { depth: number; name: string; dir: boolean; last: boolean[] }[] = [];
  const walk = (n: Node, depth: number, lastPath: boolean[]) => {
    lines.push({ depth, name: n.name, dir: !!n.dir, last: lastPath });
    (n.kids || []).forEach((k, i, arr) => walk(k, depth + 1, [...lastPath, i === arr.length - 1]));
  };
  walk(TREE, 0, []);

  const tree = (
    <div style={{ display: "flex", flexDirection: "column", flex: wide ? "0 0 540px" : "0 0 auto", padding: wide ? "12px 18px" : "8px 12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14 }}>
      <Label size={fs - 3} color={T.green} style={{ letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 8 }}>what ends up on disk · tree isekai-camp</Label>
      {lines.map((l, i) => {
        let prefix = "";
        for (let d = 1; d < l.depth; d++) prefix += l.last[d - 1] ? "    " : "│   ";
        if (l.depth > 0) prefix += l.last[l.depth - 1] ? "└── " : "├── ";
        return (
          <span key={i} style={{ fontFamily: F.mono, fontSize: fs, lineHeight: wide ? 1.45 : 1.3, whiteSpace: "pre", color: l.dir ? T.heading : T.soft }}>
            <span style={{ color: T.faint }}>{prefix}</span>{l.name}
          </span>
        );
      })}
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.muted, marginTop: 8 }}>8 directories, 5 files</span>
    </div>
  );

  const cmds = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 6 : 4, flex: wide ? 1 : "0 0 auto", minWidth: 0 }}>
      <Label size={fs - 3} color={T.yellow} style={{ letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 2 }}>what you type · in order</Label>
      {CMDS.map((c, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 1, padding: wide ? "6px 12px" : "4px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.heading, whiteSpace: "pre-wrap", wordBreak: "break-all", lineHeight: 1.3 }}><span style={{ color: T.greenLight }}>$</span> {c.c}</span>
          {c.n ? <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted }}>{c.n}</span> : null}
        </div>
      ))}
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 3 · Commands become a tree" title="Session 1.1 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 24 : 12, flex: 1, minHeight: 0 }}>
          {cmds}
          {tree}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Folders are made with <span style={{ fontFamily: F.mono, color: T.heading }}>mkdir</span>, files with <span style={{ fontFamily: F.mono, color: T.heading }}>touch</span>, and the slashes in a path are the branches of the tree. <span style={{ color: T.heading }}>Check with <span style={{ fontFamily: F.mono }}>ls</span> after every step.</span>
        </div>
      </div>
    </Frame>
  );
};
