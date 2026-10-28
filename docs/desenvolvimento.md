# Guia de desenvolvimento

Tudo o que é preciso para rodar, editar e publicar o portfólio v2. A apresentação do projeto está no
[README](../README.md).

Site estático em Astro 7, publicado na Vercel, com o conteúdo em arquivos JSON (`src/data`), como no v1. Não há
banco nem servidor: o visitante recebe HTML pronto. O formulário de contato abre o WhatsApp do Lorenzo com a mensagem escrita; o site
não grava nada, não tem script de análise e não usa cookies.

## Rodar localmente

Requisito: Node 22.12 ou mais novo.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # gera dist/
npm run preview    # serve o dist/ gerado
```

No Windows com o Controle Inteligente de Aplicativos ligado, o compilador nativo do Astro é bloqueado;
`scripts/ensure-compiler.mjs` roda sozinho antes do `dev` e do `build` e troca pela versão WebAssembly.

O log do build mostra quantos projetos entraram em cada idioma: `[content] pt-br: 43 projects`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha. Na Vercel, as mesmas variáveis vão em Settings > Environment
Variables.

| variável | onde é usada | pública? |
|---|---|---|
| `PERSON_BIRTH_DATE` | build, calcula a idade do Sobre mim (só o número vai para a página) | não |
| `PUBLIC_PSI_API_KEY` | navegador, painel de desempenho ao vivo (opcional) | sim, restrita por referenciador |

## Conteúdo

Todo o conteúdo está em `src/data`. Para mudar o site, edite o JSON (ou use o
[Portfolio Uploader](https://github.com/lorenzodacunha/portfolio-uploader), que grava nos mesmos arquivos e
imagens), faça o commit e o push: a Vercel publica sozinha. As páginas leem os dados só por `src/lib/content.ts`, e os campos de cada arquivo estão em
`src/lib/types.ts`.

| arquivo | o que tem |
|---|---|
| `projects.json` | os cases (destaques e catálogo), na ordem da lista |
| `reviews.json` | depoimentos |
| `certificates.json`, `experience.json` | formação e trajetória |
| `services.json`, `home.json` | serviços, fatos do Sobre mim, números e textos da home |
| `profile.json` | redes, contato (e-mail, telefone e o WhatsApp do formulário) e parceiros |
| `performance.json` | medição do Lighthouse de cada loja, gerada por `npm run measure`; só aparece nos cases com `performance: true` no `projects.json` (hoje nenhum) |

Os textos fixos da interface (títulos, botões, rótulos) ficam em `src/i18n/<idioma>/` (`pt-br`, `en`, `es`), com as mesmas chaves nos três.

### `projects.json`

Os 43 projetos vieram do v1 (branch `v1` deste repositório, `data/projects/*.json` e
`assets/images/projects`) em 27/10/2026: descrição completa nos três idiomas, todas as imagens, datas, link e stack.
O `id` é imutável e também é a URL do case (`/cases/<id>/`).

| campo | tipo | observação |
|---|---|---|
| `legacyId` | string | id do site antigo (`?id=prj_...`), para o redirecionamento |
| `featured`, `order` | boolean, number ou null | cases em destaque e a ordem deles |
| `title`, `platform`, `period` | string | `period` já escrito em cada idioma (`period_en`, `period_es`) |
| `badge` | string, opcional | selo no card; nenhum projeto importado tem |
| `sort` | number | aaaamm do fim do período, só para ordenar o catálogo |
| `type` | `loja` ou `landing` | |
| `tone` | `brand`, `light`, `strong`, `dark` ou vazio | fundo de estúdio do card |
| `summary` | string | uma linha no card e abaixo do título do case (a primeira linha da descrição antiga) |
| `description` | HTML | o texto do case, no padrão abaixo ("Padrão das descrições") |
| `role` | string | "Minha atuação", obrigatório quando há `partner` |
| `stack` | lista de string | |
| `url` | string | loja no ar; vazio esconde "Ver loja no ar" |
| `offline` | boolean | a loja saiu do ar: o botão aparece bloqueado, com a dica "Esta loja não está mais disponível."; o `url` fica só no dado |
| `partner` | string | chave em `profile.partners`; vazio é projeto solo |
| `performance` | boolean | mostra o painel de desempenho (Lighthouse) no case; nunca aparece com a loja `offline` |
| `example`, `adult` | boolean | `adult` nunca aparece em destaque; as imagens ficam desfocadas até o visitante confirmar o aviso de +18 |
| `images` | lista de `{ src, width, height }` | `src` como `/assets/projects/<id>-1.webp`; sem `alt`, o site escreve "Captura de {título}, imagem 1 de 8" no idioma da página |

No modal da home, a descrição não vai junto com a página: o modal lê a descrição na página do próprio case
quando o case abre (ou já quando o cursor passa pelo card), para a home não carregar o texto dos 43 cases.

Imagens dos cases em `public/assets/projects/`, em WebP, com 1280 px de largura e uma cópia de 640 px com
`-640` no fim do nome (`aurora-tecidos-1.webp` e `aurora-tecidos-1-640.webp`): o card usa a menor, o case usa a
maior.

### Padrão das descrições

Toda descrição de case segue o mesmo padrão, nos três idiomas. O `scripts/check-descriptions.mjs` confere tudo antes
de cada build (e sozinho com `npm run check:content`); o que sair do padrão para o build e mostra o projeto, o idioma
e a regra. As regras ficam em `scripts/description-rules.mjs`, o mesmo módulo que o Portfolio Uploader usa antes de
salvar: mudou uma regra ali, mudou nos dois.

**Seções.** O texto é dividido em seções, sempre com estes nomes e nesta ordem:

| ordem | português | inglês | espanhol | |
|---|---|---|---|---|
| 1 | Visão geral | Overview | Visión general | opcional |
| 2 | Contexto e objetivo | Context and objective | Contexto y objetivo | obrigatória |
| 3 | O desafio | The challenge | El desafío | obrigatória |
| 4 | A estratégia | The strategy | La estrategia | opcional |
| 5 | O que foi implementado | What was implemented | Lo que se implementó | obrigatória |
| 6 | Resultado | Result | Resultado | obrigatória |

Um case pequeno usa só as quatro obrigatórias; as opcionais entram quando o projeto tem visão geral ou estratégia
para contar. Nenhuma seção é inventada para completar a lista.

**Regra dos títulos.**

1. Título de seção (`<h2>`): exatamente um dos nomes da tabela, em texto puro: sem negrito, emoji, número,
   dois-pontos ou outra pontuação.
2. Subtítulo dentro de uma seção: um parágrafo só com negrito, `<p><strong>Otimização de imagens:</strong></p>`,
   seguido da lista ou do parágrafo que ele apresenta.
3. Rótulo de item de lista: negrito no começo do item, `<li><strong>Galeria clara:</strong> imagens com miniaturas
   laterais.</li>`.
4. Subtítulos e rótulos: maiúscula só na primeira palavra e em nomes próprios ("Integração com a API da Frenet:",
   não "Integração com a API Da Frenet"), terminam em dois-pontos, até nove palavras, sem número na frente ("1. Home")
   e sem emoji.

**Texto.**

- Tags permitidas: `p`, `h2`, `ul`, `ol`, `li`, `strong` e `em`, sem atributos. Sem `<br>`: cada parágrafo é um
  bloco de texto corrido.
- Negrito só em subtítulos e rótulos de item, nunca no meio de uma frase nem numa frase inteira de destaque.
- Sem emoji e sem travessão (— ou –); no lugar, vírgula, dois-pontos ou parênteses.
- "O que foi implementado" fica em texto corrido num case pequeno e em grupos (subtítulo e lista) quando há várias
  frentes de trabalho.
- As três versões têm a mesma estrutura: as mesmas seções, o mesmo número de subtítulos, de rótulos e de itens.
- O resumo (`summary`) é texto puro, com as partes separadas por " | ", sem emoji nem travessão.

### `reviews.json` e `certificates.json`

Depoimentos: `name` (o nome completo fica no arquivo; o site mostra só o primeiro nome e a inicial do segundo, "Fernanda C."), `role`, `source`, `sourceUrl`, `rating` (1 a 5; 0 é recomendação do LinkedIn), `when`,
`text` (parágrafos separados por `\n`). Certificados: `status`, `live` (opcional, curso em andamento), `title`,
`where`.

### Idiomas

O site existe em português (`/`), inglês (`/en/`) e espanhol (`/es/`), com as mesmas páginas: a home e um case por
projeto (`/cases/<id>/`, `/en/cases/<id>/`, `/es/cases/<id>/`). O seletor de idioma (bandeiras do Brasil, dos Estados Unidos e da
Espanha, do pacote `country-flag-icons`, MIT, em `public/assets/flags/`) fica na navegação e leva para a mesma página
no outro idioma. A 404 é uma só, em português.

Na primeira visita, uma página em português leva quem tem o navegador em inglês ou espanhol para a mesma página em
`/en/` ou `/es/`, antes de pintar (script no `<head>` de `src/layouts/Base.astro`). A escolha feita no seletor fica
guardada no navegador (`localStorage`, chave `lz-lang`) e vale mais que o idioma do navegador. Robôs de busca não são
redirecionados, para o Google continuar vendo as três versões, e os links antigos (`?id=`, `?projeto=`) passam primeiro
pelo redirecionamento deles.

Nos JSON, cada campo de texto tem irmãos com o idioma no fim do nome; o campo sem sufixo é o português e vale
como reserva quando falta a tradução:

```
summary, summary_en, summary_es
description, description_en, description_es
facts, facts_en, facts_es      (listas também)
```

O `src/lib/content.ts` entrega a cada página o campo do idioma dela. Para um idioma novo: a pasta em `src/i18n/`, os
campos `_<idioma>` nos JSON e o idioma em `i18n.locales` no `astro.config.mjs` (o `hreflang`, o sitemap e o seletor
acompanham essa lista).

## Formulário de contato

O formulário confere os campos no navegador e, ao enviar, abre `https://wa.me/<número>` com a mensagem pronta:
uma saudação e uma linha por campo preenchido, com os rótulos que o visitante viu. O visitante envia pelo próprio
WhatsApp (app no celular, WhatsApp Web no computador). O número é `contact.whatsapp` em `src/data/profile.json`,
só dígitos, com o código do país. Se o WhatsApp não abrir, a mensagem de status traz um link para a mesma conversa,
e os dados continuam no formulário. O formulário não pede o WhatsApp do visitante: a mensagem já sai do número dele.

## Publicar na Vercel

1. Em [vercel.com](https://vercel.com), Add New > Project, importe o repositório do GitHub. A Vercel reconhece o
   Astro: build `npm run build`, saída `dist`. Não precisa de adaptador, o site é estático.
2. Settings > Environment Variables: `PERSON_BIRTH_DATE` (aaaa-mm-dd) em Production e Preview, e
   `PUBLIC_PSI_API_KEY`, se houver.
3. Settings > Domains: `lorenzodacunha.com.br` como principal e `www.lorenzodacunha.com.br` redirecionando
   para ele. O v1 usava o `www`; o v2 usa o domínio sem `www` como canônico.
4. O `vercel.json` já define: barra no fim das URLs, cache longo e imutável para `/_astro/`, uma semana para
   `/assets/` e `/og/`, e os cabeçalhos de segurança (CSP, Referrer-Policy, Permissions-Policy, nosniff,
   X-Frame-Options, HSTS). Se um serviço novo entrar no site, o domínio dele precisa entrar na
   `Content-Security-Policy`. A Vercel serve a `404.html` sozinha para endereço desconhecido.
5. Idade sempre atual: a idade do Sobre mim é calculada no build, então o site precisa ser reconstruído de vez em
   quando. Em Settings > Git > Deploy Hooks, crie um gancho para a `main` e salve a URL no GitHub como secret
   `VERCEL_DEPLOY_HOOK` (Settings > Secrets and variables > Actions). O `.github/workflows/checks.yml` chama esse
   gancho toda segunda-feira, e também à mão (Actions > Checks > Run workflow). O GitHub pausa agendamentos de
   repositórios públicos sem atividade por 60 dias; se isso acontecer, reative em Actions.

O mesmo workflow roda o gitleaks no histórico a cada push.

## Versão anterior (v1)

O site em HTML, CSS e JavaScript continua no branch `v1` (e na tag `v1.0.0`, que marca o último commit dele), para
consulta. Para mantê-lo no ar sem misturar com o v2, ele tem um projeto próprio na Vercel:

1. Add New > Project, importe este mesmo repositório com outro nome (por exemplo `portfolio-v1`).
2. Settings > Git > Production Branch: `v1`. Framework Preset: Other, sem comando de build.
3. Settings > Domains: `v1.lorenzodacunha.com.br`. No DNS do domínio, um registro CNAME `v1` para
   `cname.vercel-dns.com`.

O projeto principal segue publicando só o `main`. Os dois são independentes: as configurações de build de um não
afetam o outro.

## Chave do PageSpeed Insights

Opcional. Sem ela, o painel de desempenho dos cases mostra a medição guardada em `src/data/performance.json`.
Para medir ao vivo, crie no Google Cloud (APIs e serviços > Credenciais) uma chave só com a PageSpeed Insights API,
restrita por referenciador HTTP (`lorenzodacunha.com.br/*` e `www.lorenzodacunha.com.br/*`), e coloque em
`PUBLIC_PSI_API_KEY`.

## Redirecionamentos

- Links do site antigo: `/?id=<legacyId>` e `/?projeto=<slug>` (slug = título sem acento, espaços viram
  hífen, minúsculo, como o site antigo fazia) levam ao case em `/cases/<id>/`. Um script mínimo no `<head>` da
  home faz isso (`src/components/seo/LegacyRedirect.astro`), com o mapa montado no build a partir dos projetos.
  Projeto desconhecido vai para o catálogo (`/#projetos`).
- `www` para o domínio sem `www`: configurado na Vercel (passo 3 de "Publicar na Vercel").
- Sem barra no fim (`/cases/aurora-tecidos`) redireciona para com barra (`/cases/aurora-tecidos/`).

## Fontes

- Nome no hero e na imagem de compartilhamento: o logotipo `logo-name.svg` da marca (`src/assets/brand/`), em
  SVG inline na cor do texto, não uma fonte. O `h1` guarda "Lorenzo da Cunha" como texto para leitores de tela e busca.
- Títulos: Widescreen Mixed, do kit `rck3lnu` do Adobe Fonts, carregado em `src/layouts/Base.astro`
  (`https://use.typekit.net/rck3lnu.css`) sem segurar a primeira pintura: entra como `preload` e vira folha de
  estilo quando chega, então os títulos aparecem por um instante na Syncopate e depois trocam. A licença do Adobe
  Fonts exige que a fonte venha dos servidores da Adobe, então ela não é hospedada no site. A CSP do
  `vercel.json` libera `use.typekit.net` e `p.typekit.net`.
- No painel do kit, "Font display" em `swap` evita que os títulos fiquem invisíveis enquanto a fonte baixa (com o
  padrão `auto`, o navegador esconde o texto por até 3 s).
- No painel do kit (fonts.adobe.com, Web Projects), a lista de domínios precisa incluir `lorenzodacunha.com.br`
  e `www.lorenzodacunha.com.br` (e `localhost` para testar), senão a Adobe não entrega a fonte e os títulos caem
  na Syncopate.
- Corpo: Poppins; reserva dos títulos: Syncopate; nota do painel de desempenho: Roboto Mono. As três são do
  Google Fonts, baixadas no build e servidas pelo próprio site (`astro.config.mjs`).
- Enquanto a fonte de títulos carrega, o letreiro decorativo do hero fica oculto (no máximo 3 s) para a troca de
  fonte não deslocar a página.
- `scripts/og-image.mjs` gera a imagem de compartilhamento com a mesma fonte; ele serve o template por
  `http://127.0.0.1` porque a Adobe não entrega o kit para páginas abertas como arquivo.

## SEO

O que o site já entrega (`src/lib/seo.ts`, `src/components/seo/Head.astro`, textos em
`src/i18n/pt-br/seo.ts`):

- título e descrição únicos por página, escritos a partir dos dados (nada de métrica, certificação ou
  superlativo que não esteja no site);
- canonical absoluto com barra no fim, `robots` com `max-image-preview:large` (a 404 é `noindex`),
  `hreflang` `pt-BR` e `x-default`;
- Open Graph e Twitter card: cada idioma da home tem a sua imagem, no visual do hero (`public/og/home.jpg`,
  `home-en.jpg` e `home-es.jpg`, 1200 x 630, geradas por `node scripts/og-image.mjs` com os textos do hero de cada
  idioma); cada case usa a primeira imagem dele. Ao trocar as imagens, suba o `?v=` de `HOME_OG` em `src/lib/seo.ts`,
  porque as prévias do WhatsApp, do Discord e do LinkedIn guardam a imagem pelo endereço;
- dados estruturados, um `@graph` por página: na home, `WebSite`, `ProfilePage` com a `Person`, a
  `Organization` (Lorenzo da Cunha LTDA, CNPJ do rodapé) e a `ItemList` dos cases em destaque; em cada case,
  `WebPage`, `CreativeWork` e `BreadcrumbList` (Início > Cases > case);
- `sitemap-index.xml` (sem a 404) e `robots.txt` apontando para ele.

Checklist depois do primeiro deploy:

1. [Google Search Console](https://search.google.com/search-console): adicione a propriedade de **domínio**
   `lorenzodacunha.com.br`, verificada por registro TXT no DNS (cobre `www` e sem `www`).
2. Sitemaps > envie `https://lorenzodacunha.com.br/sitemap-index.xml`.
3. Inspeção de URL na home e em um case > Solicitar indexação.
4. [Teste de pesquisa aprimorada](https://search.google.com/test/rich-results) na home e em um case: sem
   erros. O [validador do schema.org](https://validator.schema.org) mostra o grafo inteiro.
5. Teste um link antigo (`https://www.lorenzodacunha.com.br/?id=prj_19c970353505a014b2c`): deve terminar
   em `/cases/aurora-tecidos/`.
6. Prévia de compartilhamento: [Sharing Debugger](https://developers.facebook.com/tools/debug/) e
   [Post Inspector](https://www.linkedin.com/post-inspector/).
7. Depois de algumas semanas, em Search Console > Páginas, confira que as URLs antigas com `?id=` saíram e
   que os cases foram indexados.

Para trocar a imagem de compartilhamento da home, edite o modelo em `scripts/og-image.mjs` e rode
`node scripts/og-image.mjs` (usa um Chrome com depuração remota pelo `dev-browser`, ou
`--chrome <caminho do chrome>`).

## Segredos fora do repositório

- O `.env` está no `.gitignore`; na Vercel, os valores ficam nas Environment Variables. A data de nascimento
  nunca entra em arquivo versionado.
- [gitleaks](https://github.com/gitleaks/gitleaks) roda no workflow de checks e deve rodar antes de cada commit.
  Instale (`winget install gitleaks` ou `brew install gitleaks`) e crie `.git/hooks/pre-commit`:

  ```sh
  #!/bin/sh
  gitleaks git --pre-commit --staged --redact --verbose
  ```

  As regras ficam em `.gitleaks.toml` (as padrão do gitleaks).

## Em aberto

- **Imagem de compartilhamento dos cases**: é a primeira captura, em WebP. Nem toda rede mostra WebP na prévia; se o
  WhatsApp ou o LinkedIn não mostrarem, gerar um JPEG por case.
- **PageSpeed ao vivo**: o painel liga por case (`performance`); quando algum case usar, a chave no navegador
  funciona com restrição por referenciador.
