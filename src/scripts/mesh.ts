// Water ripple over the grids ("malha quadriculada").
// Every [data-mesh] host keeps its static grid (the warped SVG of mesh-svg.ts, or the CSS squares of its
// ::before) until it comes on screen. Then a canvas takes its place, draws the same lines with the same
// color and opacity, and displaces them like a water surface. On its own the surface sways (a slow swell of
// two long waves) and, now and then, a wide ripple starts at a random spot of the part on screen. The pointer
// adds drops that ripple out and fade, plus a soft lens under it that drags the lines along with it.
// Cost: one shared requestAnimationFrame loop that runs only while a host is on screen or something moves;
// the motion on its own is drawn at AMBIENT_FPS, the pointer's at every frame. A host that leaves the
// viewport (or sits in a closed dialog) gives its canvas back and shows the static grid again; a hidden tab
// gets no frames. Without JS or with reduced motion nothing here runs.

const SAMPLE = 8; // px between sample points along a line
const SPEED = 230; // px/s, speed of a drop's wave front
const WAVE = 42; // px, wavelength of the ripple
const BAND = 30; // px, width of the ring of waves around the front
const DECAY = 0.65; // s, time constant of a drop's fade
const REACH = 300; // px, distance constant of a drop's fade
const LENS = 0.14; // lens under the pointer: share of the distance pushed outward
const LENS_R = 80; // px, lens radius
const DRAG = 0.12; // share of the pointer's lead that drags the lines along
const MAX_DROPS = 8;
const AMBIENT_FPS = 30; // frame rate of the motion on its own
const SWELL = 1.6; // px, amplitude of the swell
const FADE_IN = 1.2; // s, the motion on its own grows from the static drawing instead of jumping
const LIVE = 'is-mesh-live';

interface Drop {
  x: number;
  y: number;
  t: number; // start, in seconds of performance.now()
  a: number; // amplitude, px
  v: number; // px/s, speed of the wave front (SPEED for the pointer's drops)
  wave: number; // px, wavelength
  band: number; // px, width of the ring of waves around the front
  decay: number; // s, time constant of the fade
  reach: number; // px, distance constant of the fade
}

interface Mesh {
  host: HTMLElement;
  grid: boolean; // true: CSS squares on ::before; false: warped SVG
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  color: string;
  width: number; // line width, CSS px
  cell: number; // grid: square size
  src: number[][]; // SVG: path vertices in viewBox units
  vw: number;
  vh: number;
  rows: Float32Array[]; // sample points (x, y, x, y...) in CSS px of the host
  cols: Float32Array[];
  w: number;
  h: number;
  rect: DOMRect | null; // cached box for pointer math, forgotten on scroll and resize
  visible: boolean;
  drops: Drop[];
  lx: number; // lens position, eased toward the pointer
  ly: number;
  px: number; // pointer position
  py: number;
  s: number; // lens strength, eased toward st
  st: number;
  dropX: number; // last drop, for the throttle
  dropY: number;
  dropT: number;
  ambient: boolean; // on screen: moves on its own
  gain: number; // 0 to 1, the motion on its own fading in
  swell: Float32Array; // two waves, each kx, ky (rad/px), angular speed (rad/s), phase
  nextRipple: number; // s, when the next random ripple starts
  drawn: number; // s, last frame drawn
}

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const meshes = new Map<Element, Mesh>();
const owners = new WeakMap<Element, Mesh>(); // canvas -> mesh
const running = new Set<Mesh>();
let enabled = false;
let raf = 0;
let last = 0;
let io: IntersectionObserver | null = null;
let ro: ResizeObserver;

// A line as points at most SAMPLE px apart along the same straight segments, so the rest state matches
// the static drawing exactly and the ripple still bends smoothly.
function sample(pts: number[]): Float32Array {
  const out = [pts[0], pts[1]];
  for (let i = 2; i < pts.length; i += 2) {
    const x0 = pts[i - 2], y0 = pts[i - 1], dx = pts[i] - x0, dy = pts[i + 1] - y0;
    const n = Math.max(1, Math.ceil(Math.hypot(dx, dy) / SAMPLE));
    for (let k = 1; k <= n; k++) out.push(x0 + (dx * k) / n, y0 + (dy * k) / n);
  }
  return new Float32Array(out);
}

