import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { isIndexablePage, seoTagsForPage } from '../seo.config.js';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(site, process.env.BUILD_DIR || 'dist');
const publicUrl = process.env.SITE_URL;
const readDist = (path) => readFileSync(join(dist, path), 'utf8');

function metaContent(html, attribute, value) {
  const expression = new RegExp(`<meta\\b(?=[^>]*${attribute}="${value}")(?=[^>]*content="([^"]+)")[^>]*>`, 'i');
  return html.match(expression)?.[1];
}

test('publishes absolute metadata and factual structured data', () => {
  const html = readDist('index.html');

  assert.match(html, /<title>Peterson Benhame — Mentoria para startups<\/title>/);
  assert.equal(metaContent(html, 'name', 'description'), 'Mentoria individual com Peterson Benhame para startups em ideação, validação e MVP. Seis encontros online para orientar decisões de produto e tecnologia.');
  assert.match(html, new RegExp(`<link[^>]+rel="canonical"[^>]+href="${publicUrl}/"`));
  assert.equal(metaContent(html, 'property', 'og:url'), `${publicUrl}/`);
  assert.equal(metaContent(html, 'property', 'og:image'), `${publicUrl}/assets/img/hero-poster.png`);
  assert.equal(metaContent(html, 'name', 'twitter:card'), 'summary_large_image');

  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  const graph = jsonLd.flatMap((entry) => entry['@graph'] ?? [entry]);
  const person = graph.find((entry) => entry['@type'] === 'Person');
  const service = graph.find((entry) => entry['@type'] === 'Service');

  assert.deepEqual(person?.name, 'Peterson Benhame');
  assert.deepEqual(service?.name, 'Mentoria individual para startups');
  assert.equal(graph.some((entry) => 'aggregateRating' in entry || 'review' in entry), false);
});

test('pre-renders indexable main content and keeps client hydration', () => {
  const html = readDist('index.html');
  const main = readFileSync(join(site, 'src', 'main.jsx'), 'utf8');

  assert.match(html, /<main id="conteudo">/);
  assert.match(html, /<h1 id="hero-title">/);
  assert.match(html, /Sua ideia merece/);
  assert.match(html, /<section[^>]+id="duvidas"/);
  assert.match(html, /Preciso já ter uma empresa ou um MVP\?/);
  assert.match(main, /hydrateRoot/);
});

test('publishes crawl controls and optimised media attributes', () => {
  const robots = readDist('robots.txt');
  const sitemap = readDist('sitemap.xml');
  const hero = readFileSync(join(site, 'src', 'sections', 'Hero.jsx'), 'utf8');

  assert.equal(existsSync(join(dist, 'robots.txt')), true);
  assert.equal(existsSync(join(dist, 'sitemap.xml')), true);
  assert.match(robots, new RegExp(`Sitemap: ${publicUrl}/sitemap\\.xml`));
  assert.match(sitemap, new RegExp(`<loc>${publicUrl}/</loc>`));
  assert.match(sitemap, new RegExp(`<loc>${publicUrl}/privacidade\\.html</loc>`));
  assert.match(hero, /fetchPriority="high"/);
  assert.match(hero, /decoding="async"/);
});

test('keeps the privacy page canonical and indexable', () => {
  const html = readDist('privacidade.html');

  assert.match(html, /<h1>Seu contexto merece cuidado\.<\/h1>/);
  assert.match(html, new RegExp(`<link[^>]+rel="canonical"[^>]+href="${publicUrl}/privacidade\\.html"`));
  assert.equal(metaContent(html, 'property', 'og:url'), `${publicUrl}/privacidade.html`);
});

test('marks a configured non-indexable page correctly', () => {
  const tags = seoTagsForPage({ kind: 'privacy', path: '/teste/', title: 'Teste', description: 'Página de teste', noindex: true });
  assert.equal(tags.find((tag) => tag.attrs?.name === 'robots')?.attrs.content, 'noindex,follow');
  assert.equal(isIndexablePage({ noindex: true }), false);
  assert.equal(isIndexablePage({ canonical: false }), false);
});
