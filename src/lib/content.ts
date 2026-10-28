// Single entry point for site content. Pages call getContent(locale) and never read src/data directly:
// the content is the JSON files in src/data, edited by hand, as in the previous portfolio.
// Translations sit next to each text field with the locale as a suffix ("summary", "summary_en", "summary_es");
// the Portuguese field has no suffix and is the fallback when a translation is missing.
import type { Project, Review, Certificate, Job, Service, Home, Profile, SiteContent, Tone } from './types';
import { toLocale, useT, DEFAULT_LOCALE, LOCALES, type Locale } from '../i18n';
import projects from '../data/projects.json';
import reviews from '../data/reviews.json';
import certificates from '../data/certificates.json';
import experience from '../data/experience.json';
import services from '../data/services.json';
import profile from '../data/profile.json';
import home from '../data/home.json';
import performance from '../data/performance.json';

const TONES: Tone[] = ['brand', 'light', 'strong', 'dark'];

/** Whole years at build time. The birth date stays out of the repository (spec 3.2): it comes from the environment. */
function ageFrom(birthDate: string | undefined): number | null {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null;
  const [y, m, d] = birthDate.split('-').map(Number);
  const now = new Date();
  const hadBirthday = now.getMonth() + 1 > m || (now.getMonth() + 1 === m && now.getDate() >= d);
  return now.getFullYear() - y - (hadBirthday ? 0 : 1);
}

const SUFFIX = new RegExp(`_(${LOCALES.filter((l) => l !== DEFAULT_LOCALE).join('|')})$`);

/** A copy of the data in one locale: "key_<locale>" replaces "key" when present, and every suffixed key goes. */
function localize<T>(value: T, locale: Locale): T {
  if (Array.isArray(value)) return value.map((item) => localize(item, locale)) as T;
  if (!value || typeof value !== 'object') return value;
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    if (SUFFIX.test(key)) continue;
    const translated = locale === DEFAULT_LOCALE ? undefined : source[`${key}_${locale}`];
    out[key] = localize(translated ?? source[key], locale);
  }
  return out as T;
}

/** "Fernanda Cedraz" -> "Fernanda C."; a single name stays as it is. */
function shortName(name: string): string {
  const [first, second] = name.trim().split(/\s+/);
  return second ? `${first} ${second[0].toUpperCase()}.` : first;
}

function local(locale: Locale): SiteContent {
  const t = useT(locale);
  // JSON imports widen tuples and lack the alt filled below: their shapes are the ones in types.ts.
  const list = localize(projects as unknown as Project[], locale);
  // Screenshots without their own alt text get "Captura de {title}, imagem {n} de {total}" in the page's language.
  for (const p of list) {
    p.images.forEach((im, k) => {
      im.alt ||= t('case.shotAlt').replace('{title}', p.title).replace('{n}', String(k + 1)).replace('{total}', String(p.images.length));
    });
  }
  return {
    projects: list,
    // Reviewers show as first name and the initial of the second ("Fernanda Cedraz" -> "Fernanda C."), on every review.
    reviews: localize(reviews as Review[], locale).map((r) => ({ ...r, name: shortName(r.name) })),
    certificates: localize(certificates as Certificate[], locale),
    experience: localize(experience as Job[], locale),
    services: localize(services as Service[], locale),
    profile: { ...localize(profile as Omit<Profile, 'age'>, locale), age: null },
    home: localize(home as unknown as Home, locale),
    performance: performance as SiteContent['performance'],
  };
}

const cached = new Map<Locale, Promise<SiteContent>>();

/** The site content in a locale (Astro.currentLocale); unknown or missing locales give pt-BR. */
export function getContent(locale?: string): Promise<SiteContent> {
  const loc = toLocale(locale);
  if (!cached.has(loc)) {
    cached.set(loc, (async () => {
      const content = local(loc);
      content.profile.age = ageFrom(import.meta.env.PERSON_BIRTH_DATE);
      console.log(`[content] ${loc}: ${content.projects.length} projects`);
      return content;
    })());
  }
  return cached.get(loc)!;
}

/** Featured cases in their curated order. Adult projects never appear in featured spots (spec 3.6). */
export function featuredProjects(content: SiteContent): Project[] {
  return content.projects.filter((p) => p.featured && !p.adult).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** The archive grid: everything that is not featured, newest first. */
export function catalogProjects(content: SiteContent): Project[] {
  return content.projects.filter((p) => !p.featured).sort((a, b) => b.sort - a.sort);
}

/** Featured first, then the archive: the order of prev/next in the case view. */
export function orderedProjects(content: SiteContent): Project[] {
  return [...featuredProjects(content), ...catalogProjects(content)];
}

/**
 * Studio tone and brand shape of each project, by its position in its own list,
 * exactly as the approved prototype assigned them (cards and case view share them).
 */
const SHAPES = ['globo', 'explosao', 'triangulos', 'anel', 'zigue-zague', 'cruzes'];
export function looks(content: SiteContent): Record<string, { tone: Tone; shape: string }> {
  const out: Record<string, { tone: Tone; shape: string }> = {};
  featuredProjects(content).forEach((p, i) => {
    out[p.id] = { tone: (p.tone || TONES[i % TONES.length]) as Tone, shape: SHAPES[i % SHAPES.length] };
  });
  catalogProjects(content).forEach((p, i) => {
    out[p.id] = { tone: (p.tone || TONES[(i + 1) % TONES.length]) as Tone, shape: SHAPES[(i + 1) % SHAPES.length] };
  });
  return out;
}
