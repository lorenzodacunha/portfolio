// Project cards come in one after another the first time they scroll into view (a cascade). Cards that enter
// together (a row on desktop) follow each other in document order; the next row, or the next card on mobile,
// plays its own when it arrives. Each card plays once and then goes back to its normal styles. Cards hidden
// when the page loads (past "Mostrar mais", filtered out) are never armed, so showing them later does not play it.
// Without IntersectionObserver or with reduced motion nothing is armed and the cards are simply there.
const STEP = 90;
const DURATION = 700;

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    const cards = entries
      .filter((entry) => entry.isIntersecting)
      .map((entry) => entry.target as HTMLElement)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    if (!cards.length) return;
    cards.forEach((card, i) => {
      io.unobserve(card);
      card.style.setProperty('--cascade', String(i));
      card.classList.add('is-cascading');
    });
    window.setTimeout(() => {
      cards.forEach((card) => {
        card.classList.remove('is-cascade-armed', 'is-cascading');
        card.style.removeProperty('--cascade');
      });
    }, cards.length * STEP + DURATION + 100);
  }, { threshold: 0.12 });

  // Armed once every page script has run: the catalog script hides the cards past its first page on start.
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll<HTMLElement>('.product-grid > .product-card:not([hidden])').forEach((card) => {
      card.classList.add('is-cascade-armed');
      io.observe(card);
    });
  }, { once: true });
}
