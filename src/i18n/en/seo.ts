// English. Search and share copy (titles, descriptions, image alts, structured data labels) and the 404 page.
// Every claim here comes from the public site data (src/data): no metrics, no certifications, no superlatives.
// Placeholders in braces ({name}) are filled by src/lib/seo.ts.
export default {
  seo: {
    siteName: 'Lorenzo da Cunha',
    titleSuffix: ' | Lorenzo da Cunha',
    jobTitle: 'Shopify Developer',
    home: {
      title: 'Lorenzo da Cunha | Shopify Developer: stores and Liquid themes',
      description:
        'I build Shopify stores focused on design, performance, and conversion: custom Liquid themes, apps, and integrations. Shopify since 2023, in Americana, SP.',
      imageAlt: 'Lorenzo da Cunha in a black sweater, next to his name and the title Shopify Developer, on a white background',
      personDescription:
        'Shopify developer in Americana, SP: store design, Liquid themes and OS 2.0, apps and integrations, performance and conversion.',
      featured: 'Cases in production',
    },
    case: {
      title: '{name}: {kind}',
      description: "{summary} Case from Lorenzo da Cunha's portfolio: {kind}.",
      // When the summary already names the kind of work (a VTEX migration, a landing page), the tail does not repeat it.
      descriptionPlain: '{summary} Case from the portfolio of Lorenzo da Cunha, Shopify developer.',
      // {platform}: the case platform (Shopify, Yampi, WordPress...), from projects.json.
      kind: {
        migration: 'VTEX to Shopify migration',
        landing: '{platform} landing page',
        liquid: 'Shopify store with a Liquid theme',
        store: '{platform} store',
        site: 'site built with {platform}',
      },
    },
    breadcrumb: {
      home: 'Home',
      cases: 'Cases',
    },
    notFound: {
      title: 'Page not found | Lorenzo da Cunha',
      description:
        "This address doesn't exist or has moved. The cases and projects of Lorenzo da Cunha, Shopify developer, are on the home page.",
      eyebrow: 'Error 404',
      titleOne: 'Page',
      titleTwo: 'not found',
      text: 'The address may have changed, or the link arrived incomplete. The cases, the projects, and the contact form are still on the home page.',
      toCases: 'See cases in production',
      toHome: 'Back to home',
      homeLabel: 'Lorenzo da Cunha, home page',
    },
  },
};