function layout(m: Mesh, w: number, h: number): void {
  const canvas = m.canvas!, ctx = m.ctx!;
  // At most 1.5 device px per CSS px, and less on very large hosts, never under 1.
  const dpr = Math.max(1, Math.min(1.5, window.devicePixelRatio || 1, Math.sqrt(2.4e6 / (w * h))));
  m.w = w;
  m.h = h;
  m.rect = null;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
  ctx.strokeStyle = m.color;
  ctx.lineWidth = m.width;
  m.rows = [];
  m.cols = [];
  if (m.grid) {
    // 1 px lines at the top and left of each square; background-position: center puts the first
    // square at (size - cell) / 2. One square of overflow on every side keeps the edges covered.
    const c = m.cell;
    for (let y = ((h - c) / 2) % c - c; y < h + c; y += c) m.rows.push(sample([-c, y + 0.5, w + c, y + 0.5]));
    for (let x = ((w - c) / 2) % c - c; x < w + c; x += c) m.cols.push(sample([x + 0.5, -c, x + 0.5, h + c]));
  } else {
    // The SVG is stretched with preserveAspectRatio="none": scale x and y on their own.
    const sx = w / m.vw, sy = h / m.vh;
    for (const path of m.src) {
      const pts = path.map((v, i) => v * (i % 2 ? sy : sx));
      const n = pts.length;
      const row = Math.abs(pts[n - 2] - pts[0]) > Math.abs(pts[n - 1] - pts[1]);
      (row ? m.rows : m.cols).push(sample(pts));
    }
  }
  draw(m, performance.now() / 1000);
}

function draw(m: Mesh, now: number): void {
  const ctx = m.ctx;
  if (!ctx || !m.w) return;
  // Per drop: center, front radius, amplitude now, the squared limits of its ring of waves, wave number,
  // squared ring width and fade distance.
  const f: number[] = [];
  for (const d of m.drops) {
    const age = Math.max(0, now - d.t), front = d.v * age, inner = Math.max(0, front - 3 * d.band);
    f.push(d.x, d.y, front, d.a * Math.exp(-age / d.decay), inner * inner, (front + 3 * d.band) ** 2, (2 * Math.PI) / d.wave, d.band * d.band, d.reach);
  }
  // The swell: one wave moves the points up and down, the other sideways; each grows and shrinks slowly.
  const s = m.swell, g = m.gain * SWELL, swell = g > 0.01;
  const a1 = g * (0.55 + 0.45 * Math.sin(now * 0.23 + s[3])), c1 = s[3] - now * s[2];
  const a2 = g * (0.55 + 0.45 * Math.sin(now * 0.17 + s[7])), c2 = s[7] - now * s[6];
  const lens = m.s > 0.001;
  const reach = (LENS_R * 2.6) ** 2;
  const vx = Math.max(-10, Math.min(10, (m.px - m.lx) * DRAG));
  const vy = Math.max(-10, Math.min(10, (m.py - m.ly) * DRAG));

  ctx.clearRect(0, 0, m.w, m.h);
  // Rows and columns stroke apart, so the crossings blend like the SVG paths and the two gradients do.
  for (const group of [m.rows, m.cols]) {
    ctx.beginPath();
    for (const line of group) {
      for (let i = 0; i < line.length; i += 2) {
        const x = line[i], y = line[i + 1];
        let ox = 0, oy = 0;
        if (swell) {
          oy += a1 * Math.sin(x * s[0] + y * s[1] + c1);
          ox += a2 * Math.sin(x * s[4] + y * s[5] + c2);
        }
        if (lens) {
          const dx = x - m.lx, dy = y - m.ly, d2 = dx * dx + dy * dy;
          if (d2 < reach) {
            const g = m.s * Math.exp(-d2 / (LENS_R * LENS_R));
            ox += (dx * LENS + vx) * g;
            oy += (dy * LENS + vy) * g;
          }
        }
        // Each drop pushes points along its radius: a sine of distance minus speed times time,
        // inside a ring around the front, fading with time and distance.
        for (let j = 0; j < f.length; j += 9) {
          const dx = x - f[j], dy = y - f[j + 1], d2 = dx * dx + dy * dy;
          if (d2 < f[j + 4] || d2 > f[j + 5]) continue;
          const r = Math.sqrt(d2) || 1, u = r - f[j + 2];
          const k = (f[j + 3] * Math.exp(-(u * u) / f[j + 7] - r / f[j + 8]) * Math.sin(u * f[j + 6]) * Math.min(1, r / 12)) / r;
          ox += dx * k;
          oy += dy * k;
        }
        if (i) ctx.lineTo(x + ox, y + oy);
        else ctx.moveTo(x + ox, y + oy);
      }
    }
    ctx.stroke();
  }
}

