// Case view on the client.
//
// Home page: clicking a card (a[data-case], href /cases/<id>/) opens the case modal instead of navigating. The
// modal is filled from the JSON CaseDialog.astro embeds (#case-data), the address follows the case
// (pushState /cases/<id>/ on open, replaceState on prev/next, back on close) and back/forward open or close it.
// The card's front shot morphs into the first shot of the studio: a view transition where the browser has
// them, a FLIP clone otherwise, nothing under prefers-reduced-motion.
//
// Case page (/cases/<id>/): the markup is already complete on the server; the script adds the shots carousel
// progress, the rise-in of the stacked shots and the live performance panel.
//
// The case write-up is not in the modal's JSON (43 of them would weigh on the home page): the modal reads it from
// the case page itself, as soon as a card shows intent, and shows the story band when it arrives.
// Adult projects (+18) keep their shots blurred until the visitor confirms; the answer lasts for the browser
// session (html[data-adult-ok]) and also unblurs the cards.
import { bindScrollbar } from './panel-scrollbar';
import { bindPerformance, type PerfSet } from './performance';

interface CaseImage {
  src: string;
  alt: string;
  w: number;
  h: number;
}

interface CaseData {
  id: string;
  href: string;
  pageTitle: string;
  title: string;
  platform: string;
  period: string;
  badge: string;
  summary: string;
  adult: boolean;
  offline: boolean;
  stack: string[];
  url: string;
  partner: { name: string; logo: string; w: number; h: number } | null;
  role: string;
  perf: PerfSet | null;
  tone: string;
  shape: string;
  images: CaseImage[];
}

interface CaseConfig {
  /** "Lorenzo × {name}" */
  partner: string;
}

/** History entries this script writes. lzPushed marks an entry the modal pushed itself (closing goes back). */
interface CaseState {
  lzCase: string;
  lzPushed?: boolean;
}

type OpenMode = 'push' | 'replace' | 'none';

const MORPH = 'case-shot';
const CASE_PATH = /^(?:\/(?:en|es))?\/cases\/([a-z0-9-]+)\/?$/;
const ADULT_KEY = 'lz-adult-ok';
const CASE_HASH = /^#case-([a-z0-9-]+)$/;
const SHOT_IMG = '[data-case-shot] img, img[data-case-shot]';
const EASE = 'cubic-bezier(.16, 1, .3, 1)';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canTransition = () => typeof document.startViewTransition === 'function';

function setUrl(kind: 'push' | 'replace', state: CaseState | null, url: string) {
  try {
    if (kind === 'push') history.pushState(state, '', url);
    else history.replaceState(state, '', url);
  } catch {
    /* some embedded viewers block the History API; the modal still works */
  }
  // The language switcher follows the address (src/components/sections/SiteNav.astro).
  window.dispatchEvent(new Event('lz:url'));
}

// +18: confirmed once per browser session.
function adultOk(): boolean {
  if (document.documentElement.hasAttribute('data-adult-ok')) return true;
  try {
    if (sessionStorage.getItem(ADULT_KEY) === '1') {
      document.documentElement.setAttribute('data-adult-ok', '');
      return true;
    }
  } catch {
    /* storage blocked: ask again next time */
  }
  return false;
}

function allowAdult(): void {
  document.documentElement.setAttribute('data-adult-ok', '');
  try {
    sessionStorage.setItem(ADULT_KEY, '1');
  } catch {
    /* storage blocked */
  }
}

/** Shows or clears the +18 notice of a studio: the shots stay blurred and out of reach until the visitor confirms. */
export function bindAdultGate(studio: HTMLElement, isAdult: () => boolean): () => void {
  const gate = studio.querySelector<HTMLElement>('.pdp__adult');
  const list = studio.querySelector<HTMLElement>('.pdp__shots');
  const sync = () => {
    const locked = isAdult() && !adultOk();
    studio.toggleAttribute('data-adult', isAdult());
    if (gate) gate.hidden = !locked;
    list?.toggleAttribute('inert', locked);
  };
  gate?.querySelector('[data-adult-ok]')?.addEventListener('click', () => {
    allowAdult();
    sync();
    list?.focus({ preventScroll: true });
  });
  sync();
  return sync;
}

