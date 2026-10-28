// Spanish. UI copy of the top of the home page: navigation, hero, about, numbers, featured cases, services,
// the project card and the social links. Verbatim from the approved prototype (design/portfolio/build.mjs).
// Placeholders in braces ({age}, {n}, {name}) are filled by the components.
export default {
  nav: {
    skip: 'Saltar al contenido',
    mainLabel: 'Principal',
    menuLabel: 'Menú',
    about: 'Sobre mí',
    cases: 'Casos',
    services: 'Servicios',
    cta: 'Hablemos de un proyecto',
    open: 'Abrir menú',
    close: 'Cerrar menú',
  },
  // Language switcher: each language is named in itself, the same in every locale file.
  lang: {
    label: 'Idioma',
    'pt-br': 'Português',
    en: 'English',
    es: 'Español',
  },
  hero: {
    // {mark} is where the highlighted word (kickerMark) goes.
    kicker: 'Desarrollador {mark}',
    kickerMark: 'Shopify',
    nameFirst: 'Lorenzo',
    nameLast: 'da Cunha',
    lede: 'Desarrollo tiendas Shopify con foco en diseño, rendimiento y conversión.',
    photoAlt: 'Lorenzo da Cunha con suéter negro, mirando hacia la cámara, visto desde arriba',
    ctaCases: 'Ver casos en producción',
  },
  about: {
    titleOne: 'Sobre',
    titleTwo: 'mí',
    photoAlt: 'Retrato de Lorenzo da Cunha sonriendo, con fondo oscuro',
    introWithAge: 'Me llamo Lorenzo da Cunha, tengo {age} años y empecé como desarrollador a los 12.',
    intro: 'Me llamo Lorenzo da Cunha y empecé como desarrollador a los 12.',
    story: 'Desde hace 3 años, desarrollo los sueños de las personas con soluciones en Shopify. Saber que cada proyecto tiene un valor sentimental para mis clientes es lo que me impulsa a seguir todos los días.',
    focus: 'Estudio Ingeniería de Software en UniCesumar. Mi foco ahora es profundizar en IA y en los fundamentos de ingeniería, sin salir del ecosistema Shopify.',
    factsLabel: 'Resumen',
    mascotAlt: 'Lorenzo Mascot sentado, sosteniendo una bolsa de Shopify',
  },
  trust: {
    label: 'En números',
  },
  cases: {
    eyebrow: '{n} destacados',
    titleOne: 'Casos',
    titleTwo: 'en producción',
    all: 'Ver todos los proyectos',
    railLabel: 'Casos destacados',
  },
  services: {
    titleOne: 'Lo que',
    titleTwo: 'resuelvo',
    lede: 'Diseño, temas Liquid e integraciones, con foco en rendimiento y conversión.',
    cta: 'Hablemos de un proyecto',
  },
  card: {
    partner: 'Lorenzo × {name}',
    stackLabel: 'Stack',
    more: '{n} más',
    cta: 'Ver caso',
  },
  social: {
    linkedin: 'LinkedIn de Lorenzo da Cunha',
    github: 'GitHub de Lorenzo da Cunha',
    workana: 'Perfil de Lorenzo da Cunha en Workana',
    fiverr: 'Perfil de Lorenzo da Cunha en Fiverr',
  },
};
