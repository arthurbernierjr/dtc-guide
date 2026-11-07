// Mirrors the :root tokens in website/build/client/styles.css. Change there first, then here.
export const T = {
  bg: "#08080A",
  surface: "#111114",
  card: "#16161A",
  hover: "#1C1C22",
  code: "#0D0D10",
  border: "rgba(255,255,255,.06)",
  border2: "rgba(255,255,255,.12)",
  green: "#00A868",
  greenDeep: "#007838",
  greenLight: "#2FD48F",
  red: "#F03038",
  redDeep: "#B8161F",
  yellow: "#E8D800",
  yellowSoft: "#F5EC5A",
  text: "#EAE6E1",
  heading: "#F5F2EE",
  soft: "#C6BFC4",
  muted: "#8A8A94",
  faint: "#55555E",
  ink: "#07110C",
  struck: "rgba(198,191,196,.72)",
  rgb: { green: "0 168 104", red: "240 48 56", yellow: "232 216 0" },
} as const;

export const F = {
  display: "'Clash', ui-sans-serif, system-ui, sans-serif",
  body: "'DM', ui-sans-serif, system-ui, sans-serif",
  mono: "'JetBrainsMono', ui-monospace, Menlo, Consolas, monospace",
  story: "'Fraunces', Georgia, 'Times New Roman', serif",
} as const;

export type Layout = "wide" | "tall";
export const SIZE: Record<Layout, { width: number; height: number }> = {
  wide: { width: 1600, height: 900 },
  tall: { width: 900, height: 1200 },
};

export type ActColor = "green" | "yellow" | "red";
export const actColor = (c: ActColor) => T[c];
export const actRgb = (c: ActColor) => T.rgb[c];
