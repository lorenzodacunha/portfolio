// English. UI copy of the top of the home page: navigation, hero, about, numbers, featured cases, services,
// the project card and the social links. Verbatim from the approved prototype (design/portfolio/build.mjs).
// Placeholders in braces ({age}, {n}, {name}) are filled by the components.
export default {
  nav: {
    skip: 'Skip to content',
    mainLabel: 'Main',
    menuLabel: 'Menu',
    about: 'About',
    cases: 'Cases',
    services: 'Services',
    cta: 'Discuss a project',
    open: 'Open menu',
    close: 'Close menu',
  },
  // Language switcher: each language is named in itself, the same in every locale file.
  lang: {
    label: 'Language',
    'pt-br': 'Português',
    en: 'English',
    es: 'Español',
  },
  hero: {
    // {mark} is where the highlighted word (kickerMark) goes.
    kicker: '{mark} Developer',
    kickerMark: 'Shopify',
    nameFirst: 'Lorenzo',
    nameLast: 'da Cunha',
    lede: 'I build Shopify stores focused on design, performance, and conversion.',
    photoAlt: 'Lorenzo da Cunha in a black sweater, looking up at the camera, seen from above',
    ctaCases: 'See cases in production',
  },
  about: {
    titleOne: 'About',
    titleTwo: 'me',
    photoAlt: 'Portrait of Lorenzo da Cunha smiling, against a dark background',
    introWithAge: "My name is Lorenzo da Cunha, I'm {age} years old, and I started as a developer at 12.",
    intro: 'My name is Lorenzo da Cunha, and I started as a developer at 12.',
    story: "For 3 years, I've been building people's dreams with Shopify solutions. Knowing that every project holds sentimental value for my clients is what keeps me going every day.",
    focus: "I'm studying Software Engineering at UniCesumar. My focus now is going deeper into AI and engineering fundamentals, without leaving the Shopify ecosystem.",
    factsLabel: 'Summary',
    mascotAlt: 'Lorenzo Mascot sitting down, holding a Shopify bag',
  },
  trust: {
    label: 'By the numbers',
  },
  cases: {
    eyebrow: '{n} highlights',
    titleOne: 'Cases',
    titleTwo: 'in production',
    all: 'See all projects',
    railLabel: 'Featured cases',
  },
  services: {
    titleOne: 'What',
    titleTwo: 'I solve',
    lede: 'Design, Liquid themes, and integrations, focused on performance and conversion.',
    cta: 'Discuss a project',
  },
  card: {
    partner: 'Lorenzo × {name}',
    stackLabel: 'Stack',
    more: '{n} more',
    cta: 'View case',
  },
  social: {
    linkedin: 'Lorenzo da Cunha on LinkedIn',
    github: 'Lorenzo da Cunha on GitHub',
    workana: "Lorenzo da Cunha's profile on Workana",
    fiverr: "Lorenzo da Cunha's profile on Fiverr",
  },
};
