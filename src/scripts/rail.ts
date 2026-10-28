// Rails (featured cases, reviews): native horizontal scroll with a progress bar and optional arrows.
// The progress thumb is the `.rail-progress__thumb` inside the rail's parent; the arrows are any
// buttons with data-rail="<rail id>" and data-dir="-1" or "1".

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function bindRail(rail: HTMLElement): void {
  const bar = rail.parentElement?.querySelector<HTMLElement>('.rail-progress__thumb') ?? null;
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>(`[data-rail="${rail.id}"]`));

  const update = () => {
    const max = rail.scrollWidth - rail.clientWidth;
    const size = rail.scrollWidth ? rail.clientWidth / rail.scrollWidth : 1;
    const pos = max > 0 ? rail.scrollLeft / max : 0;
    if (bar) {
      bar.style.width = Math.min(1, size) * 100 + '%';
      bar.style.transform = 'translateX(' + pos * (1 / Math.min(1, size) - 1) * 100 + '%)';
    }
    buttons.forEach((b) => {
      b.disabled = Number(b.dataset.dir) < 0 ? rail.scrollLeft <= 2 : rail.scrollLeft >= max - 2;
    });
  };

  // One arrow click moves one card: the first item's width plus the column gap.
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      const item = rail.firstElementChild;
      const step = item ? item.getBoundingClientRect().width + (parseFloat(getComputedStyle(rail).columnGap) || 0) : rail.clientWidth;
      rail.scrollBy({ left: Number(b.dataset.dir) * step, behavior: reduced ? 'auto' : 'smooth' });
    }),
  );

  rail.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}
