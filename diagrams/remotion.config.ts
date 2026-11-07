import { Config } from "@remotion/cli/config";

Config.setOverwriteOutput(true);
Config.setConcurrency(2);
// Reuse a Chrome Headless Shell already on this machine instead of downloading one at render time.
Config.setBrowserExecutable(
  process.env.REMOTION_BROWSER ||
    "/home/bigpoppacode/code/obelisk/remotion-viral-videos/node_modules/.remotion/chrome-headless-shell/linux64/chrome-headless-shell-linux64/chrome-headless-shell",
);
