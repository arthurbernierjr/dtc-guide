import { continueRender, delayRender, staticFile } from "remotion";

let loaded: Promise<void> | null = null;

/** Loads the site's own font files so the stills match the HTML exactly (§R1). */
export const loadFonts = (): Promise<void> => {
  if (loaded) return loaded;
  const handle = delayRender("Loading guide fonts");
  const faces = [
    new FontFace("Clash", `url(${staticFile("fonts/clash-500.woff2")})`, { weight: "500" }),
    new FontFace("Clash", `url(${staticFile("fonts/clash-600.woff2")})`, { weight: "600" }),
    new FontFace("Clash", `url(${staticFile("fonts/clash-700.woff2")})`, { weight: "700" }),
    new FontFace("DM", `url(${staticFile("fonts/dm-sans.ttf")})`, { weight: "300 700" }),
    new FontFace("DM", `url(${staticFile("fonts/dm-sans-italic.woff2")})`, { weight: "300 400", style: "italic" }),
    new FontFace("JetBrainsMono", `url(${staticFile("fonts/jetbrains-mono-400.ttf")})`, { weight: "400" }),
    new FontFace("Fraunces", `url(${staticFile("fonts/fraunces-italic.woff2")})`, { weight: "100 900", style: "italic" }),
  ];
  loaded = Promise.all(faces.map((f) => f.load()))
    .then((fs) => {
      fs.forEach((f) => document.fonts.add(f));
    })
    .catch((e) => {
      console.error("font load failed", e);
    })
    .finally(() => continueRender(handle));
  return loaded;
};
