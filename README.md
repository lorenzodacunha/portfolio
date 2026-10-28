# 🌐 Portfólio Lorenzo da Cunha · v2

![Astro](https://img.shields.io/badge/Astro-BC52EE?style=for-the-badge&logo=astro&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css&logoColor=white)
![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)

A segunda versão do meu portfólio, reconstruída do zero em **Astro** com a identidade visual da marca: laranja,
amarelo e vermelho-alaranjado sobre cinza escuro, títulos em Widescreen e malhas quadriculadas que se movem com a página.

Cada case é apresentado como **um produto numa loja**: capturas reais em janela de navegador, ficha técnica com
plataforma, período e stack, e o botão para ver a loja no ar. Tudo em **português, inglês e espanhol**, com o idioma
certo carregando sozinho na primeira visita.

### Acesse o projeto por esse link 👇
[![Portfólio](https://img.shields.io/badge/Visitar%20Portfólio-FF9D2E?style=for-the-badge&logo=google-chrome&logoColor=white)](https://lorenzodacunha.com.br)

> 💡 O site é estático: o visitante recebe HTML pronto, sem banco de dados, sem cookies e sem script de análise.

---

## ✨ Funcionalidades
- **Três idiomas:** português (`/`), inglês (`/en/`) e espanhol (`/es/`), com seletor por bandeiras e detecção automática pelo idioma do navegador. A escolha do visitante fica guardada.
- **Cases como página de produto:** abrem num modal na própria home, com transição suave, e também têm página própria (`/cases/<id>/`) para busca e compartilhamento.
- **Catálogo de projetos:** 43 projetos com filtro por lojas e landing pages, ordenação por data e "Mostrar mais".
- **Cases em produção:** trilho de destaques na home, na ordem escolhida.
- **Lojas fora do ar:** o botão "Ver loja no ar" fica bloqueado, com uma dica explicando que a loja não está mais disponível.
- **Painel de desempenho:** medição do Lighthouse (celular e computador) que pode ser ligada em cada case.
- **Conteúdo +18:** imagens desfocadas até o visitante confirmar o aviso.
- **Depoimentos:** avaliações da Workana e recomendações do LinkedIn, com a nota média.
- **Contato direto pelo WhatsApp:** o formulário monta a mensagem e abre a conversa, sem servidor no meio.
- **Movimento com propósito:** malhas animadas em canvas e animações ligadas à rolagem, desligadas para quem prefere menos movimento.
- **SEO completo:** títulos e descrições por página, dados estruturados, `hreflang`, sitemap, imagem de compartilhamento e redirecionamento dos links do v1.
- **Padrão de conteúdo:** toda descrição de case segue o mesmo formato nos três idiomas, conferido automaticamente antes de cada build.
- **Segurança:** cabeçalhos de segurança e CSP na Vercel, e varredura de segredos a cada push.
- **Idade sempre atual:** calculada no build, com um deploy automático toda semana.

---

## 🛠️ Tecnologias Utilizadas
- Astro 7 (site estático, rotas por idioma)
- TypeScript
- CSS3 (tokens do design system LZ, animações por rolagem e View Transitions)
- JSON (conteúdo e traduções)
- Canvas API (malhas animadas)
- Vercel (hospedagem, cabeçalhos e redirecionamentos)
- GitHub Actions (gitleaks e deploy semanal)
- Adobe Fonts (Widescreen) e Google Fonts (Poppins), servidas sem bloquear a página
- Figma (planejamento visual)
- Git/GitHub (controle de versão)

---

## 📂 Estrutura do Projeto
```
/
├── astro.config.mjs        # Idiomas, sitemap, fontes e build
├── vercel.json             # Cabeçalhos de segurança, cache e redirecionamentos
├── package.json
├── README.md
│
├── docs/
│   └── desenvolvimento.md  # Guia técnico: rodar, conteúdo, padrão das descrições, Vercel, SEO
│
├── public/                 # Arquivos servidos como estão
│   ├── assets/
│   │   ├── brand/          # Logotipo, retrato e mascote
│   │   ├── companies/      # Logos da trajetória e dos parceiros
│   │   ├── flags/          # Bandeiras do seletor de idioma
│   │   ├── projects/       # Capturas dos cases (1280 px e 640 px)
│   │   ├── shapes/         # Formas da marca
│   │   └── social/         # Ícones das redes
│   ├── og/                 # Imagem de compartilhamento
│   └── robots.txt
│
├── scripts/                # Rotinas do build
│   ├── check-descriptions.mjs   # Confere o padrão das descrições
│   ├── description-rules.mjs    # As regras do padrão (também usadas pelo Portfolio Uploader)
│   ├── measure-performance.mjs  # Mede as lojas com o Lighthouse
│   └── og-image.mjs             # Gera a imagem de compartilhamento
│
├── src/
│   ├── data/               # Conteúdo em JSON: projetos, depoimentos, trajetória, serviços
│   ├── i18n/               # Textos da interface (pt-br, en, es)
│   ├── components/         # Seções da home, case, cards e SEO
│   ├── layouts/            # Estrutura das páginas
│   ├── lib/                # Leitura do conteúdo, SEO e ícones
│   ├── pages/              # Home, cases e 404, por idioma
│   ├── scripts/            # Modal dos cases, malhas, trilhos e painel de desempenho
│   └── styles/             # Design system LZ e estilos do site
│
└── .github/workflows/      # Checks: gitleaks e deploy semanal
```

---

## 🚀 Rodando localmente
Requisito: Node 22.12 ou mais novo.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # gera dist/
```

Variáveis de ambiente, conteúdo, padrão das descrições, publicação e SEO estão no
**[guia de desenvolvimento](docs/desenvolvimento.md)**.

Os projetos também podem ser cadastrados pelo
**[Portfolio Uploader](https://github.com/lorenzodacunha/portfolio-uploader)**, que grava direto nos arquivos deste
repositório.

---

## 🕰️ Versão anterior (v1)
O portfólio v1, feito em HTML, CSS e JavaScript puro, continua disponível para consulta:

- **Código:** branch [`v1`](https://github.com/lorenzodacunha/portfolio/tree/v1) (tag `v1.0.0` no último commit dele)
- **Site:** `v1.lorenzodacunha.com.br`, publicado a partir do branch `v1`

Os links antigos de projetos (`?id=` e `?projeto=`) levam ao case correspondente no v2.

---

## 📜 Licença
Este repositório **não possui licença pública**.  
Todos os direitos autorais estão reservados ao autor.  
Você pode visualizar o código, mas **não é permitido copiar, modificar ou distribuir** este projeto sem autorização prévia.

---

## 📬 Contato
- **LinkedIn:** [linkedin.com](https://www.linkedin.com/in/lorenzodacunha/)
- **Workana:** [workana.com](https://www.workana.com/freelancer/16c0158b6a790fe3cc607933882390bf)
- **GitHub:** [github.com](https://github.com/lorenzodacunha)
- **Portfólio:** [lorenzodacunha.com.br](https://lorenzodacunha.com.br)
- **E-mail:** contato@lorenzodacunha.com.br
