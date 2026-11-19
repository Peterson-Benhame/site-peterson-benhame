import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { absoluteUrl, isIndexablePage, seoPages } from '../seo.config.js';
import { loadArticles } from '../src/blog/content.mjs';
import { blogPages } from '../src/blog/pages.mjs';
import { blogHtml } from '../src/blog/render.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, process.env.BUILD_DIR || 'dist');
const escapeXml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const withoutReactPreloads = (markup) => markup.replace(/<link rel="preload"[^>]*\/>/g, '');

function injectRoot(html, markup) {
  const rendered = html.replace('<div id="root"></div>', `<div id="root">${withoutReactPreloads(markup)}</div>`);
  if (rendered === html) throw new Error('Contêiner #root ausente no HTML de entrada.');
  return rendered;
}

async function writeDiscoveryFiles(pages, articles) {
  const entries = [...Object.values(seoPages), ...pages].filter(isIndexablePage);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((page) => `  <url><loc>${escapeXml(absoluteUrl(page.path))}</loc>${page.article ? `<lastmod>${page.article.dateModified}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`;
  const items = articles.filter(isIndexablePage).map((article) => `<item><title>${escapeXml(article.title)}</title><link>${escapeXml(absoluteUrl(article.path))}</link><guid isPermaLink="true">${escapeXml(absoluteUrl(article.path))}</guid><description>${escapeXml(article.description)}</description><pubDate>${new Date(`${article.datePublished}T12:00:00Z`).toUTCString()}</pubDate></item>`).join('');
  const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Blog — Peterson Benhame</title><link>${absoluteUrl('/blog/')}</link><description>Artigos sobre validação, produto, tecnologia e IA aplicada.</description><language>pt-BR</language>${items}</channel></rss>\n`;
  await Promise.all([
    writeFile(resolve(dist, 'sitemap.xml'), sitemap),
    writeFile(resolve(dist, 'robots.txt'), robots),
    writeFile(resolve(dist, 'feed.xml'), feed),
  ]);
}

const articles = await loadArticles();
const pages = blogPages(articles);
const vite = await createServer({ root, appType: 'custom', server: { middlewareMode: true } });
try {
  const [{ default: App }, { default: BlogPage }] = await Promise.all([
    vite.ssrLoadModule('/src/App.jsx'),
    vite.ssrLoadModule('/src/blog/BlogPage.jsx'),
  ]);
  const homeFile = resolve(dist, 'index.html');
  await writeFile(homeFile, injectRoot(await readFile(homeFile, 'utf8'), renderToString(React.createElement(App))));
  const templateFile = resolve(dist, 'blog-template.html');
  const template = await readFile(templateFile, 'utf8');
  for (const page of pages) {
    const file = resolve(dist, page.path.slice(1), 'index.html');
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, blogHtml(template, page, BlogPage));
  }
  await rm(templateFile);
  await writeDiscoveryFiles(pages, articles);
} finally {
  await vite.close();
}
