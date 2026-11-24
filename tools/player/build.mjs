// Builds a single self-contained HTML player of the video (no server needed).
// Usage: node tools/player/build.mjs [outFile]
import {build} from 'esbuild';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const out = resolve(process.argv[2] ?? resolve(root, 'out/player.html'));

const res = await build({
  entryPoints: [resolve(here, 'main.tsx')],
  bundle: true,
  minify: true,
  write: false,
  format: 'iife',
  target: 'es2020',
  define: {'process.env.NODE_ENV': '"production"'},
  alias: {'@remotion/fonts': resolve(here, 'stub-fonts.ts')},
  logLevel: 'warning',
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const font = readFileSync(resolve(root, 'public/fonts/Montserrat-latin-variable.woff2')).toString('base64');
const shell = readFileSync(resolve(here, 'shell.html'), 'utf8');
const html = shell
  .replace('/*FONT*/', `@font-face{font-family:'ITT Display';src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900;font-display:block}`)
  .replace('/*APP*/', () => js);
mkdirSync(dirname(out), {recursive: true});
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
