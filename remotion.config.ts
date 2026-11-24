import { Config } from "@remotion/cli/config";
import { existsSync } from "fs";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);
// Heavy backdrop-filter + 4K frames: keep concurrency modest so Chrome doesn't run out of memory.
Config.setConcurrency(2);
Config.setChromiumOpenGlRenderer("angle");

// Use a locally installed Chromium if one exists (e.g. CI / sandbox), otherwise Remotion downloads its own.
const localChrome = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (existsSync(localChrome)) {
  Config.setBrowserExecutable(localChrome);
}