// A wide, slow ripple at a random spot of the part of the host that is on screen.
function ripple(m: Mesh, now: number): void {
  const r = m.host.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const k = m.w / r.width; // scaled ancestors
  const top = Math.max(0, -r.top) * k, bottom = Math.min(r.height, window.innerHeight - r.top) * k;
  if (bottom <= top) return;
  m.drops.push({
    x: Math.random() * m.w, y: top + Math.random() * (bottom - top), t: now, a: 2 + Math.random() * 1.6,
    v: 70 + Math.random() * 40, wave: 80 + Math.random() * 40, band: 55, decay: 2.2, reach: 520,
  });
  if (m.drops.length > MAX_DROPS) m.drops.shift();
}

// Advances drops, lens and the motion on its own: 0 once the surface is still, 1 while only the motion on its
// own moves it (drawn at AMBIENT_FPS), 2 while the pointer's lens or drops move it (drawn every frame).
function step(m: Mesh, now: number, dt: number): number {
  const diag = Math.hypot(m.w, m.h);
  // A drop ends when its waves are under a quarter pixel or past the far corner.
  m.drops = m.drops.filter((d) => d.a * Math.exp((d.t - now) / d.decay) > 0.25 && d.v * (now - d.t) - 3 * d.band < diag);
  if (m.ambient && m.w) {
    m.gain = Math.min(1, m.gain + dt / FADE_IN);
    if (now >= m.nextRipple) {
      ripple(m, now);
      m.nextRipple = now + 1.4 + Math.random() * 2.2;
    }
  }
  const follow = 1 - Math.exp(-dt / 0.09), ease = 1 - Math.exp(-dt / 0.28);
  m.lx += (m.px - m.lx) * follow;
  m.ly += (m.py - m.ly) * follow;
  m.s += (m.st - m.s) * ease;
  const lensMoving = Math.abs(m.st - m.s) > 0.003 || (m.s > 0.003 && Math.abs(m.px - m.lx) + Math.abs(m.py - m.ly) > 0.3);
  if (!lensMoving) {
    m.s = m.st;
    m.lx = m.px;
    m.ly = m.py;
  }
  if (lensMoving || m.drops.some((d) => d.v === SPEED)) return 2;
  return m.ambient || m.drops.length ? 1 : 0;
}

function tick(t: number): void {
  const now = t / 1000, dt = Math.max(0, Math.min(0.05, now - last));
  last = now;
  for (const m of running) {
    const state = step(m, now, dt);
    if (!state) running.delete(m);
    // The motion on its own skips frames down to AMBIENT_FPS; the last frame draws the settled state.
    if (state !== 1 || now - m.drawn >= 1 / AMBIENT_FPS - 0.004) {
      draw(m, now);
      m.drawn = now;
    }
  }
  raf = running.size ? requestAnimationFrame(tick) : 0;
}

