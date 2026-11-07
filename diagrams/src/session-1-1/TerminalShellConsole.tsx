import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #27 — the terminal is the window, the shell is the interpreter inside it, and a command is a conversation. */
export const TerminalShellConsole: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 22 : 20;

  const windowBox = (
    <div style={{ display: "flex", flexDirection: "column", flex: wide ? "0 0 760px" : "0 0 auto", minWidth: 0, borderRadius: 16, border: `1.5px solid ${T.yellow}`, background: T.card, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: `1px solid ${T.border2}` }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: T.red }} /><span style={{ width: 12, height: 12, borderRadius: 6, background: T.yellow }} /><span style={{ width: 12, height: 12, borderRadius: 6, background: T.green }} />
        <Label size={fs - 4} color={T.yellow} style={{ marginLeft: 10, letterSpacing: ".16em", textTransform: "uppercase" }}>the terminal · the window you open</Label>
      </div>
      <div style={{ padding: wide ? "14px 18px 16px" : "10px 14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ borderRadius: 12, border: `1.5px solid ${T.green}`, padding: wide ? "12px 14px" : "10px 12px", background: T.code, display: "flex", flexDirection: "column", gap: 6 }}>
          <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>the shell · bash or zsh, the interpreter inside it</Label>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.heading }}><span style={{ color: T.greenLight }}>adventurer@newworld</span>:<span style={{ color: T.yellow }}>~</span>$ echo "Hello World"</span>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.soft }}>Hello World</span>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.heading }}><span style={{ color: T.greenLight }}>adventurer@newworld</span>:<span style={{ color: T.yellow }}>~</span>$ pwd</span>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.soft }}>/home/adventurer</span>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.heading }}><span style={{ color: T.greenLight }}>adventurer@newworld</span>:<span style={{ color: T.yellow }}>~</span>$ whoami</span>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.soft }}>adventurer</span>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.heading }}><span style={{ color: T.greenLight }}>adventurer@newworld</span>:<span style={{ color: T.yellow }}>~</span>$ ls</span>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.soft }}>Desktop  Documents  Downloads  projects</span>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.heading }}><span style={{ color: T.greenLight }}>adventurer@newworld</span>:<span style={{ color: T.yellow }}>~</span>$ <span style={{ background: T.green, color: T.ink }}>&nbsp;</span></span>
        </div>
        <span style={{ fontFamily: F.body, fontSize: fs - 1, color: T.muted, lineHeight: 1.3 }}>"Console" is just another word people use for the same experience. Do not overthink it. On a Mac the window is Terminal.app or iTerm2 and the shell is zsh; on Windows use Git Bash; on Linux the shell is usually bash. Same conversation.</span>
      </div>
    </div>
  );

  const steps = [
    { n: "1", t: "you type a line and press Enter", c: T.yellow },
    { n: "2", t: "the shell reads it: the first word is the command, the rest are options and arguments", c: T.green },
    { n: "3", t: "it finds the program (echo, pwd, ls…) and runs it with those arguments", c: T.green },
    { n: "4", t: "the program prints; the shell shows a new prompt and waits for you", c: T.heading },
  ];
  const convo = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 6, flex: 1, minWidth: 0 }}>
      <Label size={fs} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>a conversation, every time</Label>
      {steps.map((s) => (
        <div key={s.n} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 12, alignItems: "center", padding: wide ? "10px 12px" : "6px 10px", background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 12 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs, color: T.ink, background: s.c, borderRadius: 8, width: 36, height: 36, display: "grid", placeItems: "center", fontWeight: 600 }}>{s.n}</span>
          <span style={{ fontFamily: F.body, fontSize: fs - 1, color: T.heading, lineHeight: 1.25 }}>{s.t}</span>
        </div>
      ))}
      <div style={{ padding: wide ? "10px 12px" : "8px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 12, fontFamily: F.body, fontSize: fs - 2, color: T.muted, lineHeight: 1.3 }}>
        Why bother: it is <span style={{ color: T.heading }}>faster</span> than clicking once you know the words, some things can <span style={{ color: T.heading }}>only</span> be done here, you can <span style={{ color: T.heading }}>script</span> the boring parts, and <span style={{ color: T.heading }}>every server in the world</span> has no other interface.
      </div>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 1 · Terminal, shell, conversation" title="Session 1.1 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 24 : 12, flex: 1, minHeight: 0 }}>
          {windowBox}
          {convo}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 26 : 22, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          The terminal is not scary. <span style={{ color: T.heading }}>You type something, the computer responds.</span> The window is the terminal; the language it speaks is the shell; the cursor is waiting for you.
        </div>
      </div>
    </Frame>
  );
};
