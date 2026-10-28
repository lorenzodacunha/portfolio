// Spanish. UI copy of the case view: the modal on the home page and the static page of each case (/cases/<id>/).
// Verbatim from the approved prototype (design/portfolio/build.mjs and portfolio.js).
// Placeholders in braces ({name}, {score}, {when}, {version}) are filled by the components and scripts.
export default {
  case: {
    crumbsSection: 'Casos',
    close: 'Cerrar detalles del caso',
    // The explicit way back to the home page, on the case page and in the modal bar.
    home: 'Inicio',
    shotsLabel: 'Capturas del caso',
    partner: 'Lorenzo × {name}',
    role: 'Mi rol',
    platform: 'Plataforma',
    period: 'Período',
    stack: 'Stack',
    live: 'Ver tienda en línea',
    // A store that is no longer online: the tooltip of the blocked "live store" button.
    liveOff: 'Esta tienda ya no está disponible.',
    similar: 'Hablemos de un proyecto similar',
    // The full description of the case (headings, paragraphs, lists), in the dark band.
    storyLabel: 'Cómo fue el proyecto',
    // Alt text of each screenshot: {title} of the case, {n} of {total}.
    shotAlt: 'Captura de {title}, imagen {n} de {total}',
    // Projects marked adult (+18): the images stay blurred until the visitor confirms, as on the previous site.
    adultBadge: '+18',
    adultTitle: 'Contenido sensible (+18)',
    adultText: 'El siguiente contenido no está destinado a menores de 18 años o puede ser sensible para algunas personas.',
    adultConfirm: 'Ver las imágenes',
    navLabel: 'Otros casos',
    prev: 'Caso anterior',
    next: 'Caso siguiente',
    // Static page only: the visible breadcrumb above the case.
    breadcrumbLabel: 'Ruta de navegación',
    breadcrumbHome: 'Inicio',
    psi: {
      title: 'Rendimiento de la tienda',
      tabsLabel: 'Dispositivo de medición',
      mobile: 'Celular',
      desktop: 'Computadora',
      label: 'Rendimiento',
      note: 'Valores estimados, que varían en cada medición. La puntuación se calcula directamente a partir de estas métricas.',
      legendLabel: 'Rangos de puntuación',
      metricsTitle: 'Métricas',
      gauge: 'Puntuación de rendimiento: {score} de 100',
      last: 'Última medición: {when}, Lighthouse {version}.',
      pending: 'Midiendo ahora en PageSpeed Insights…',
      live: 'Medido ahora por PageSpeed Insights, Lighthouse {version}.',
      failed: 'La medición en vivo no respondió esta vez.',
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
