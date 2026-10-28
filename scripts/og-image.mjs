// Generates the home share images (Open Graph and Twitter card), one per language, 1200 by 630: public/og/home.jpg
// (português), home-en.jpg and home-es.jpg.
// The image is the site hero in 1200 by 630 (Lorenzo, 28/10: the share card in the colors of the site): white page, the
// grey lettering behind, the kicker with the red-orange Shopify mark, the name mark SVG, the hero line, the address in
// the orange button and the thin brand shapes, with the cutout photo on the right. Texts and lettering come from the
// hero of each language (src/i18n/<locale>/top.ts, ghostPairs in src/data/home.json). Widescreen Mixed from the Adobe
// Fonts kit and Poppins from Google Fonts. Rendered by a headless Chrome and saved as JPEG.
//
// Usage (from the site folder):
//   node scripts/og-image.mjs                          renders with dev-browser connected to a running Chrome
//   node scripts/og-image.mjs --connect http://127.0.0.1:9222 --browser lorenzo
//   node scripts/og-image.mjs --chrome "C:/Program Files/Google/Chrome/Application/chrome.exe"
//                                                      renders with Chrome alone (PNG, then saved as home*.png)
//   node scripts/og-image.mjs --html-only              only writes the HTML templates, to open in a browser
//
// After changing the images, raise the ?v= of HOME_OG in src/lib/seo.ts so share previews fetch them again.
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const argv = process.argv.slice(2);
const option = (name, fallback) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};
const CONNECT = option('--connect', process.env.DEV_BROWSER_CONNECT || 'http://127.0.0.1:9341');
const BROWSER = option('--browser', 'lorenzo');
const CHROME = option('--chrome', '');
const HTML_ONLY = argv.includes('--html-only');

const WIDTH = 1200;
const HEIGHT = 630;

const dataUri = (file, type) => `data:${type};base64,${readFileSync(join(root, file)).toString('base64')}`;
const photo = dataUri('public/assets/brand/recorte.webp', 'image/webp');
const shape = (name) => dataUri(`public/assets/shapes/${name}.svg`, 'image/svg+xml');
// The name is the brand name mark, as in the hero (paints with currentColor).
const nameMark = readFileSync(join(root, 'src/assets/brand/logo-name.svg'), 'utf8').replace(/<!--[\s\S]*?-->\s*/, '');

// Copy of each image: the site hero in that language, word for word; no claims beyond it.
const home = JSON.parse(readFileSync(join(root, 'src/data/home.json'), 'utf8'));
const heroText = (locale, key) => {
  const source = readFileSync(join(root, `src/i18n/${locale}/top.ts`), 'utf8');
  const match = new RegExp(`\\n    ${key}: '([^']*)'`).exec(source);
  if (!match) throw new Error(`${key} not found in src/i18n/${locale}/top.ts`);
  return match[1];
};
const LOCALES = [
  { locale: 'pt-br', lang: 'pt-BR', file: 'home', pairs: home.ghostPairs },
  { locale: 'en', lang: 'en', file: 'home-en', pairs: home.ghostPairs_en },
  { locale: 'es', lang: 'es', file: 'home-es', pairs: home.ghostPairs_es },
].map((item) => ({
  ...item,
  label: heroText(item.locale, 'kicker').replace('{mark}', `<span class="mark">${heroText(item.locale, 'kickerMark')}</span>`),
  line: heroText(item.locale, 'lede'),
  ghost: [...item.pairs, item.pairs[0]].map((pair) => `<span>${pair.join(' ')}</span>`).join(''),
}));

const page = ({ lang, label, line, ghost }) => `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<title>OG home</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700&family=Syncopate:wght@400;700&display=block" rel="stylesheet">
<link href="https://use.typekit.net/rck3lnu.css" rel="stylesheet">
<style>
  :root { --orange: #FF9D2E; --red-orange: #FF692E; --dark: #333333; --light: #FFFFFF; }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body { position: relative; background: var(--light); color: var(--dark); font-family: "Poppins", sans-serif; }

  /* Lettering behind, as in the site hero: rows of the same words, alternately offset, in a very light grey */
  .ghost { position: absolute; inset: -30px 0 0 0; display: flex; flex-direction: column; pointer-events: none; }
  .ghost span { display: block; font-family: "widescreen-mixed", "Syncopate", sans-serif; font-weight: 700; font-size: 128px; line-height: 1; text-transform: uppercase; white-space: nowrap; color: rgba(51, 51, 51, .25); opacity: .15; }
  .ghost span:nth-child(odd) { margin-left: -60px; }
  .ghost span:nth-child(even) { margin-left: 300px; }

  /* Thin brand shapes of the hero */
  .shape { position: absolute; height: auto; }

  .photo { position: absolute; right: 30px; top: 46px; width: 440px; height: auto; }

  .copy { position: absolute; left: 72px; top: 0; bottom: 0; width: 640px; display: flex; flex-direction: column; justify-content: center; gap: 22px; }
  .label { margin: 0; font-size: 30px; font-weight: 300; }
  .mark { padding: 0 .25em; border-radius: 8px; background: var(--red-orange); color: var(--light); font-weight: 400; }
  .name { margin: 0; color: var(--dark); }
  .name svg { display: block; width: 540px; height: auto; }
  .line { margin: 0; max-width: 37ch; font-size: 25px; font-weight: 300; line-height: 1.45; }
  .site { align-self: flex-start; margin: 6px 0 0; padding: 12px 24px; border-radius: 99px; background: var(--orange); color: var(--light); font-size: 20px; font-weight: 700; letter-spacing: .01em; }
</style>
</head>
<body>
  <div class="ghost" aria-hidden="true">${ghost}</div>
  <img class="shape" src="${shape('globo')}" alt="" style="left: 26px; bottom: 26px; width: 104px;">
  <img class="shape" src="${shape('zigue-zague')}" alt="" style="left: 14px; bottom: 74px; width: 20px;">
  <img class="shape" src="${shape('explosao')}" alt="" style="left: 640px; top: 70px; width: 56px;">
  <img class="shape" src="${shape('anel')}" alt="" style="right: 22px; top: 238px; width: 22px;">
  <img class="shape" src="${shape('triangulos')}" alt="" style="right: 24px; top: 284px; width: 18px;">
  <img class="photo" src="${photo}" alt="">
  <div class="copy">
    <p class="label">${label}</p>
    <div class="name">${nameMark}</div>
    <p class="line">${line}</p>
    <p class="site">lorenzodacunha.com.br</p>
  </div>
</body>
</html>
`;

