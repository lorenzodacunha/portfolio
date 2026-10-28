// Text helpers for components that render content strings as HTML.

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(value: string): string {
  return String(value).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

// Brand and product names that browser auto-translation must leave alone (translate="no").
// Longest first, so "V4 Company" wins over a shorter match.
const BRAND_TERMS = [
  'Lorenzo da Cunha LTDA', 'Lorenzo da Cunha', 'Google Antigravity', 'Build with AI (Go)', 'Introduction to UX Design',
  'Karden Educação', 'V4 Company', 'UniCesumar', 'Nuvemshop', 'GemPages', 'LinkedIn', 'Shopify', 'Workana', 'Fiverr',
  'GitHub', 'Liquid', 'Frenet', 'Figma', 'Aloft', 'VTEX', 'Yampi', 'WBuy', 'Tray', 'Dawn',
].sort((a, b) => b.length - a.length);
// Letter and digit lookarounds instead of \b: terms may end in ")" ("Build with AI (Go)") or carry accents.
const BRAND_RE = new RegExp(`(?<![\\p{L}\\p{N}])(${BRAND_TERMS.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\p{L}\\p{N}])`, 'gu');

/** Escapes text and wraps brand names in <span translate="no">. Use with set:html. */
export function brandSafe(value: string): string {
  return esc(value).replace(BRAND_RE, '<span translate="no">$1</span>');
}

/** "Shopify, tema ELOY V2 sobre o Dawn" -> "Shopify": the short platform shown on cards. */
export function shortPlatform(platform: string): string {
  return platform.split(/,| com /)[0].trim();
}