// The write-up of a case, read from its own page (same origin, built from the sanitized data) once per case.
const writeUps = new Map<string, Promise<string>>();
function writeUp(href: string): Promise<string> {
  let job = writeUps.get(href);
  if (!job) {
    job = fetch(href)
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
      .then((html) => new DOMParser().parseFromString(html, 'text/html').querySelector('[data-case-page] [data-f="description"]')?.innerHTML ?? '')
      .catch(() => {
        writeUps.delete(href);
        return '';
      });
    writeUps.set(href, job);
  }
  return job;
}

function inViewport(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
}

/** Sum of the 2D rotations of an element and its closest ancestors (the shots are slightly tilted). */
function angleOf(el: Element): number {
  let sum = 0;
  let node: Element | null = el;
  for (let k = 0; node && k < 4; k++, node = node.parentElement) {
    const cs = getComputedStyle(node);
    if (cs.rotate && cs.rotate !== 'none') sum += parseFloat(cs.rotate.split(' ').pop() || '0') || 0;
    if (cs.transform && cs.transform !== 'none') {
      const m = new DOMMatrixReadOnly(cs.transform);
      sum += (Math.atan2(m.b, m.a) * 180) / Math.PI;
    }
  }
  return sum;
}

/** Resolves once the image is decoded (it comes from the card, so this is immediate), never later than 250 ms. */
function decoded(img: HTMLImageElement): Promise<void> {
  const wait = new Promise<void>((resolve) => window.setTimeout(resolve, 250));
  return Promise.race([img.decode().catch(() => {}), wait]);
}

// Studio shots: a snapping carousel up to 1023 px (progress bar below) and stacked shots on desktop, which rise
// in as they enter the view.
export function bindShots(studio: HTMLElement, scrollRoot: Element | null) {
  const list = studio.querySelector<HTMLElement>('.pdp__shots')!;
  const thumb = studio.querySelector<HTMLElement>('.pdp__shots-thumb');
  const wide = window.matchMedia('(min-width: 1024px)');

  const update = () => {
    if (!thumb) return;
    const max = list.scrollWidth - list.clientWidth;
    const size = list.scrollWidth ? Math.min(1, list.clientWidth / list.scrollWidth) : 1;
    thumb.style.width = size * 100 + '%';
    thumb.style.transform = 'translateX(' + (max > 0 ? list.scrollLeft / max : 0) * (1 / size - 1) * 100 + '%)';
  };
  list.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  const io =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) =>
            entries.forEach((e) => {
              if (!e.isIntersecting) return;
              e.target.classList.add('is-in');
              io?.unobserve(e.target);
            }),
          { root: scrollRoot, threshold: 0.15 },
        )
      : null;

  /** Arms the rise-in of the current shots; `inPlace` picks the ones that start already shown. */
  const arm = (inPlace: (li: HTMLElement, k: number) => boolean) => {
    io?.disconnect();
    const on = Boolean(io) && !reduced() && wide.matches;
    const items = Array.from(list.children) as HTMLElement[];
    if (on) items.forEach((li, k) => (inPlace(li, k) ? li.classList.add('is-in') : io!.observe(li)));
    list.classList.toggle('is-armed', on);
  };

  return { list, update, arm };
}

