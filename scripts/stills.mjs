// Render review stills: node scripts/stills.mjs <outDir> <frame> [frame...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";

const [outDir, ...frames] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const chrome = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = existsSync(chrome) ? chrome : null;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: "BeyondPossibilities", inputProps: { music: false }, browserExecutable });
for (const fr of frames) {
  const output = path.join(outDir, `f${String(fr).padStart(4, "0")}.png`);
  await renderStill({ serveUrl, composition, frame: Number(fr), output, scale: 0.5, inputProps: { music: false }, browserExecutable, chromiumOptions: { gl: "angle" } });
  console.log(output);
}
