// UI copy of the case view: the modal on the home page and the static page of each case (/cases/<id>/).
// Verbatim from the approved prototype (design/portfolio/build.mjs and portfolio.js).
// Placeholders in braces ({name}, {score}, {when}, {version}) are filled by the components and scripts.
export default {
  case: {
    crumbsSection: 'Cases',
    close: 'Fechar detalhes do case',
    // The explicit way back to the home page, on the case page and in the modal bar.
    home: 'Início',
    shotsLabel: 'Telas do case',
    partner: 'Lorenzo × {name}',
    role: 'Minha atuação',
    platform: 'Plataforma',
    period: 'Período',
    stack: 'Stack',
    live: 'Ver loja no ar',
    // A store that is no longer online: the tooltip of the blocked "live store" button.
    liveOff: 'Esta loja não está mais disponível.',
    similar: 'Falar sobre um projeto parecido',
    // The full description of the case (headings, paragraphs, lists), in the dark band.
    storyLabel: 'Como foi o projeto',
    // Alt text of each screenshot: {title} of the case, {n} of {total}.
    shotAlt: 'Captura de {title}, imagem {n} de {total}',
    // Projects marked adult (+18): the images stay blurred until the visitor confirms, as on the previous site.
    adultBadge: '+18',
    adultTitle: 'Conteúdo sensível (+18)',
    adultText: 'O conteúdo a seguir não é destinado para menores de 18 anos ou pode ser sensível para algumas pessoas.',
    adultConfirm: 'Ver as imagens',
    navLabel: 'Outros cases',
    prev: 'Case anterior',
    next: 'Próximo case',
    // Static page only: the visible breadcrumb above the case.
    breadcrumbLabel: 'Trilha de navegação',
    breadcrumbHome: 'Início',
    psi: {
      title: 'Desempenho da loja',
      tabsLabel: 'Dispositivo da medição',
      mobile: 'Celular',
      desktop: 'Computador',
      label: 'Desempenho',
      note: 'Valores estimados, que variam a cada medição. A nota é calculada direto destas métricas.',
      legendLabel: 'Faixas da nota',
      metricsTitle: 'Métricas',
      gauge: 'Nota de desempenho: {score} de 100',
      last: 'Última medição: {when}, Lighthouse {version}.',
      pending: 'Medindo agora no PageSpeed Insights…',
      live: 'Medido agora pelo PageSpeed Insights, Lighthouse {version}.',
      failed: 'A medição ao vivo não respondeu agora.',
      metrics: {
        'first-contentful-paint': 'First Contentful Paint',
        'largest-contentful-paint': 'Largest Contentful Paint',
        'total-blocking-time': 'Total Blocking Time',
        'cumulative-layout-shift': 'Cumulative Layout Shift',
        'speed-index': 'Speed Index',
      },
    },
  },
};
