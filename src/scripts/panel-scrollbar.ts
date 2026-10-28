// Custom scrollbar of the covering panels (dialog.pdp: the case view and the full testimonial).
// The thumb follows the scroll, can be dragged, and a click on the track jumps there. The scrolling
// itself stays native (wheel, touch, keyboard); the native bar is hidden by the design CSS.
// Markup: dialog > .pdp__scroll (with an optional sticky .pdp__bar) + .pdp__rail > .pdp__rail-thumb.

/** Binds the scrollbar of one dialog and returns its refresh function (call it after the content changes). */
export function bindScrollbar(dialog: HTMLDialogElement): () => void {
  const box = dialog.querySelector<HTMLElement>('.pdp__scroll');
  const rail = dialog.querySelector<HTMLElement>('.pdp__rail');
  const thumb = dialog.querySelector<HTMLElement>('.pdp__rail-thumb');
  const bar = dialog.querySelector<HTMLElement>('.pdp__bar');
  if (!box || !rail || !thumb) return () => {};

  let idle = 0;
  let startY = 0;
  let startTop = 0;
  const range = () => box.scrollHeight - box.clientHeight;

  const update = () => {
    rail.style.top = (bar ? bar.offsetHeight : 0) + 8 + 'px';
    const max = range();
    rail.classList.toggle('is-scrollable', max > 1);
    if (max <= 1) return;
    const h = rail.clientHeight;
    const th = Math.max(36, (h * box.clientHeight) / box.scrollHeight);
    thumb.style.height = th + 'px';
    thumb.style.transform = 'translateY(' + ((h - th) * box.scrollTop) / max + 'px)';
  };

  box.addEventListener(
    'scroll',
    () => {
      update();
      rail.classList.add('is-active');
      clearTimeout(idle);
      idle = window.setTimeout(() => rail.classList.remove('is-active'), 900);
    },
    { passive: true },
  );

  thumb.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    thumb.setPointerCapture(e.pointerId);
    startY = e.clientY;
    startTop = box.scrollTop;
    rail.classList.add('is-dragging');
  });
  thumb.addEventListener('pointermove', (e) => {
    if (!rail.classList.contains('is-dragging')) return;
    box.scrollTop = startTop + ((e.clientY - startY) * range()) / Math.max(1, rail.clientHeight - thumb.offsetHeight);
  });
  const stop = () => rail.classList.remove('is-dragging');
  thumb.addEventListener('pointerup', stop);
  thumb.addEventListener('pointercancel', stop);

  rail.addEventListener('pointerdown', (e) => {
    if (e.target === thumb) return;
    const r = rail.getBoundingClientRect();
    const th = thumb.offsetHeight;
    const k = Math.max(0, Math.min(1, (e.clientY - r.top - th / 2) / Math.max(1, r.height - th)));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    box.scrollTo({ top: k * range(), behavior: reduced ? 'auto' : 'smooth' });
  });

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(update);
    ro.observe(box);
    Array.from(box.children).forEach((c) => ro.observe(c));
  }
  window.addEventListener('resize', update);

  return () => {
    requestAnimationFrame(update);
  };
}
