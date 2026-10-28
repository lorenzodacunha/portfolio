// Spanish. Search and share copy (titles, descriptions, image alts, structured data labels) and the 404 page.
// Every claim here comes from the public site data (src/data): no metrics, no certifications, no superlatives.
// Placeholders in braces ({name}) are filled by src/lib/seo.ts.
export default {
  seo: {
    siteName: 'Lorenzo da Cunha',
    titleSuffix: ' | Lorenzo da Cunha',
    jobTitle: 'Desarrollador Shopify',
    home: {
      title: 'Lorenzo da Cunha | Desarrollador Shopify: tiendas y temas Liquid',
      description:
        'Desarrollo tiendas Shopify con foco en diseño, rendimiento y conversión: temas Liquid a medida, apps e integraciones. Shopify desde 2023, en Americana, SP.',
      imageAlt: 'Lorenzo da Cunha con suéter negro, junto a su nombre y el título Desarrollador Shopify, sobre fondo blanco',
      personDescription:
        'Desarrollador Shopify en Americana, SP: diseño de tiendas, temas Liquid y OS 2.0, apps e integraciones, rendimiento y conversión.',
      featured: 'Casos en producción',
    },
    case: {
      title: '{name}: {kind}',
      description: '{summary} Caso de {kind} en el portafolio de Lorenzo da Cunha.',
      // When the summary already names the kind of work (a VTEX migration, a landing page), the tail does not repeat it.
      descriptionPlain: '{summary} Caso en el portafolio de Lorenzo da Cunha, desarrollador Shopify.',
      // {platform}: the case platform (Shopify, Yampi, WordPress...), from projects.json.
      kind: {
        migration: 'migración de VTEX a Shopify',
        landing: 'landing page {platform}',
        liquid: 'tienda Shopify con tema Liquid',
        store: 'tienda {platform}',
        site: 'sitio en {platform}',
      },
    },
    breadcrumb: {
      home: 'Inicio',
      cases: 'Casos',
    },
    notFound: {
      title: 'Página no encontrada | Lorenzo da Cunha',
      description:
        'Esta dirección no existe o cambió de lugar. Los casos y proyectos de Lorenzo da Cunha, desarrollador Shopify, están en la página de inicio.',
      eyebrow: 'Error 404',
      titleOne: 'Página',
      titleTwo: 'no encontrada',
      text: 'La dirección puede haber cambiado o el enlace llegó incompleto. Los casos, los proyectos y el contacto siguen en la página de inicio.',
      toCases: 'Ver casos en producción',
      toHome: 'Volver al inicio',
      homeLabel: 'Lorenzo da Cunha, página de inicio',
    },
  },
};
