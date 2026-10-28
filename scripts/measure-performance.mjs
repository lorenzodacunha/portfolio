// Measures the performance of the portfolio's live stores with Lighthouse (the engine of PageSpeed Insights),
// on mobile and desktop, and records the last run in src/data/performance.json. The case view shows it in its
// performance panel (recorded run, then the live PageSpeed Insights measurement in the browser).
//
// Usage: node scripts/measure-performance.mjs [<lighthouse folder>] [<work folder>]
//   The Lighthouse folder (the installed `lighthouse` package) comes from the first argument when two are given,
//   otherwise from LIGHTHOUSE_DIR. The work folder (default .lighthouse, ignored by git) keeps the raw JSON of
//   each run; running again only measures what failed or is missing. Delete it to measure everything again.
//   Example: LIGHTHOUSE_DIR=/path/to/node_modules/lighthouse npm run measure -- .lighthouse
//
// On Windows, Lighthouse exits with an error while deleting Chrome's temporary folder (EPERM) even when the run
// worked, so the result comes from the JSON written, not from the exit code. Stores that answer 402 (Shopify
// store unavailable) get no run and their case shows no performance panel.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const lhDir = args.length >= 2 ? args[0] : process.env.LIGHTHOUSE_DIR;
const workDir = resolve(root, (args.length >= 2 ? args[1] : args[0]) || '.lighthouse');
if (!lhDir || !existsSync(join(lhDir, 'cli', 'index.js'))) {
  console.error('usage: node scripts/measure-performance.mjs [<lighthouse folder>] [<work folder>]');
  console.error('the lighthouse folder (with cli/index.js) comes from the first of two arguments or from LIGHTHOUSE_DIR');
  process.exit(1);
}
mkdirSync(workDir, { recursive: true });

const KEYS = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'];
const projects = JSON.parse(readFileSync(join(root, 'src', 'data', 'projects.json'), 'utf8'));
const outFile = join(root, 'src', 'data', 'performance.json');
const out = existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')) : {};
const pause = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function read(raw) {
  const L = JSON.parse(readFileSync(raw, 'utf8'));
  if (L.runtimeError) return { error: L.runtimeError.code, status: (/status: (\d+)/i.exec(L.runtimeError.message) || [])[1] || '' };
  return {
    score: Math.round(L.categories.performance.score * 100),
    fetchTime: L.fetchTime,
    lighthouse: L.lighthouseVersion,
    metrics: Object.fromEntries(KEYS.map((k) => [k, { value: L.audits[k].displayValue, score: L.audits[k].score }])),
  };
}

for (const p of projects.filter((x) => x.url)) {
  for (const device of ['mobile', 'desktop']) {
    const raw = join(workDir, `raw-${p.id}-${device}.json`);
    let r = existsSync(raw) ? read(raw) : null;
    if (!r || (r.error && r.status !== '402')) {
      const cli = [
        join(lhDir, 'cli', 'index.js'), p.url, '--output=json', `--output-path=${raw}`, '--only-categories=performance', '--locale=pt-BR',
        '--quiet', '--max-wait-for-load=60000', '--chrome-flags=--headless=new --no-first-run --disable-extensions',
      ];
      if (device === 'desktop') cli.push('--preset=desktop');
      spawnSync(process.execPath, cli, { stdio: 'ignore', timeout: 180000 });
      pause(5000);
      r = existsSync(raw) ? read(raw) : { error: 'NO_OUTPUT' };
    }
    if (r.score != null) (out[p.id] ||= {})[device] = r;
    console.log(p.id, device, r.score != null ? r.score : `no run (${r.error}${r.status ? ' ' + r.status : ''})`);
  }
}
writeFileSync(outFile, JSON.stringify(out, null, 1) + '\n');
console.log('written to src/data/performance.json');
