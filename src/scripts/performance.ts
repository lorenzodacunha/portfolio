// Store performance panel: a replica of the PageSpeed Insights report. It shows the last recorded run
// (Lighthouse, src/data/performance.json, written by scripts/measure-performance.mjs) and measures live through
// the PageSpeed Insights API; when the live run arrives, the panel animates to it. The gauge only animates once
// the panel is on screen. Used by the case modal (one panel refilled per case) and by the static case pages.
//
// The pure helpers at the top are also used on the server by PerformancePanel.astro, so this module must not
// touch the DOM at import time.
import type { PerfRun } from '../lib/types';

export type Device = 'mobile' | 'desktop';
export type PerfSet = { mobile?: PerfRun; desktop?: PerfRun };

/** What the panel needs about one case. */
export interface PerfCase {
  id: string;
  url: string;
  perf: PerfSet | null;
}

/** UI copy, rendered by PerformancePanel.astro into data-psi-text (from src/i18n/pt-br/case.ts). */
export interface PsiText {
  gauge: string;
  last: string;
  pending: string;
  live: string;
  failed: string;
  metrics: Record<string, string>;
}

/** Lighthouse audits shown in the grid, in the PageSpeed Insights order. */
export const METRIC_KEYS = ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'];

export const metricRating = (s: number | null | undefined) => (s == null ? 'na' : s >= 0.9 ? 'pass' : s >= 0.5 ? 'average' : 'fail');
export const scoreRating = (n: number) => (n >= 90 ? 'pass' : n >= 50 ? 'average' : 'fail');

