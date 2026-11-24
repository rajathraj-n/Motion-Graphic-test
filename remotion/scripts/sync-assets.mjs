#!/usr/bin/env node
/*
 * Copies the films' assets (fonts, logo, portraits) and any voiceover files
 * into remotion/public so Remotion can serve them. Runs automatically before
 * `npm run dev` and every render script.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const pub = path.resolve(here, '..', 'public');

const copies = [
  [path.join(root, 'intimetec', 'assets'), path.join(pub, 'intimetec', 'assets')],
  [path.join(root, 'assets'), path.join(pub, 'freedom', 'assets')],
  [path.join(root, 'intimetec', 'audio', 'voiceover'), path.join(pub, 'voiceover', 'intimetec')],
  [path.join(root, 'audio', 'voiceover'), path.join(pub, 'voiceover', 'freedom')],
];
for (const dir of ['intimetec', 'freedom', 'voiceover']) fs.rmSync(path.join(pub, dir), { recursive: true, force: true });
for (const [from, to] of copies) {
  if (!fs.existsSync(from)) continue;
  fs.cpSync(from, to, { recursive: true });
  console.log(`synced ${path.relative(root, from)} → ${path.relative(root, to)}`);
}
