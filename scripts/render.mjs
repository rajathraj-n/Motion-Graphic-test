#!/usr/bin/env node
// Shortcut for the three export formats.
//   npm run render:mp4 -- TitleCard
//   npm run render:mov -- OverlayBadge
//   npm run render:png -- LowerThird
// Extra args after the id are passed through (e.g. --frames=0-59).
import { spawnSync } from "node:child_process";

const [format, id, ...rest] = process.argv.slice(2);
if (!id) {
  console.error(`Usage: npm run render:${format ?? "<mp4|mov|png>"} -- <CompositionId> [extra flags]`);
  process.exit(1);
}

const presets = {
  mp4: [`out/${id}.mp4`, "--codec=h264", "--crf=18"],
  mov: [
    `out/${id}.mov`,
    "--codec=prores",
    "--prores-profile=4444",
    "--pixel-format=yuva444p10le",
    "--image-format=png",
  ],
  png: [
    `out/${id}`,
    "--sequence",
    "--image-format=png",
    "--image-sequence-pattern=frame-[frame].[ext]",
  ],
};

if (!presets[format]) {
  console.error(`Unknown format "${format}". Use mp4, mov or png.`);
  process.exit(1);
}

const result = spawnSync("npx", ["remotion", "render", id, ...presets[format], ...rest], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
