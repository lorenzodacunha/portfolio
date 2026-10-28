// Search and share copy (titles, descriptions, image alts, structured data labels) and the 404 page.
// Every claim here comes from the public site data (src/data): no metrics, no certifications, no superlatives.
// Placeholders in braces ({name}) are filled by src/lib/seo.ts.
export default {
  seo: {
    siteName: 'Lorenzo da Cunha',
    titleSuffix: ' | Lorenzo da Cunha',
    jobTitle: 'Desenvolvedor Shopify',
    home: {
      title: 'Lorenzo da Cunha | Desenvolvedor Shopify: lojas e temas Liquid',
      description:
        'Desenvolvo lojas Shopify com foco em design, performance e conversão: temas Liquid sob medida, apps e integrações. Shopify desde 2023, em Americana, SP.',
      imageAlt: 'Lorenzo da Cunha, de blusa preta, ao lado do nome e do título Desenvolvedor Shopify, sobre fundo branco',
      personDescription:
        'Desenvolvedor Shopify em Americana, SP: design de loja, temas Liquid e OS 2.0, apps e integrações, performance e conversão.',
      featured: 'Cases em produção',
    },
    case: {
      title: '{name}: {kind}',
      description: '{summary} Case de {kind} no portfolio de Lorenzo da Cunha.',
      // When the summary already names the kind of work (a VTEX migration, a landing page), the tail does not repeat it.
      descriptionPlain: '{summary} Case no portfolio de Lorenzo da Cunha, desenvolvedor Shopify.',
      // {platform}: the case platform (Shopify, Yampi, WordPress...), from projects.json.
      kind: {
        migration: 'migração da VTEX para a Shopify',
        landing: 'landing page {platform}',
        liquid: 'loja Shopify com tema Liquid',
        store: 'loja {platform}',
        site: 'site em {platform}',
      },
    },
    breadcrumb: {
      home: 'Início',
      cases: 'Cases',
    },
    notFound: {
      title: 'Página não encontrada | Lorenzo da Cunha',
      description:
        'Este endereço não existe ou mudou de lugar. Os cases e os projetos de Lorenzo da Cunha, desenvolvedor Shopify, estão na página inicial.',
      eyebrow: 'Erro 404',
      titleOne: 'Página',
      titleTwo: 'não encontrada',
      text: 'O endereço pode ter mudado ou o link chegou incompleto. Os cases, os projetos e o contato continuam na página inicial.',
      toCases: 'Ver cases em produção',
      toHome: 'Voltar ao início',
      homeLabel: 'Lorenzo da Cunha, página inicial',
    },
  },
};