function wake(m: Mesh): void {
  if (!m.canvas) return;
  running.add(m);
  if (!raf) {
    last = performance.now() / 1000;
    raf = requestAnimationFrame(tick);
  }
}

// Puts the canvas in place of the static grid, copying its color, line width, opacity and stacking.
function attach(m: Mesh): boolean {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const svg = m.grid ? null : m.host.querySelector<SVGSVGElement>('svg[class$="mesh"]');
  if (!ctx || (!m.grid && !svg)) return false;
  const cs = svg ? getComputedStyle(svg) : getComputedStyle(m.host, '::before');
  canvas.className = 'mesh-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.opacity = cs.opacity;
  canvas.style.zIndex = cs.zIndex;
  if (svg) {
    const vb = svg.viewBox.baseVal;
    m.color = cs.stroke;
    m.width = parseFloat(cs.strokeWidth) || 1;
    m.vw = vb.width || 1;
    m.vh = vb.height || 1;
    m.src = Array.from(svg.querySelectorAll('path'), (p) => (p.getAttribute('d')?.match(/-?\d*\.?\d+/g) ?? []).map(Number)).filter((p) => p.length >= 4);
    svg.after(canvas);
  } else {
    m.color = cs.backgroundImage.match(/rgba?\([^)]*\)/)?.[0] ?? cs.getPropertyValue('--color-mesh-line');
    m.width = 1;
    m.cell = parseFloat(cs.backgroundSize) || 28;
    m.host.prepend(canvas);
  }
  m.canvas = canvas;
  m.ctx = ctx;
  owners.set(canvas, m);
  m.host.classList.add(LIVE);
  ro.observe(canvas); // sizes and draws it before the next paint
  return true;
}

function release(m: Mesh): void {
  if (!m.canvas) return;
  running.delete(m);
  ro.unobserve(m.canvas);
  m.canvas.remove();
  m.canvas = m.ctx = null;
  m.host.classList.remove(LIVE);
  m.drops = [];
  m.s = m.st = m.w = m.gain = 0;
  m.ambient = false;
}

// On screen: the canvas takes the place of the static grid and the motion on its own fades in.
function activate(m: Mesh): void {
  if (!enabled || (!m.canvas && !attach(m))) return;
  if (!m.ambient) {
    m.ambient = true;
    m.gain = 0;
    m.nextRipple = performance.now() / 1000 + 0.4 + Math.random() * 1.2;
  }
  wake(m);
}

// Two long waves in random directions, 240 to 440 px long, each passing in 5 to 9 s.
function randomSwell(): Float32Array {
  const s = new Float32Array(8);
  for (let i = 0; i < 8; i += 4) {
    const angle = Math.random() * 2 * Math.PI, k = (2 * Math.PI) / (240 + Math.random() * 200);
    s[i] = Math.cos(angle) * k;
    s[i + 1] = Math.sin(angle) * k;
    s[i + 2] = (2 * Math.PI) / (5 + Math.random() * 4);
    s[i + 3] = Math.random() * 2 * Math.PI;
  }
  return s;
}

function splash(m: Mesh, x: number, y: number, a: number, now: number): void {
  m.drops.push({ x, y, t: now, a, v: SPEED, wave: WAVE, band: BAND, decay: DECAY, reach: REACH });
  if (m.drops.length > MAX_DROPS) m.drops.shift();
  m.dropX = x;
  m.dropY = y;
  m.dropT = now;
}

// Pointer position in the host's CSS px, or null outside it. The box is read outside the frame loop.
function local(m: Mesh, e: PointerEvent): [number, number] | null {
  const r = (m.rect ??= m.host.getBoundingClientRect());
  if (!r.width || !r.height) return null;
  const x = e.clientX - r.left, y = e.clientY - r.top;
  if (x < 0 || y < 0 || x > r.width || y > r.height) return null;
  const k = m.w ? m.w / r.width : 1; // scaled ancestors
  return [x * k, y * k];
}

function leave(m: Mesh): void {
  if (!m.st) return;
  m.st = 0;
  wake(m);
}

