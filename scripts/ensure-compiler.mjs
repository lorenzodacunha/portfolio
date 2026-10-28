// Runs before dev and build (and after npm install): checks whether the native Astro compiler loads on this machine.
// On Windows with Smart App Control, the unsigned compiler binary is blocked (error 4551). The package ships a
// WebAssembly build as a fallback, but npm skips it outside the wasm32 platform. This script fetches that build
// and puts it in place. On CI (Linux) and wherever the native binary loads, it does nothing.
import { execSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(join(root, 'package.json'));
const WASI = '@astrojs/compiler-binding-wasm32-wasi';
const NUL = String.fromCharCode(0);

function nativeLoads() {
  try {
    const dir = join(root, 'node_modules', '@astrojs');
    const native = readdirSync(dir).find((name) => name.startsWith('compiler-binding-') && name !== 'compiler-binding-wasm32-wasi');
    if (!native) return false;
    const pkgDir = join(dir, native);
    const file = readdirSync(pkgDir).find((name) => name.endsWith('.node'));
    if (!file) return false;
    require(join(pkgDir, file));
    return true;
  } catch {
    return false;
  }
}

// npm .tgz: a gzipped tar with everything under "package/". Minimal reader, no system tar needed.
function field(header, start, end) {
  const text = header.toString('utf8', start, end);
  const cut = text.indexOf(NUL);
  return cut === -1 ? text : text.slice(0, cut);
}

function extractTgz(file, target) {
  const data = gunzipSync(readFileSync(file));
  for (let offset = 0; offset + 512 <= data.length; ) {
    const header = data.subarray(offset, offset + 512);
    const name = field(header, 0, 100);
    if (!name) break;
    const prefix = field(header, 345, 500);
    const size = parseInt(field(header, 124, 136).trim() || '0', 8);
    const type = header[156] === 0 ? '0' : String.fromCharCode(header[156]);
    const path = (prefix ? `${prefix}/${name}` : name).replace(/^package\//, '');
    offset += 512;
    if (type === '0' && path && !path.split('/').includes('..')) {
      const out = join(target, path);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, data.subarray(offset, offset + size));
    }
    offset += Math.ceil(size / 512) * 512;
  }
}

if (!existsSync(join(root, 'node_modules', '@astrojs', 'compiler-binding'))) process.exit(0);
if (nativeLoads()) process.exit(0);
if (existsSync(join(root, 'node_modules', WASI, 'package.json'))) {
  console.log('[compiler] Astro WebAssembly compiler already installed.');
  process.exit(0);
}

const version = JSON.parse(readFileSync(join(root, 'node_modules', '@astrojs', 'compiler-binding', 'package.json'), 'utf8')).version;
console.log(`[compiler] the native Astro compiler does not load on this machine; installing ${WASI}@${version} (WebAssembly).`);
const tmp = mkdtempSync(join(tmpdir(), 'astro-wasi-'));
try {
  const output = execSync(`npm pack ${WASI}@${version} --pack-destination "${tmp}" --silent`, { cwd: tmp, encoding: 'utf8' });
  const tarball = output.trim().split(/\r?\n/).pop();
  extractTgz(join(tmp, tarball), join(root, 'node_modules', WASI));
  console.log('[compilador] pronto: o Astro vai usar o compilador em WebAssembly (um pouco mais lento, mesmo resultado).');
} catch (error) {
  console.warn(`[compiler] could not install the WebAssembly compiler: ${error.message}`);
  console.warn(`[compiler] run it by hand: npm install --no-save --force ${WASI}@${version}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
