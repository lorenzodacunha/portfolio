// UI copy lives in src/i18n/<locale>/<area>.ts, one file per area of the site, each exporting a
// default object under its own top-level key (top.ts -> { nav: {...}, hero: {...} }, case.ts -> { case: {...} }).
// Three locales (spec 3.5): pt-BR at the root (/), English at /en/ and Spanish at /es/. Components get the
// locale of the page from Astro.currentLocale: `const t = useT(Astro.currentLocale)`.
type Dict = { [key: string]: string | Dict };

export const LOCALES = ['pt-br', 'en', 'es'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt-br';

/** BCP 47 tags for html lang, hreflang and structured data; og:locale uses the underscore form. */
export const LANG_TAG: Record<Locale, string> = { 'pt-br': 'pt-BR', en: 'en', es: 'es' };
// Spanish is written as neutral Latin American Spanish, hence es_LA.
export const OG_LOCALE: Record<Locale, string> = { 'pt-br': 'pt_BR', en: 'en_US', es: 'es_LA' };
/** Flag of the language switcher (public/assets/flags, country-flag-icons, MIT). */
export const FLAG: Record<Locale, string> = { 'pt-br': 'br', en: 'us', es: 'es' };
/** localStorage key of the language the visitor picked in the switcher (read by the redirect in Base.astro). */
export const LANG_KEY = 'lz-lang';

const modules = import.meta.glob<{ default: Dict }>('./*/*.ts', { eager: true });
const dicts = Object.fromEntries(
  LOCALES.map((loc) => [loc, Object.assign({}, ...Object.entries(modules).filter(([path]) => path.startsWith(`./${loc}/`)).map(([, m]) => m.default)) as Dict]),
) as Record<Locale, Dict>;

/** The site locale for Astro.currentLocale (or any string): unknown values fall back to pt-BR. */
export function toLocale(value: string | undefined): Locale {
  return (LOCALES as readonly string[]).includes(value ?? '') ? (value as Locale) : DEFAULT_LOCALE;
}

/** Looks up a dotted key ("hero.title"). A missing key fails the build instead of shipping a raw key. */
export function useT(locale: string | undefined) {
  const loc = toLocale(locale);
  return (key: string): string => {
    const value = key.split('.').reduce<string | Dict | undefined>((node, part) => (typeof node === 'object' ? node[part] : undefined), dicts[loc]);
    if (typeof value !== 'string') throw new Error(`[i18n] missing key: ${key} (${loc})`);
    return value;
  };
}

/** A site path ("/", "/cases/x/", "/#contato") in the given locale: pt-BR has no prefix, the others "/en", "/es". */
export function localePath(path: string, locale: string | undefined): string {
  const loc = toLocale(locale);
  return loc === DEFAULT_LOCALE ? path : `/${loc}${path}`;
}

/** The same page in every locale, from a pathname of any of them ("/en/cases/x/" -> "/cases/x/", "/es/cases/x/", ...). */
export function alternatePaths(pathname: string): Record<Locale, string> {
  const base = pathname.replace(new RegExp(`^/(${LOCALES.filter((l) => l !== DEFAULT_LOCALE).join('|')})(?=/|$)`), '') || '/';
  return Object.fromEntries(LOCALES.map((loc) => [loc, localePath(base, loc)])) as Record<Locale, string>;
}
