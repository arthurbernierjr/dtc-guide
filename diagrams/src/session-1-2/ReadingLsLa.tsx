import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Col = { text: string; label: string; what: string; color: string };
const COLS: Col[] = [
  { text: "d", label: "type", what: "d directory · - file", color: T.yellow },
  { text: "rwxr-xr-x", label: "permissions", what: "owner · group · others (Fig 5)", color: T.green },
  { text: "5", label: "links", what: "ignore for now", color: T.faint },
  { text: "adventurer", label: "owner", what: "who made it", color: T.heading },
  { text: "staff", label: "group", what: "a team of users", color: T.heading },
  { text: "160", label: "size", what: "bytes · -h gives 4.0K", color: T.heading },
  { text: "Aug  9 10:30", label: "modified", what: "last change", color: T.heading },
  { text: "my-folder", label: "name", what: "", color: T.greenLight },
];

const ROWS = [
  "drwxr-xr-x  5 adventurer staff  160 Aug  9 10:30 .",
  "drwxr-xr-x  9 adventurer staff  288 Aug  9 09:12 ..",
  "-rw-r--r--  1 adventurer staff  132 Aug  9 09:12 .bashrc",
  "drwxr-xr-x  3 adventurer staff   96 Aug  9 10:25 enemies",
  "-rw-r--r--  1 adventurer staff   42 Aug  9 10:25 file.txt",
  "-rwxr-xr-x  1 adventurer staff   98 Aug  9 10:31 quest-start.sh",
];

/** §R10 #33 — one line of ls -la, every column named; hidden files and the flags that reshape the list. */
export const ReadingLsLa: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 21 : 17;

  const anatomy = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: wide ? "14px 18px" : "10px 12px", background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>one line of ls -la, read left to right</Label>
      <div style={{ display: "flex", gap: wide ? 18 : 8, alignItems: "flex-start", flexWrap: "wrap" }}>
        {COLS.map((c) => (
          <div key={c.label} style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
            <span style={{ fontFamily: F.mono, fontSize: wide ? 26 : 19, color: c.color, whiteSpace: "pre", fontWeight: 600 }}>{c.text}</span>
            <span style={{ fontFamily: F.mono, fontSize: fs - 8, color: c.color, letterSpacing: ".12em", textTransform: "uppercase" }}>{c.label}</span>
            {c.what ? <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, lineHeight: 1.2, maxWidth: wide ? 150 : 120 }}>{c.what}</span> : null}
          </div>
        ))}
      </div>
    </div>
  );

  const listing = (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: wide ? "12px 16px" : "8px 12px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 12, flex: wide ? "0 0 760px" : "0 0 auto", minWidth: 0 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading }}><span style={{ color: T.greenLight }}>adventurer@newworld</span>:<span style={{ color: T.yellow }}>~/filesystem-quest</span>$ ls -la</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.soft }}>total 24</span>
      {ROWS.map((r, i) => {
        const hidden = /\s\.[^\s/]*$/.test(r) || / \.$/.test(r) || / \.\.$/.test(r);
        const exec = r.startsWith("-rwx");
        const dir = r.startsWith("d");
        return <span key={i} style={{ fontFamily: F.mono, fontSize: fs - 2, whiteSpace: "pre", color: hidden ? T.muted : exec ? T.greenLight : dir ? T.heading : T.soft, lineHeight: 1.4 }}>{r}</span>;
      })}
      <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, marginTop: 6, lineHeight: 1.3 }}>Dim lines start with a dot: <span style={{ color: T.heading }}>hidden</span>, shown only by <span style={{ fontFamily: F.mono }}>-a</span>. Not secret, just tidy: <span style={{ fontFamily: F.mono }}>.bashrc</span>, <span style={{ fontFamily: F.mono }}>.gitignore</span> are configuration. Green has an <span style={{ fontFamily: F.mono }}>x</span>: it can be run.</span>
    </div>
  );

  const flags = (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: wide ? "6px 14px" : "4px 10px", padding: wide ? "12px 16px" : "8px 12px", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12, alignContent: "start", flex: 1, minWidth: 0 }}>
      <span style={{ gridColumn: "1 / -1", fontFamily: F.mono, fontSize: fs - 8, color: T.muted, letterSpacing: ".16em", textTransform: "uppercase", marginBottom: 2 }}>the flags · stack them: -la, -lh, -lt</span>
      {[["-l", "long format: the columns above"], ["-a", "all, including hidden dot-files"], ["-la", "both · the power move"], ["-lh", "human sizes: 4.0K, 1.2M"], ["-lt", "newest first"], ["-lS", "biggest first"], ["-R", "recurse into every subfolder"], ["-1", "one name per line"]].map(([k, v]) => (
        <React.Fragment key={k}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.yellow, fontWeight: 700 }}>{k}</span>
          <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.soft }}>{v}</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 2 · Reading ls -la" title="Session 1.2 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 8, height: "100%" }}>
        {anatomy}
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 18 : 8, flex: 1, minHeight: 0 }}>
          {listing}
          {flags}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, color: T.heading }}>ls -la</span> is the status screen: <span style={{ color: T.heading }}>what is here, who owns it, how big, how old, and whether it is a folder, a file, or something you can run.</span>
        </div>
      </div>
    </Frame>
  );
};
