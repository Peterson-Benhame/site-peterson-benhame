# SEO e blog — operação técnica e editorial

## Arquitetura

O site continua em React 19, Vite 8 e GSAP. A home usa `src/App.jsx`; `scripts/prerender.mjs` gera seu HTML inicial com `renderToString`, e o navegador usa `hydrateRoot`. A página de privacidade permanece HTML estático. O blog usa componentes React em `src/blog/`, um template HTML próprio e arquivos Markdown em `content/articles/`. O mesmo componente renderiza no build e hidrata no navegador. Em desenvolvimento, o plugin do Vite serve as rotas do blog diretamente.

`src/blog/content.mjs` interpreta e valida frontmatter YAML, converte Markdown com HTML arbitrário desativado e cria âncoras de seção. `src/blog/pages.mjs` define índice, categorias e artigos publicados. O build gera um `index.html` em cada diretório de rota. `seo.config.js` centraliza a origem, os dados confirmados do autor e os metadados. O script gera `sitemap.xml`, `robots.txt` e `feed.xml` a partir da mesma lista de páginas publicadas.

As dependências adicionadas são `markdown-it` para Markdown seguro, sem HTML embutido, e `yaml` para frontmatter. Não há banco de dados ou serviço de conteúdo.

## Instalação, desenvolvimento e publicação

Use Node.js compatível com `package.json`, execute `npm ci` e depois `npm run dev`. O servidor de desenvolvimento aceita `/blog/` e as URLs dos artigos; não exige `SITE_URL`. Execute `npm run test:build` para gerar e validar `dist-test/` com uma origem reservada somente para testes.

Para gerar `dist/` publicável, configure `SITE_URL` no ambiente de deploy como a origem HTTPS real, por exemplo `https://dominio-confirmado.tld`. Não use o domínio do e-mail como suposição. O build rejeita ausência de variável, HTTP, caminho adicional, credenciais, localhost e domínios reservados de exemplo. Em PowerShell:

```powershell
$env:SITE_URL = 'https://dominio-confirmado.tld'
npm run build
npm run preview
```

Configure o host para servir a raiz de `dist/`, resolver `/blog/` e `/blog/<slug>/` para seus respectivos `index.html` e servir `/privacidade.html` como arquivo. Preserve os caminhos `/assets/`, `/sitemap.xml`, `/robots.txt` e `/feed.xml`; não reescreva todas as rotas para a home. Adicione redirecionamento de HTTP para HTTPS e escolha uma forma canônica do host no provedor. O projeto pressupõe publicação na raiz da origem, não em subdiretório.

## Criar, revisar e atualizar artigos

Crie `content/articles/<slug>.md` com frontmatter:

```yaml
---
title: "Título específico"
description: "Resumo exclusivo"
slug: "slug-unico"
category: "Validação"
tags: [startup, validação]
author: "Peterson Benhame"
datePublished: "2026-11-19"
dateModified: "2026-11-19"
coverImage: ""
draft: true
---
```

Escreva o corpo a partir de H2. A página fornece o H1. Use URLs internas absolutas a partir da raiz, como `/blog/como-criar-um-mvp/`; links externos devem apontar para fontes verificáveis. Exemplos inventados devem ser identificados como hipotéticos. Não publique números, resultados, certificações ou depoimentos sem comprovação. `coverImage` pode ficar vazio; se preenchido, deve apontar para um arquivo existente em `/assets/img/`, e a imagem será exibida no artigo.

Revise clareza da resposta inicial, utilidade dos exemplos, critérios de decisão, fontes e links. Rode `npm run test:build` e confira o HTML. Para publicar, ajuste `draft: false`, registre a data real de primeira publicação em `datePublished` e atualize `dateModified` ao modificar substancialmente o texto. Os quatro artigos iniciais usam 19/11/2026, decisão editorial fornecida para esta versão. O build exclui rascunhos de páginas, listagens, sitemap e RSS. O campo opcional `noindex: true` mantém a página acessível, mas a remove do sitemap e do RSS.

## Descoberta, autoridade e medição

Depois do deploy, abra as URLs públicas diretamente, confirme que canonical e Open Graph usam a origem final, que a imagem social responde sem autenticação e que `robots.txt`, `sitemap.xml` e `feed.xml` estão acessíveis. No Google Search Console, verifique a propriedade da origem escolhida, envie `/sitemap.xml`, inspecione a home e um artigo e acompanhe cobertura e desempenho. Dados estruturados ajudam a descrever o conteúdo, mas não garantem exibição ou indexação.

Para avaliar SEO, confira HTML sem JavaScript, títulos e descrições únicos, links internos, canonical e erros de rastreamento. Para GEO/AEO, revise se cada artigo responde à pergunta central em texto visível, identifica autor e datas, fornece fontes para afirmações factuais e mantém headings coerentes. `llms.txt` não faz parte desta versão.

O ponto de instrumentação é `window.PB_ANALYTICS(name, properties)`. Sem essa função, `trackEvent` não envia dados. Os eventos previstos são `article_view`, `mentorship_cta_click`, `application_start` e `application_submitted`. O último só é emitido após confirmação positiva do transporte atual. Antes de conectar qualquer serviço externo, defina fornecedor, política de privacidade e consentimento aplicável. Meça o funil artigo → CTA → candidatura iniciada → envio confirmado, separando envio confirmado de recebimento real na caixa de entrada.

## Performance e limites

No baseline anterior, o build gerava um bundle JavaScript de cerca de 373 kB antes de gzip; a imagem PNG do pôster atual tem 1.931.452 bytes e dimensão 1672 × 941. A nova arquitetura separa a entrada do blog, adiciona dimensões explícitas ao pôster e mantém o carregamento de frames condicionado ao desktop, à preferência de movimento e à economia de dados. Compare tamanhos de saída com `npm run test:build`; para LCP, INP e CLS, meça páginas publicadas com PageSpeed Insights/Search Console e compare dados de campo. Esses indicadores não foram medidos em tráfego real nesta entrega. O vídeo cinematográfico continua pendente no manifesto de mídia; o pôster permanece como apresentação estática.
