import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #46 — the dotfiles repository that closes Unit 1: what each file carries, and the three commands that rebuild your environment on a new machine. */
export const DotfilesAnatomy: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 22 : 18;

  const files: { name: string; from: string; what: string; color: string; sample: string }[] = [
    { name: ".zshrc", from: "Session 1.2", what: "aliases, a welcome line, mkdir -p ~/projects", color: T.green, sample: 'alias gs="git status"' },
    { name: "vscode/settings.json", from: "Session 1.1", what: "font size, tab size, format on save, autosave", color: T.yellow, sample: '"editor.formatOnSave": true' },
    { name: "vscode/extensions.txt", from: "Session 1.1", what: "one extension id per line; a shopping list", color: T.yellow, sample: "esbenp.prettier-vscode" },
    { name: "setup.sh", from: "Session 1.2", what: "copies the configs into place; chmod +x", color: T.green, sample: "cp .zshrc ~/.zshrc" },
    { name: "README.md", from: "this session", what: "what it is, how to install it, in Markdown", color: T.soft, sample: "## Quick start" },
    { name: ".gitignore", from: "Session 1.3", what: "keep .DS_Store, *.log and .env out of history", color: T.soft, sample: ".env" },
  ];

  const row = (f: typeof files[number]) => (
    <div key={f.name} style={{ display: "grid", gridTemplateColumns: wide ? "260px 120px 1fr 260px" : "1fr", gap: wide ? 12 : 2, alignItems: "center", padding: wide ? "11px 14px" : "8px 12px", background: T.code, border: `1px solid ${T.border2}`, borderLeft: `3px solid ${f.color}`, borderRadius: 10 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading }}>{f.name}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 6, color: f.color, letterSpacing: ".08em", textTransform: "uppercase" }}>{f.from}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.soft, lineHeight: 1.25 }}>{f.what}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 5, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.sample}</span>
    </div>
  );

  const step = (cmd: string, what: string, color: string) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4, padding: wide ? "14px 16px" : "12px 12px", background: T.card, border: `1.5px solid ${color}`, borderRadius: 12 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color, fontWeight: 700, lineHeight: 1.25, overflowWrap: "anywhere" }}>{cmd}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, lineHeight: 1.25 }}>{what}</span>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 5 · The dotfiles repo" title="Session 1.4 · The quest">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: wide ? 6 : 5, padding: wide ? "12px 16px" : "10px 12px", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 14, flexShrink: 0 }}>
          <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>github.com/adventurer-dev/dotfiles · every file is a Unit 1 session, kept</Label>
          {files.map(row)}
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: wide ? 8 : 6 }}>
          <Label size={fs - 4} color={T.yellow} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>a new machine, ten minutes</Label>
          <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 8 : 6, alignItems: "stretch" }}>
            {step("git clone git@github.com:adventurer-dev/dotfiles.git ~/dotfiles", "the SSH key from Fig 2 is the only thing you set up by hand", T.yellow)}
            <span style={{ color: T.muted, fontSize: fs, alignSelf: "center", flexShrink: 0 }}>{wide ? "▶" : "▼"}</span>
            {step("cd ~/dotfiles && ./setup.sh", "configs copied into place; backups of anything it replaces", T.green)}
            <span style={{ color: T.muted, fontSize: fs, alignSelf: "center", flexShrink: 0 }}>{wide ? "▶" : "▼"}</span>
            {step("source ~/.zshrc", "“Welcome back, adventurer.” Aliases live; the machine is yours", T.green)}
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 24 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Your environment stops being a thing that happened to one laptop and becomes <span style={{ color: T.heading }}>a repository with a history</span>. Every tweak from here on is a commit.
        </div>
      </div>
    </Frame>
  );
};