const workDir = join(tmpdir(), 'lorenzo-og');
mkdirSync(workDir, { recursive: true });
const pages = new Map(LOCALES.map((item) => [`/${item.file}`, page(item)]));
for (const [path, html] of pages) {
  const htmlFile = join(workDir, `${path.slice(1)}.html`);
  writeFileSync(htmlFile, html);
  console.log(`[og] template: ${htmlFile}`);
}

// Adobe Fonts serve the kit only to pages with a web origin, never to file:// pages, so the templates are served
// from a local server for the render (the photo is inlined as a data URI), one path per language (/home, /home-en...).
const server = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(pages.get(req.url) || '');
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;

// Child processes run asynchronously so the server above keeps answering while Chrome renders.
function run(command, args, { input = '', shell = false } = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { shell, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (status) => resolve({ status, stdout, stderr }));
    child.stdin.end(input);
  });
}
const finish = (code) => { server.close(); process.exit(code); };
if (HTML_ONLY) finish(0);

const outDir = join(root, 'public', 'og');
mkdirSync(outDir, { recursive: true });

function report(file) {
  const kb = Math.round(statSync(file).size / 1024);
  console.log(`[og] wrote ${file} (${WIDTH}x${HEIGHT}, ${kb} KB)`);
  if (kb > 300) console.warn('[og] Warning: over 300 KB; WhatsApp and some crawlers skip heavy images.');
}

if (CHROME) {
  // Chrome alone: --screenshot writes a PNG of the window once the page and its fonts load.
  for (const { file } of LOCALES) {
    const png = join(workDir, `${file}.png`);
    const result = await run(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      `--window-size=${WIDTH},${HEIGHT}`, '--virtual-time-budget=8000', `--screenshot=${png}`, `${base}/${file}`,
    ]);
    if (result.status !== 0) {
      console.error(result.stdout, result.stderr);
      finish(result.status ?? 1);
    }
    copyFileSync(png, join(outDir, `${file}.png`));
    report(join(outDir, `${file}.png`));
  }
  console.log('[og] Saved as PNG: point HOME_OG in src/lib/seo.ts at the .png files, or convert them to JPEG.');
  finish(0);
}

// dev-browser: a short Playwright script run against the Chrome at CONNECT, in a page named d-og-home.
const script = `
const page = await browser.getPage("d-og-home");
await page.setViewportSize({ width: ${WIDTH}, height: ${HEIGHT} });
for (const file of ${JSON.stringify(LOCALES.map((item) => item.file))}) {
  await page.goto(${JSON.stringify(base)} + "/" + file, { waitUntil: "networkidle" });
  await page.evaluate(async () => { await document.fonts.ready; return document.fonts.size; });
  const shot = await page.screenshot({ type: "jpeg", quality: 86, clip: { x: 0, y: 0, width: ${WIDTH}, height: ${HEIGHT} } });
  console.log("SAVED " + file + " " + await saveScreenshot(shot, "og-" + file + ".jpg"));
}
await browser.closePage("d-og-home");
`;
// One command string through the shell, so the npm shim (dev-browser.cmd on Windows) resolves everywhere.
const result = await run(`dev-browser --browser "${BROWSER}" --connect "${CONNECT}"`, [], { input: script, shell: true });
if (result.status !== 0) {
  console.error(result.stdout, result.stderr);
  console.error('[og] dev-browser failed. Start a Chrome with remote debugging, or use --chrome <path to chrome>.');
  finish(result.status ?? 1);
}
const saved = [...result.stdout.matchAll(/SAVED (\S+) (.+)/g)];
if (saved.length !== LOCALES.length) {
  console.error(result.stdout, result.stderr);
  finish(1);
}
for (const [, file, shot] of saved) {
  copyFileSync(shot.trim(), join(outDir, `${file}.jpg`));
  report(join(outDir, `${file}.jpg`));
}
finish(0);