function move(m: Mesh, e: PointerEvent): void {
  if (!enabled || !m.visible || e.pointerType === 'touch') return;
  const p = local(m, e);
  if (!p) return leave(m);
  if (!m.canvas && !attach(m)) return;
  const [x, y] = p, now = performance.now() / 1000;
  if (!m.st) {
    // The pointer just touched the surface: the lens appears under it, with one drop.
    if (m.s < 0.02) {
      m.lx = x;
      m.ly = y;
    }
    m.st = 1;
    splash(m, x, y, 3.5, now);
  } else {
    // Moving: a drop every 70 ms and 16 px at most, stronger when the pointer is faster.
    const gap = now - m.dropT, dist = Math.hypot(x - m.dropX, y - m.dropY);
    if (gap > 0.07 && dist > 16) splash(m, x, y, 2.5 + Math.min(4, dist / gap / 300), now);
  }
  m.px = x;
  m.py = y;
  wake(m);
}

// Touch and pen: a tap (a pointerup the browser did not cancel for scrolling) drops a single ripple.
function tap(m: Mesh, e: PointerEvent): void {
  if (!enabled || !m.visible || e.pointerType === 'mouse') return;
  m.rect = null;
  const p = local(m, e);
  if (!p || (!m.canvas && !attach(m))) return;
  splash(m, p[0], p[1], 6, performance.now() / 1000);
  wake(m);
}

function register(host: HTMLElement): void {
  if (meshes.has(host)) return;
  const m: Mesh = {
    host, grid: host.dataset.mesh === 'grid', canvas: null, ctx: null, color: '', width: 1, cell: 28,
    src: [], vw: 1, vh: 1, rows: [], cols: [], w: 0, h: 0, rect: null, visible: false, drops: [],
    lx: 0, ly: 0, px: 0, py: 0, s: 0, st: 0, dropX: 0, dropY: 0, dropT: 0,
    ambient: false, gain: 0, swell: randomSwell(), nextRipple: 0, drawn: 0,
  };
  meshes.set(host, m);
  io!.observe(host);
  // The card's stretched "Ver case" button covers its media, so the card is what gets the pointer.
  const zone = host.closest<HTMLElement>('.product-card') ?? host;
  const opts = { passive: true };
  zone.addEventListener('pointerenter', () => { m.rect = null; }, opts);
  zone.addEventListener('pointermove', (e) => move(m, e), opts);
  zone.addEventListener('pointerleave', () => leave(m), opts);
  zone.addEventListener('pointerup', (e) => tap(m, e), opts);
}

// Registers new hosts and forgets removed ones (a dialog may swap its content).
function scan(): void {
  meshes.forEach((m, host) => {
    if (host.isConnected) return;
    release(m);
    io!.unobserve(host);
    meshes.delete(host);
  });
  document.querySelectorAll<HTMLElement>('[data-mesh]').forEach(register);
}

function start(): void {
  enabled = true;
  if (io) {
    meshes.forEach((m) => { if (m.visible) activate(m); });
    return;
  }
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const m = meshes.get(e.target);
      if (!m) continue;
      m.visible = e.isIntersecting;
      if (m.visible) activate(m);
      else release(m);
    }
  });
  ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const m = owners.get(e.target);
      const { width, height } = e.contentRect;
      if (m?.canvas && width && height) layout(m, width, height);
    }
  });
  const forget = () => meshes.forEach((m) => { m.rect = null; });
  window.addEventListener('scroll', forget, { passive: true, capture: true });
  window.addEventListener('resize', forget, { passive: true });
  let queued = false;
  const mo = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; scan(); });
  });
  document.querySelectorAll('dialog').forEach((d) => mo.observe(d, { childList: true, subtree: true }));
  scan();
}

if ('IntersectionObserver' in window && 'ResizeObserver' in window) {
  motion.addEventListener('change', () => {
    if (!motion.matches) return start();
    enabled = false;
    meshes.forEach(release);
  });
  if (!motion.matches) start();
}