export function initCaseDialog(): void {
  const dialog = document.getElementById('case-dialog') as HTMLDialogElement | null;
  const dataEl = document.getElementById('case-data');
  if (!dialog || !dataEl) return;

  const cases: CaseData[] = JSON.parse(dataEl.textContent || '[]');
  adultOk();
  const config: CaseConfig = JSON.parse(document.getElementById('case-config')?.textContent || '{}');
  const indexOf = (id: string) => cases.findIndex((c) => c.id === id);
  const all = <T extends HTMLElement = HTMLElement>(name: string) => Array.from(dialog.querySelectorAll<T>(`[data-f="${name}"]`));
  const one = <T extends HTMLElement = HTMLElement>(name: string) => dialog.querySelector<T>(`[data-f="${name}"]`)!;
  const setText = (name: string, text: string) => all(name).forEach((el) => (el.textContent = text));

  const root = document.documentElement;
  const scroller = dialog.querySelector<HTMLElement>('.pdp__scroll')!;
  const bar = dialog.querySelector<HTMLElement>('.pdp__bar');
  const refreshBar = bindScrollbar(dialog);
  const perfBox = one('perf-box');
  const perf = perfBox ? bindPerformance(perfBox, scroller) : null;
  const shots = bindShots(one('studio'), scroller);
  const homeUrl = location.pathname + location.search;

  let homeTitle = document.title;
  let current = -1;
  let lastTrigger: HTMLElement | null = null;
  let closeFromHistory = false;
  let closing = false;
  let afterCloseHash = '';
  // history.back() is asynchronous: until its popstate arrives, a new open waits in afterBack.
  let backPending = false;
  let afterBack: (() => void) | null = null;
  // After the state above: the gate reads the current case.
  const syncAdult = bindAdultGate(one('studio'), () => Boolean(cases[current]?.adult));

  const firstShot = () => shots.list.querySelector<HTMLImageElement>('img');
  const shotOf = (trigger: Element) =>
    trigger.querySelector<HTMLImageElement>(SHOT_IMG) ?? trigger.closest('.product-card, li')?.querySelector<HTMLImageElement>(SHOT_IMG) ?? null;
  const cardShot = (id: string | undefined) => {
    if (!id) return null;
    for (const link of document.querySelectorAll<HTMLElement>(`[data-case="${CSS.escape(id)}"]`)) {
      if (dialog.contains(link)) continue;
      const img = shotOf(link);
      if (img) return img;
    }
    return null;
  };
  const ready = (img: HTMLImageElement | null): img is HTMLImageElement => Boolean(img && img.complete && img.naturalWidth > 0 && inViewport(img));
  // The modal's first shot is still visible inside the panel (below the sticky bar).
  const inPanel = (img: HTMLImageElement) => {
    const r = img.getBoundingClientRect();
    const s = scroller.getBoundingClientRect();
    return r.width > 0 && r.bottom > s.top + (bar ? bar.offsetHeight : 0) && r.top < s.bottom && r.right > s.left && r.left < s.right;
  };

  function fillShots(p: CaseData, morph: boolean, firstSrc?: string) {
    const list = shots.list;
    list.innerHTML = '';
    list.scrollLeft = 0;
    p.images.forEach((im, k) => {
      const li = document.createElement('li');
      li.className = 'pdp__shot';
      const frame = document.createElement('span');
      frame.className = 'pdp__shot-frame';
      const pic = document.createElement('img');
      pic.src = (k === 0 && firstSrc) || im.src;
      pic.alt = im.alt;
      pic.width = im.w;
      pic.height = im.h;
      if (k > 0) pic.loading = 'lazy';
      frame.appendChild(pic);
      li.appendChild(frame);
      list.appendChild(li);
    });
    // The morphing shot lands in place: it must not wait for the rise-in.
    shots.arm((_li, k) => morph && k === 0);
    requestAnimationFrame(shots.update);
  }

  function fillCase(i: number, morph = false, firstSrc?: string) {
    current = (i + cases.length) % cases.length;
    const p = cases[current];
    setText('title', p.title);
    setText('summary', p.summary);
    setText('platform', p.platform);
    setText('period', p.period);
    const badge = one('badge');
    badge.textContent = p.badge;
    badge.hidden = !p.badge;
    const stack = one('stack');
    stack.innerHTML = '';
    p.stack.forEach((s) => {
      const li = document.createElement('li');
      li.setAttribute('translate', 'no');
      li.textContent = s;
      stack.appendChild(li);
    });
    // The write-up: from the case page, its sections one level below the modal's h2 title.
    const story = one('story');
    const box = one('description');
    story.hidden = true;
    box.innerHTML = '';
    writeUp(p.href).then((html) => {
      if (cases[current]?.id !== p.id || !html) return;
      box.innerHTML = html.replace(/<(\/?)h2>/g, '<$1h3>');
      story.hidden = false;
      refreshBar();
    });
    // Partnership (Lorenzo × company) and the summary of the role
    one('partner-box').hidden = !p.partner;
    if (p.partner) {
      const logo = one<HTMLImageElement>('partner-logo');
      logo.src = p.partner.logo;
      logo.width = p.partner.w;
      logo.height = p.partner.h;
      setText('partner-name', config.partner.replace('{name}', p.partner.name));
    }
    one('role-box').hidden = !p.role;
    setText('role', p.role);
    // An offline store gets the blocked button with its tooltip instead of the link.
    const live = one<HTMLAnchorElement>('url');
    live.hidden = !p.url || p.offline;
    if (p.url && !p.offline) live.href = p.url;
    one('url-off').hidden = !p.url || !p.offline;
    // Studio in the tone and with the shape of the case's card
    one('studio').dataset.tone = p.tone;
    one<HTMLImageElement>('shape').src = '/assets/shapes/' + p.shape + '.svg';
    fillShots(p, morph, firstSrc);
    syncAdult();
    setText('prev', cases[(current - 1 + cases.length) % cases.length].title);
    const next = cases[(current + 1) % cases.length];
    setText('next', next.title);
    one('next-media').dataset.tone = next.tone;
    one('next-media').toggleAttribute('data-adult', next.adult);
    one<HTMLImageElement>('next-img').src = next.images[0]?.src || '';
    perf?.show(p);
    scroller.scrollTop = 0;
    refreshBar();
    document.title = p.pageTitle;
  }

  // Seamless open: the card's front shot becomes the first shot of the studio. Both are the same file (already
  // decoded for the card), so nothing loads in between.
  function morphOpen(i: number, from: HTMLImageElement) {
    const p = cases[i];
    const wanted = p.images[0] ? new URL(p.images[0].src, location.href).href : '';
    const have = from.currentSrc || from.src;
    // A card with a smaller responsive candidate lends its file to the morph; the full one replaces it afterwards.
    const firstSrc = wanted && have && have !== wanted ? have : undefined;
    const upgrade = (img: HTMLImageElement | null) => {
      if (img && firstSrc && p.images[0]) img.src = p.images[0].src;
    };
    const show = () => {
      fillCase(i, true, firstSrc);
      dialog!.showModal();
      refreshBar();
    };
    dialog!.setAttribute('data-morph', '');

    if (canTransition()) {
      let target: HTMLImageElement | null = null;
      from.style.viewTransitionName = MORPH;
      root.dataset.caseMorph = 'open';
      const vt = document.startViewTransition(async () => {
        from.style.viewTransitionName = '';
        show();
        target = firstShot();
        if (target) {
          target.style.viewTransitionName = MORPH;
          await decoded(target);
        }
      });
      const done = () => {
        delete root.dataset.caseMorph;
        from.style.viewTransitionName = '';
        if (target) target.style.viewTransitionName = '';
        upgrade(target);
      };
      vt.finished.then(done, done);
      vt.ready.catch(() => {});
      return;
    }
    flipOpen(from, show, upgrade);
  }

  // FLIP fallback: a temporary clone of the card image inside the dialog (top layer), fixed, flying from the
  // card's place to the first shot with transform only, while the rest of the panel fades in. Then removed.
  function flipOpen(from: HTMLImageElement, show: () => void, upgrade: (img: HTMLImageElement | null) => void) {
    const a = from.getBoundingClientRect();
    const aw = from.offsetWidth;
    const aAngle = angleOf(from);
    show();
    const target = firstShot();
    if (!target || !aw || typeof target.animate !== 'function') return upgrade(target);
    const b = target.getBoundingClientRect();
    const bw = target.offsetWidth;
    const bh = target.offsetHeight;
    const bAngle = angleOf(target);
    const clone = document.createElement('img');
    clone.src = from.currentSrc || from.src;
    clone.alt = '';
    clone.className = 'case-morph';
    clone.style.left = b.left + b.width / 2 - bw / 2 + 'px';
    clone.style.top = b.top + b.height / 2 - bh / 2 + 'px';
    clone.style.width = bw + 'px';
    clone.style.height = bh + 'px';
    dialog!.appendChild(clone);
    target.style.visibility = 'hidden';
    const dx = a.left + a.width / 2 - (b.left + b.width / 2);
    const dy = a.top + a.height / 2 - (b.top + b.height / 2);
    const fly = clone.animate(
      [{ transform: `translate(${dx}px, ${dy}px) rotate(${aAngle}deg) scale(${aw / bw})` }, { transform: `rotate(${bAngle}deg)` }],
      { duration: 500, easing: EASE },
    );
    const fade = { duration: 300, easing: 'ease-out' };
    scroller.animate([{ opacity: 0 }, { opacity: 1 }], fade);
    dialog!.animate([{ backgroundColor: 'transparent' }, { backgroundColor: getComputedStyle(dialog!).backgroundColor }], fade);
    const end = () => {
      target.style.visibility = '';
      clone.remove();
      upgrade(target);
    };
    fly.finished.then(end, end);
  }

  function openCase(id: string, opts: { mode: OpenMode; trigger?: HTMLElement | null; from?: HTMLImageElement | null }) {
    const i = indexOf(id);
    if (i < 0) return;
    const p = cases[i];
    if (!dialog!.open) homeTitle = document.title;
    lastTrigger = opts.trigger ?? null;
    if (opts.mode === 'push') setUrl('push', { lzCase: p.id, lzPushed: true }, p.href);
    else if (opts.mode === 'replace') setUrl('replace', { lzCase: p.id }, p.href);
    if (dialog!.open) {
      fillCase(i);
      return;
    }
    if (!reduced() && ready(opts.from ?? null)) {
      morphOpen(i, opts.from!);
      return;
    }
    fillCase(i);
    dialog!.showModal();
    refreshBar();
  }

  // Closing reverses the morph when the case's card is on screen and the first shot is still in view.
  function requestClose(fromHistory = false) {
    if (!dialog!.open || closing) return;
    closeFromHistory = fromHistory;
    const source = firstShot();
    const target = afterCloseHash ? null : cardShot(cases[current]?.id);
    if (canTransition() && !reduced() && source && inPanel(source) && ready(target)) {
      closing = true;
      source.style.viewTransitionName = MORPH;
      root.dataset.caseMorph = 'close';
      const vt = document.startViewTransition(() => {
        source.style.viewTransitionName = '';
        dialog!.close();
        target.style.viewTransitionName = MORPH;
      });
      const done = () => {
        closing = false;
        delete root.dataset.caseMorph;
        source.style.viewTransitionName = '';
        target.style.viewTransitionName = '';
      };
      vt.finished.then(done, done);
      vt.ready.catch(() => {});
      return;
    }
    dialog!.close();
  }

  // After "Falar sobre um projeto parecido": the contact section of the home, as a normal in-page link would.
  function goToHash(hash: string) {
    if (location.hash === hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
    else location.hash = hash;
  }

  dialog.addEventListener('close', () => {
    perf?.stop();
    dialog.removeAttribute('data-morph');
    document.title = homeTitle;
    const hash = afterCloseHash;
    afterCloseHash = '';
    if (!closeFromHistory) {
      const then = hash ? () => goToHash(hash) : null;
      const state = history.state as CaseState | null;
      if (state && state.lzPushed) {
        backPending = true;
        afterBack = then;
        history.back();
      } else {
        if (CASE_PATH.test(location.pathname)) setUrl('replace', null, homeUrl);
        then?.();
      }
    }
    closeFromHistory = false;
    if (!hash && lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
  });

  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    requestClose();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) requestClose();
  });
  dialog.querySelectorAll<HTMLElement>('[data-close]').forEach((el) =>
    el.addEventListener('click', (e) => {
      const href = el.getAttribute('href');
      if (href) {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const at = href.indexOf('#');
        afterCloseHash = at >= 0 ? href.slice(at) : '';
      }
      requestClose();
    }),
  );
  dialog.querySelectorAll<HTMLElement>('[data-step]').forEach((b) =>
    b.addEventListener('click', () => {
      fillCase(current + Number(b.dataset.step));
      const p = cases[current];
      const state = history.state as CaseState | null;
      setUrl('replace', { lzCase: p.id, lzPushed: Boolean(state && state.lzPushed) }, p.href);
    }),
  );

  // Cards show a 640px image; the modal opens on the full one. Fetch it (and the case write-up) as soon as a card
  // shows intent (pointer over it, keyboard focus, or the start of a tap), so the morph never waits for a download.
  const warmed = new Set<string>();
  const warm = (e: Event) => {
    const trigger = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-case]') : null;
    const c = trigger && !dialog.contains(trigger) ? cases[indexOf(trigger.dataset.case || '')] : undefined;
    if (c) void writeUp(c.href);
    const src = c?.images[0]?.src;
    if (!src || warmed.has(src)) return;
    warmed.add(src);
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  };
  document.addEventListener('pointerover', warm, { passive: true });
  document.addEventListener('focusin', warm);
  document.addEventListener('pointerdown', warm, { passive: true });

  // Cards: a plain click opens the modal; middle, ctrl, cmd or shift click keep the link (the case page).
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const trigger = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-case]') : null;
    if (!trigger || dialog.contains(trigger)) return;
    const id = trigger.dataset.case || '';
    if (indexOf(id) < 0) return;
    e.preventDefault();
    const go = () => openCase(id, { mode: 'push', trigger, from: shotOf(trigger) });
    if (backPending) afterBack = go;
    else go();
  });

  // Back and forward: an entry of a case opens (or switches) the modal, any other entry closes it.
  window.addEventListener('popstate', () => {
    if (backPending) {
      backPending = false;
      const then = afterBack;
      afterBack = null;
      // After the browser restores the scroll position of the entry.
      if (then) window.setTimeout(then, 0);
      return;
    }
    const m = CASE_PATH.exec(location.pathname);
    const id = m && indexOf(m[1]) >= 0 ? m[1] : '';
    if (id) {
      if (!dialog.open) openCase(id, { mode: 'none' });
      else if (cases[current].id !== id) fillCase(indexOf(id));
    } else if (dialog.open) requestClose(true);
  });

  // Links of the prototype (#case-aurora-tecidos) still open the case.
  const fromHash = () => {
    const m = CASE_HASH.exec(location.hash);
    if (m && indexOf(m[1]) >= 0 && !dialog.open) openCase(m[1], { mode: 'replace' });
  };
  fromHash();
  window.addEventListener('hashchange', fromHash);
}

export function initCasePage(): void {
  const page = document.querySelector<HTMLElement>('[data-case-page]');
  if (!page) return;
  const studio = page.querySelector<HTMLElement>('.pdp__studio');
  if (studio) {
    const adult = studio.hasAttribute('data-adult');
    bindAdultGate(studio, () => adult);
    const shots = bindShots(studio, null);
    shots.update();
    // Shots already on screen at load stay put; the ones below rise in as on the modal.
    shots.arm((li) => li.getBoundingClientRect().top < window.innerHeight);
  }
  const box = page.querySelector<HTMLElement>('.psi[data-psi-case]');
  if (box) bindPerformance(box, null).show(JSON.parse(box.dataset.psiCase || '{}'), { liveWhenVisible: true });
}
