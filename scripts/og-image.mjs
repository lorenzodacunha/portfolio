// Generates the home share image (Open Graph and Twitter card): public/og/home.jpg, 1200 by 630.
// The image is an HTML page in the brand (orange #FF9D2E, dark #333, the cutout photo, Widescreen Mixed from the
// Adobe Fonts kit for the marquee, the name mark SVG, Poppins from Google Fonts) rendered by a headless Chrome and saved as JPEG.
//
// Usage (from the site folder):
//   node scripts/og-image.mjs                          renders with dev-browser connected to a running Chrome
//   node scripts/og-image.mjs --connect http://127.0.0.1:9222 --browser lorenzo
//   node scripts/og-image.mjs --chrome "C:/Program Files/Google/Chrome/Application/chrome.exe"
//                                                      renders with Chrome alone (PNG, then saved as home.png)
//   node scripts/og-image.mjs --html-only              only writes the HTML template, to open in a browser
//
// After changing the image, keep DEFAULT_OG in src/lib/seo.ts pointing at the file this script writes.
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
// The name is the brand name mark, as in the hero (paints with currentColor).
const nameMark = readFileSync(join(root, 'src/assets/brand/logo-name.svg'), 'utf8').replace(/<!--[\s\S]*?-->\s*/, '');

// Copy of the image: the site hero, word for word; no claims beyond it.
const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>OG home</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;700&family=Syncopate:wght@400;700&display=block" rel="stylesheet">
<link href="https://use.typekit.net/rck3lnu.css" rel="stylesheet">
<style>
  :root { --orange: #FF9D2E; --yellow: #FFD22E; --red-orange: #FF692E; --dark: #333333; --light: #FFFFFF; }
  * { box-sizing: border-box; }
  html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  body { position: relative; background: var(--orange); color: var(--dark); font-family: "Poppins", sans-serif; }

  /* Background lettering, as in the site hero */
  .ghost { position: absolute; inset: -20px 0 0 -40px; display: flex; flex-direction: column; gap: 6px; pointer-events: none; }
  .ghost span { font-family: "widescreen-mixed", "Syncopate", sans-serif; font-weight: 700; font-size: 132px; line-height: 1; text-transform: uppercase; white-space: nowrap; color: var(--light); opacity: .12; }
  .ghost span:nth-child(even) { margin-left: 260px; }

  /* Brand stripe along the bottom edge (the logo gradient) */
  .stripe { position: absolute; left: 0; right: 0; bottom: 0; height: 14px; background: linear-gradient(90deg, var(--yellow), var(--orange), var(--red-orange)); }

  .photo { position: absolute; right: 36px; top: 34px; width: 470px; height: auto; filter: drop-shadow(0 24px 40px rgba(51, 51, 51, .35)); }

  .copy { position: absolute; left: 72px; top: 0; bottom: 14px; width: 680px; display: flex; flex-direction: column; justify-content: center; gap: 26px; }
  .label { margin: 0; font-size: 30px; font-weight: 300; }
  .mark { display: inline-block; padding: 0 .3em; border-radius: 10px; background: var(--dark); color: var(--light); font-weight: 400; }
  .name { margin: 0; color: var(--dark); }
  .name svg { display: block; width: 560px; height: auto; }
  .line { margin: 0; max-width: 36ch; font-size: 26px; font-weight: 400; line-height: 1.35; }
  .site { position: absolute; left: 72px; bottom: 44px; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: .02em; }
</style>
</head>
<body>
  <div class="ghost" aria-hidden="true"><span>Shopify</span><span>Liquid</span><span>Design</span><span>Performance</span><span>Conversão</span></div>
  <img class="photo" src="${photo}" alt="">
  <div class="copy">
    <p class="label">Desenvolvedor <span class="mark">Shopify</span></p>
    <div class="name">${nameMark}</div>
    <p class="line">Desenvolvo lojas Shopify com foco em design, performance e conversão.</p>
  </div>
  <p class="site">lorenzodacunha.com.br</p>
  <div class="stripe"></div>
</body>
</html>
`;

const workDir = join(tmpdir(), 'lorenzo-og');
mkdirSync(workDir, { recursive: true });
const htmlFile = join(workDir, 'home.html');
writeFileSync(htmlFile, html);
console.log(`[og] template: ${htmlFile}`);

// Adobe Fonts serve the kit only to pages with a web origin, never to file:// pages, so the template is served
// from a local server for the render (the photo is inlined as a data URI).
const server = createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const pageUrl = `http://127.0.0.1:${server.address().port}/`;

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
  const png = join(workDir, 'home.png');
  const result = await run(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${WIDTH},${HEIGHT}`, '--virtual-time-budget=8000', `--screenshot=${png}`, pageUrl,
  ]);
  if (result.status !== 0) {
    console.error(result.stdout, result.stderr);
    finish(result.status ?? 1);
  }
  copyFileSync(png, join(outDir, 'home.png'));
  report(join(outDir, 'home.png'));
  console.log('[og] Saved as PNG: point DEFAULT_OG in src/lib/seo.ts at /og/home.png, or convert it to JPEG.');
  finish(0);
}

// dev-browser: a short Playwright script run against the Chrome at CONNECT, in a page named d-og-home.
const script = `
const page = await browser.getPage("d-og-home");
await page.setViewportSize({ width: ${WIDTH}, height: ${HEIGHT} });
await page.goto(${JSON.stringify(pageUrl)}, { waitUntil: "networkidle" });
await page.evaluate(async () => { await document.fonts.ready; return document.fonts.size; });
const shot = await page.screenshot({ type: "jpeg", quality: 86, clip: { x: 0, y: 0, width: ${WIDTH}, height: ${HEIGHT} } });
const saved = await saveScreenshot(shot, "og-home.jpg");
await browser.closePage("d-og-home");
console.log("SAVED " + saved);
`;
// One command string through the shell, so the npm shim (dev-browser.cmd on Windows) resolves everywhere.
const result = await run(`dev-browser --browser "${BROWSER}" --connect "${CONNECT}"`, [], { input: script, shell: true });
if (result.status !== 0) {
  console.error(result.stdout, result.stderr);
  console.error('[og] dev-browser failed. Start a Chrome with remote debugging, or use --chrome <path to chrome>.');
  finish(result.status ?? 1);
}
const saved = /SAVED (.+)/.exec(result.stdout)?.[1]?.trim();
if (!saved) {
  console.error(result.stdout, result.stderr);
  finish(1);
}
copyFileSync(saved, join(outDir, 'home.jpg'));
report(join(outDir, 'home.jpg'));
finish(0);
