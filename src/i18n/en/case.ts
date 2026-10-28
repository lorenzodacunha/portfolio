// English. UI copy of the case view: the modal on the home page and the static page of each case (/cases/<id>/).
// Verbatim from the approved prototype (design/portfolio/build.mjs and portfolio.js).
// Placeholders in braces ({name}, {score}, {when}, {version}) are filled by the components and scripts.
export default {
  case: {
    crumbsSection: 'Cases',
    close: 'Close case details',
    // The explicit way back to the home page, on the case page and in the modal bar.
    home: 'Home',
    shotsLabel: 'Case screenshots',
    partner: 'Lorenzo × {name}',
    role: 'My role',
    platform: 'Platform',
    period: 'Period',
    stack: 'Stack',
    live: 'View live store',
    // A store that is no longer online: the tooltip of the blocked "live store" button.
    liveOff: 'This store is no longer available.',
    similar: 'Discuss a similar project',
    // The full description of the case (headings, paragraphs, lists), in the dark band.
    storyLabel: 'How the project went',
    // Alt text of each screenshot: {title} of the case, {n} of {total}.
    shotAlt: 'Screenshot of {title}, image {n} of {total}',
    // Projects marked adult (+18): the images stay blurred until the visitor confirms, as on the previous site.
    adultBadge: '18+',
    adultTitle: 'Sensitive content (18+)',
    adultText: 'The following content is not intended for anyone under 18 or may be sensitive for some viewers.',
    adultConfirm: 'Show the images',
    navLabel: 'Other cases',
    prev: 'Previous case',
    next: 'Next case',
    // Static page only: the visible breadcrumb above the case.
    breadcrumbLabel: 'Breadcrumb',
    breadcrumbHome: 'Home',
    psi: {
      title: 'Store performance',
      tabsLabel: 'Measurement device',
      mobile: 'Mobile',
      desktop: 'Desktop',
      label: 'Performance',
      note: 'Estimated values that vary with each measurement. The score is calculated directly from these metrics.',
      legendLabel: 'Score ranges',
      metricsTitle: 'Metrics',
      gauge: 'Performance score: {score} out of 100',
      last: 'Last measured: {when}, Lighthouse {version}.',
      pending: 'Measuring now with PageSpeed Insights…',
      live: 'Measured just now with PageSpeed Insights, Lighthouse {version}.',
      failed: "The live measurement didn't respond this time.",
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
