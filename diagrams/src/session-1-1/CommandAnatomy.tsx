import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Ex = { parts: { text: string; role: "cmd" | "opt" | "arg" | "op" }[]; note: string };

const ROLE = { cmd: T.yellow, opt: T.green, arg: T.heading, op: T.red } as const;
const ROLE_NAME = { cmd: "command", opt: "option", arg: "argument", op: "redirect" } as const;

const SLOTS = [
  { role: "cmd", slot: "command", what: "what to do · one word, first" },
  { role: "opt", slot: "[options]", what: "how to do it · start with - or --" },
  { role: "arg", slot: "[arguments]", what: "what to do it to · files, folders, text" },
] as const;

const EXAMPLES: Ex[] = [
  { parts: [{ text: "ls", role: "cmd" }, { text: "-la", role: "opt" }, { text: "my-website", role: "arg" }], note: "list, long format + hidden files, of that folder" },
  { parts: [{ text: "mkdir", role: "cmd" }, { text: "-p", role: "opt" }, { text: "projects/isekai/unit-01", role: "arg" }], note: "make the folder, and every parent it needs" },
  { parts: [{ text: "echo", role: "cmd" }, { text: '"# My Website"', role: "arg" }, { text: ">", role: "op" }, { text: "README.md", role: "arg" }], note: "print the text… into a file instead of the screen" },
  { parts: [{ text: "touch", role: "cmd" }, { text: "index.html", role: "arg" }, { text: "style.css", role: "arg" }, { text: "app.js", role: "arg" }], note: "three arguments, three empty files" },
];

/** §R10 #28 — command [options] [arguments]: four real lines coloured by role. */
export const CommandAnatomy: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 24 : 20;

  const template = (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: wide ? "16px 20px" : "12px 14px", background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>the shape of every line</Label>
      <div style={{ display: "flex", gap: wide ? 22 : 12, alignItems: "baseline", flexWrap: "wrap" }}>
        {SLOTS.map((s) => (
          <div key={s.role} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: F.mono, fontSize: wide ? 34 : 26, color: ROLE[s.role], fontWeight: 600 }}>{s.slot}</span>
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted }}>{s.what}</span>
          </div>
        ))}
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.3 }}>Square brackets mean optional. Spaces separate the pieces, which is why a name with a space in it becomes two arguments.</span>
    </div>
  );

  const rows = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 6, flex: 1, minHeight: 0, justifyContent: "space-evenly" }}>
      {EXAMPLES.map((ex, i) => (
        <div key={i} style={{ display: "flex", flexDirection: wide ? "row" : "column", alignItems: wide ? "center" : "flex-start", gap: wide ? 18 : 4, padding: wide ? "10px 16px" : "8px 12px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 12 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap", flex: wide ? "0 0 760px" : undefined }}>
            {ex.parts.map((p, j) => (
              <div key={j} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontFamily: F.mono, fontSize: fs, color: ROLE[p.role], whiteSpace: "nowrap" }}>{p.text}</span>
                <span style={{ fontFamily: F.mono, fontSize: fs - 10, color: T.faint, letterSpacing: ".12em", textTransform: "uppercase" }}>{ROLE_NAME[p.role]}</span>
              </div>
            ))}
          </div>
          <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.25 }}>{ex.note}</span>
        </div>
      ))}
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 2 · The anatomy of a command" title="Session 1.1 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        {template}
        {rows}
        <div style={{ fontFamily: F.body, fontSize: wide ? 26 : 22, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Read any line left to right: <span style={{ color: T.yellow }}>what</span>, <span style={{ color: T.greenLight }}>how</span>, <span style={{ color: T.heading }}>to what</span>. When a command confuses you, <span style={{ fontFamily: F.mono, color: T.heading }}>man ls</span> or <span style={{ fontFamily: F.mono, color: T.heading }}>ls --help</span> explains the options.
        </div>
      </div>
    </Frame>
  );
};
