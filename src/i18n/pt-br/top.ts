// UI copy of the top of the home page: navigation, hero, about, numbers, featured cases, services,
// the project card and the social links. Verbatim from the approved prototype (design/portfolio/build.mjs).
// Placeholders in braces ({age}, {n}, {name}) are filled by the components.
export default {
  nav: {
    skip: 'Pular para o conteúdo',
    mainLabel: 'Principal',
    menuLabel: 'Menu',
    about: 'Sobre',
    cases: 'Cases',
    services: 'Serviços',
    cta: 'Falar sobre um projeto',
    open: 'Abrir menu',
    close: 'Fechar menu',
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
    kicker: 'Desenvolvedor {mark}',
    kickerMark: 'Shopify',
    nameFirst: 'Lorenzo',
    nameLast: 'da Cunha',
    lede: 'Desenvolvo lojas Shopify com foco em design, performance e conversão.',
    photoAlt: 'Lorenzo da Cunha, de blusa preta, olhando para a câmera de cima',
    ctaCases: 'Ver cases em produção',
  },
  about: {
    titleOne: 'Sobre',
    titleTwo: 'mim',
    photoAlt: 'Retrato de Lorenzo da Cunha sorrindo, com fundo escuro',
    introWithAge: 'Meu nome é Lorenzo da Cunha, tenho {age} anos e comecei como desenvolvedor aos 12.',
    intro: 'Meu nome é Lorenzo da Cunha e comecei como desenvolvedor aos 12.',
    story: 'Há 3 anos, desenvolvo os sonhos das pessoas com soluções em Shopify. Saber que cada projeto tem um valor sentimental para os meus clientes é o que me move a continuar todos os dias.',
    focus: 'Curso Engenharia de Software na UniCesumar. Meu foco agora é aprofundar IA e os fundamentos de engenharia, sem sair do ecossistema Shopify.',
    factsLabel: 'Resumo',
    mascotAlt: 'Lorenzo Mascot sentado, segurando uma sacola da Shopify',
  },
  trust: {
    label: 'Em números',
  },
  cases: {
    eyebrow: '{n} destaques',
    titleOne: 'Cases',
    titleTwo: 'em produção',
    all: 'Ver todos os projetos',
    railLabel: 'Cases em destaque',
  },
  services: {
    titleOne: 'O que',
    titleTwo: 'eu resolvo',
    lede: 'Design, temas Liquid e integrações, com foco em performance e conversão.',
    cta: 'Falar sobre um projeto',
  },
  card: {
    partner: 'Lorenzo × {name}',
    stackLabel: 'Stack',
    more: 'mais {n}',
    cta: 'Ver case',
  },
  social: {
    linkedin: 'LinkedIn de Lorenzo da Cunha',
    github: 'GitHub de Lorenzo da Cunha',
    workana: 'Perfil de Lorenzo da Cunha na Workana',
    fiverr: 'Perfil de Lorenzo da Cunha na Fiverr',
  },
};
