// Content shapes of the JSON files in src/data (spec 3.6); see docs/desenvolvimento.md, "Conteúdo".

export type Tone = 'brand' | 'light' | 'strong' | 'dark';

export interface ProjectImage {
  src: string;
  /** Optional in the data: getContent fills it from case.shotAlt ("Captura de {title}, imagem {n} de {total}"). */
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  /** Immutable id, also the URL slug: /cases/<id>/ */
  id: string;
  /** Id used by the old site (?id=prj_...), kept for redirects. */
  legacyId: string;
  /** Featured projects are the "Cases em produção" rail, in `order`. */
  featured: boolean;
  order: number | null;
  title: string;
  platform: string;
  /** Optional label on the card ("Tema ELOY V2"); none of the imported projects has one. */
  badge?: string;
  period: string;
  /** yyyymm of the end of the period, only for sorting. */
  sort: number;
  type: 'loja' | 'landing';
  /** Studio background of the card; empty picks one by position. */
  tone: Tone | '';
  /** One line on the card and under the case title (the tagline of the previous site's description). */
  summary: string;
  /** The case write-up as HTML: p, h2, ul, ol, li, strong, em and br only (imported from the previous site). */
  description: string;
  stack: string[];
  /** Live store. Empty hides "Ver loja no ar". */
  url: string;
  /** The store is no longer online: the button shows blocked, with a tooltip; the url stays only in the data. */
  offline: boolean;
  /** Key in profile.partners; empty means a solo project. */
  partner: string;
  /** "Minha atuação": required whenever there is a partner (spec 3.5). */
  role: string;
  /** Visual example only, must not ship (see STATE). */
  example: boolean;
  adult: boolean;
  /** Shows the Lighthouse panel on this case (uploader checkbox); never for an offline store. */
  performance: boolean;
  images: ProjectImage[];
}

export interface Review {
  id: string;
  name: string;
  role: string;
  source: string;
  sourceUrl: string;
  /** Workana rating (1 to 5); 0 means a LinkedIn recommendation. */
  rating: number;
  when: string;
  text: string;
}

export interface Certificate {
  id: string;
  status: string;
  live?: boolean;
  title: string;
  where: string;
}

export interface Job {
  logo: string;
  src: string;
  width: number;
  height: number;
  role: string;
  where: string;
  when: string;
  current: boolean;
}

export interface Service {
  icon: string;
  title: string;
  text: string;
}

export interface Partner {
  name: string;
  logo: string;
  w: number;
  h: number;
}

export interface Profile {
  links: { workana: string; fiverr: string; linkedin: string; github: string };
  /** whatsapp: international number, digits only (wa.me link of the contact form). */
  contact: { email: string; phone: string; phoneHref: string; whatsapp: string };
  partners: Record<string, Partner>;
  /** Whole years, computed at build from PERSON_BIRTH_DATE; null hides the age. */
  age: number | null;
}

export interface MetricResult {
  value: string;
  score: number | null;
}

export interface PerfRun {
  score: number;
  fetchTime: string;
  lighthouse: string;
  metrics: Record<string, MetricResult>;
}

export interface Home {
  facts: string[];
  trust: { value: number; label: string }[];
  ghostPairs: [string, string][];
  mosaic: string[][];
}

export interface SiteContent {
  projects: Project[];
  reviews: Review[];
  certificates: Certificate[];
  experience: Job[];
  services: Service[];
  profile: Profile;
  home: Home;
  performance: Record<string, { mobile?: PerfRun; desktop?: PerfRun }>;
}
