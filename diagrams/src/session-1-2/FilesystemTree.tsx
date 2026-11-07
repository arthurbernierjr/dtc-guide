import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type N = { name: string; note?: string; kids?: N[]; hot?: "root" | "home" | "here" | "target" };
const TREE: N = {
  name: "/", note: "the root · everything starts here", hot: "root", kids: [
    { name: "bin", note: "programs: ls, cat, mkdir…" },
    { name: "etc", note: "system configuration" },
    { name: "home", note: "every user's home folder (/Users on a Mac)", kids: [
      { name: "adventurer", note: "your home · ~", hot: "home", kids: [
        { name: "Desktop", kids: [{ name: "navigation-practice", kids: [{ name: "dungeon", kids: [{ name: "floor-2", kids: [{ name: "boss-room", hot: "target" }] }] }] }] },
        { name: "Documents" },
        { name: "projects", hot: "here" },
      ] },
    ] },
    { name: "tmp", note: "scratch space, cleared on reboot" },
    { name: "usr", note: "more programs and libraries" },
    { name: "var", note: "logs and changing data" },
  ],
};

const HOT = { root: T.red, home: T.yellow, here: T.greenLight, target: T.green } as const;

/** §R10 #32 — the filesystem is one tree: root, home, and the same door reached by an absolute and a relative path. */
export const FilesystemTree: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 20 : 17;

  const lines: { depth: number; n: N; last: boolean[] }[] = [];
  const walk = (n: N, depth: number, lastPath: boolean[]) => {
    lines.push({ depth, n, last: lastPath });
    (n.kids || []).forEach((k, i, arr) => walk(k, depth + 1, [...lastPath, i === arr.length - 1]));
  };
  walk(TREE, 0, []);

  const tree = (
    <div style={{ display: "flex", flexDirection: "column", flex: wide ? "0 0 820px" : "0 0 auto", padding: wide ? "12px 18px" : "8px 12px", background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 6 }}>one tree · every file on the machine hangs from /</Label>
      {lines.map((l, i) => {
        let prefix = "";
        for (let d = 1; d < l.depth; d++) prefix += l.last[d - 1] ? "    " : "│   ";
        if (l.depth > 0) prefix += l.last[l.depth - 1] ? "└── " : "├── ";
        const c = l.n.hot ? HOT[l.n.hot] : T.heading;
        return (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 14, lineHeight: wide ? 1.4 : 1.3 }}>
            <span style={{ fontFamily: F.mono, fontSize: fs, whiteSpace: "pre", color: c, fontWeight: l.n.hot ? 700 : 400 }}><span style={{ color: T.faint, fontWeight: 400 }}>{prefix}</span>{l.n.name}{l.n.kids || l.n.name === "/" ? (l.n.name === "/" ? "" : "/") : ""}</span>
            {l.n.note ? <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted }}>{l.n.note}</span> : null}
          </div>
        );
      })}
    </div>
  );

  const paths = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 6, flex: 1, minWidth: 0 }}>
      <div style={{ padding: wide ? "12px 14px" : "8px 12px", background: T.code, border: `1.5px solid ${T.green}`, borderRadius: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>absolute · starts at / · works from anywhere</Label>
        <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.heading, wordBreak: "break-all" }}>cd <span style={{ color: T.red }}>/</span>home/<span style={{ color: T.yellow }}>adventurer</span>/Desktop/navigation-practice/dungeon/floor-2/<span style={{ color: T.green }}>boss-room</span></span>
        <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted }}>a full address, like GPS coordinates</span>
      </div>
      <div style={{ padding: wide ? "12px 14px" : "8px 12px", background: T.code, border: `1.5px solid ${T.greenLight}`, borderRadius: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        <Label size={fs - 4} color={T.greenLight} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>relative · starts where you are · from ~/projects</Label>
        <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.heading, wordBreak: "break-all" }}>cd <span style={{ color: T.greenLight }}>..</span>/Desktop/navigation-practice/dungeon/floor-2/<span style={{ color: T.green }}>boss-room</span></span>
        <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted }}>directions from here: up one, then down the branches. Same door.</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: wide ? "6px 14px" : "4px 10px", padding: wide ? "10px 14px" : "8px 12px", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12, alignItems: "baseline" }}>
        {[["/", "the root, the top of the tree"], ["~", "your home: /home/adventurer here, /Users/you on a Mac"], [".", "the folder you are in right now"], ["..", "the folder above it"], ["-", "wherever you were before the last cd"]].map(([k, v]) => (
          <React.Fragment key={k}>
            <span style={{ fontFamily: F.mono, fontSize: fs, color: T.yellow, fontWeight: 700 }}>{k}</span>
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft }}>{v}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 1 · The filesystem is a tree" title="Session 1.2 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 24 : 12, flex: 1, minHeight: 0 }}>
          {tree}
          {paths}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          <span style={{ color: T.heading }}>Absolute and relative paths reach the same place.</span> One starts from the root, the other from where you are standing. <span style={{ fontFamily: F.mono, color: T.heading }}>pwd</span> tells you where that is.
        </div>
      </div>
    </Frame>
  );
};