/** Fills {placeholders} of a UI string. */
export function fill(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

/** "27/10/2026, 16:09" in the page's language. The server passes the store's time zone and the page language;
 *  the browser uses the visitor's time zone and the lang of the page. */
export function formatWhen(iso: string, timeZone?: string, lang = typeof document === 'undefined' ? 'pt-BR' : document.documentElement.lang || 'pt-BR'): string {
  const d = new Date(iso);
  return d.toLocaleDateString(lang, { timeZone }) + ', ' + d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', timeZone });
}

/** Status line under the panel title. 'recorded' is the state without a live run (no script, or not started). */
export function statusText(text: PsiText, state: 'recorded' | 'pending' | 'live' | 'failed', run: PerfRun | undefined, timeZone?: string, lang?: string): string {
  const last = run ? fill(text.last, { when: formatWhen(run.fetchTime, timeZone, lang), version: run.lighthouse }) : '';
  if (state === 'live' && run) return fill(text.live, { version: run.lighthouse });
  if (state === 'pending') return [last, text.pending].filter(Boolean).join(' ');
  if (state === 'failed') return [last, text.failed].filter(Boolean).join(' ');
  return last;
}

const PSI = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
// API key of the PageSpeed Insights API, only from the build environment; empty means a keyless try.
const PSI_KEY: string = import.meta.env.PUBLIC_PSI_API_KEY ?? '';
const ARC = 352;

// Live runs already done in this visit, per case and device, shared by every panel on the page.
const liveResults: Record<string, PerfRun> = {};

export interface PerfController {
  /** Shows a case. liveWhenVisible waits until the panel is near the screen before calling the API. */
  show(p: PerfCase, options?: { liveWhenVisible?: boolean }): void;
  /** Cancels the live run in flight (the modal closed). */
  stop(): void;
}

/** Binds one .psi panel. scrollRoot is the scrolling box that contains it (null: the page). */
export function bindPerformance(box: HTMLElement, scrollRoot: Element | null): PerfController {
  const $ = <T extends Element = HTMLElement>(sel: string) => box.querySelector<T>(sel) as T;
  const text: PsiText = JSON.parse(box.dataset.psiText || '{}');
  const gauge = $('[data-f="psi-gauge"]');
  const arc = $<SVGCircleElement>('.psi__gauge-arc');
  const scoreEl = $('[data-f="psi-score"]');
  const statusEl = $('[data-f="psi-status"]');
  const metricsEl = $('[data-f="psi-metrics"]');
  const panel = $('.psi__panel');
  const tabs = Array.from(box.querySelectorAll<HTMLButtonElement>('.psi__tab'));

  let perfCase: PerfCase | null = null;
  let device: Device = 'mobile';
  let liveCtl: AbortController | null = null;
  let countRaf = 0;
  let shown: PerfRun | null = null;
  let seen = false;
  let liveReady = true;
  let nearObserver: IntersectionObserver | null = null;
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setArc(n: number, animate: boolean) {
    if (!animate) {
      arc.style.transition = 'none';
      arc.style.strokeDasharray = n * (ARC / 100) + ' ' + ARC;
      arc.getBoundingClientRect();
      arc.style.transition = '';
      return;
    }
    requestAnimationFrame(() => {
      arc.style.strokeDasharray = n * (ARC / 100) + ' ' + ARC;
    });
  }

  function animateGauge(n: number) {
    cancelAnimationFrame(countRaf);
    if (reduced()) {
      setArc(n, false);
      scoreEl.textContent = String(n);
      return;
    }
    setArc(0, false);
    setArc(n, true);
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 1000);
      scoreEl.textContent = String(Math.round(n * (1 - Math.pow(1 - k, 3))));
      if (k < 1) countRaf = requestAnimationFrame(step);
    };
    countRaf = requestAnimationFrame(step);
  }

  function paint(r: PerfRun) {
    shown = r;
    gauge.removeAttribute('data-loading');
    gauge.dataset.rating = scoreRating(r.score);
    gauge.setAttribute('aria-label', fill(text.gauge, { score: r.score }));
    metricsEl.innerHTML = '';
    METRIC_KEYS.forEach((key) => {
      const m = r.metrics[key];
      if (!m) return;
      const row = document.createElement('div');
      row.className = 'psi__metric is-' + metricRating(m.score);
      row.innerHTML = '<dt><span class="psi__shape"></span><span translate="no"></span></dt><dd></dd>';
      row.querySelector('[translate]')!.textContent = text.metrics[key] || key;
      row.querySelector('dd')!.textContent = m.value;
      metricsEl.appendChild(row);
    });
    if (seen) animateGauge(r.score);
    else {
      cancelAnimationFrame(countRaf);
      setArc(0, false);
      scoreEl.textContent = '';
    }
  }

  function setStatus(state: 'recorded' | 'pending' | 'live' | 'failed', r: PerfRun | undefined) {
    statusEl.dataset.state = state;
    statusEl.textContent = statusText(text, state, r);
  }

  function measureLive(p: PerfCase, which: Device): Promise<PerfRun> {
    const key = p.id + ':' + which;
    if (liveResults[key]) return Promise.resolve(liveResults[key]);
    if (liveCtl) liveCtl.abort();
    const ctl = (liveCtl = new AbortController());
    const timer = window.setTimeout(() => ctl.abort(), 90000);
    const q = new URLSearchParams({ url: p.url, strategy: which, category: 'performance', locale: 'pt_BR' });
    if (PSI_KEY) q.set('key', PSI_KEY);
    return fetch(PSI + '?' + q.toString(), { signal: ctl.signal })
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((j) => {
        const L = j.lighthouseResult;
        const r: PerfRun = { score: Math.round(L.categories.performance.score * 100), fetchTime: L.fetchTime, lighthouse: L.lighthouseVersion, metrics: {} };
        METRIC_KEYS.forEach((k) => {
          if (L.audits[k]) r.metrics[k] = { value: L.audits[k].displayValue, score: L.audits[k].score };
        });
        liveResults[key] = r;
        return r;
      })
      .finally(() => clearTimeout(timer));
  }

  function renderPerf(which: Device) {
    const p = perfCase;
    if (!p) return;
    const snap = p.perf ? p.perf[which] : undefined;
    const done = liveResults[p.id + ':' + which];
    if (done) {
      paint(done);
      setStatus('live', done);
      return;
    }
    if (snap) paint(snap);
    else {
      gauge.setAttribute('data-loading', '');
      gauge.removeAttribute('data-rating');
      scoreEl.textContent = '';
      metricsEl.innerHTML = '';
    }
    if (!liveReady && snap) {
      setStatus('recorded', snap);
      return;
    }
    setStatus('pending', snap);
    measureLive(p, which)
      .then((r) => {
        if (perfCase !== p || device !== which) return;
        paint(r);
        setStatus('live', r);
      })
      .catch(() => {
        if (perfCase !== p || device !== which) return;
        if (!snap) {
          gauge.removeAttribute('data-loading');
          scoreEl.textContent = '?';
        }
        setStatus('failed', snap);
      });
  }

  function selectDevice(which: Device, focus: boolean) {
    device = which;
    tabs.forEach((t) => {
      const on = t.dataset.ff === which;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panel.setAttribute('aria-labelledby', 'psi-tab-' + which);
    renderPerf(which);
  }

  tabs.forEach((t) =>
    t.addEventListener('click', () => {
      liveReady = true;
      selectDevice(t.dataset.ff as Device, false);
    }),
  );
  box.querySelector('.psi__tabs')?.addEventListener('keydown', (e) => {
    const key = (e as KeyboardEvent).key;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft') return;
    e.preventDefault();
    liveReady = true;
    selectDevice(device === 'mobile' ? 'desktop' : 'mobile', true);
  });

  const summary = box.querySelector('.psi__summary');
  if ('IntersectionObserver' in window && summary) {
    new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || seen) return;
        seen = true;
        if (shown && !gauge.hasAttribute('data-loading')) animateGauge(shown.score);
      },
      { root: scrollRoot, threshold: 0.35 },
    ).observe(summary);
  } else seen = true;

  return {
    show(p, options = {}) {
      perfCase = p;
      seen = false;
      // Without a recorded run (store offline or without an address) the panel stays hidden.
      box.hidden = !(p.url && p.perf && (p.perf.mobile || p.perf.desktop));
      if (box.hidden) {
        if (liveCtl) liveCtl.abort();
        return;
      }
      liveReady = !options.liveWhenVisible || !('IntersectionObserver' in window);
      if (!liveReady) {
        nearObserver?.disconnect();
        nearObserver = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            nearObserver?.disconnect();
            liveReady = true;
            renderPerf(device);
          },
          { root: scrollRoot, rootMargin: '0px 0px 50% 0px' },
        );
        nearObserver.observe(box);
      }
      selectDevice(p.perf!.mobile ? 'mobile' : 'desktop', false);
    },
    stop() {
      if (liveCtl) liveCtl.abort();
      nearObserver?.disconnect();
    },
  };
}
