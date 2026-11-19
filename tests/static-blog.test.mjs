import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const dist = join(process.cwd(), process.env.BUILD_DIR || 'dist');
const read = (path) => readFileSync(join(dist, path), 'utf8');
const origin = process.env.SITE_URL;

test('emits semantic blog and article HTML for direct static URLs', () => {
  const listing = read('blog/index.html');
  const article = read('blog/como-validar-uma-ideia-de-startup/index.html');
  assert.match(listing, /<h1[^>]*>.*Blog/s);
  assert.match(listing, /como-criar-um-mvp/);
  assert.match(article, /<article\b/);
  assert.match(article, /<h1[^>]*>Como validar uma ideia de startup antes de programar<\/h1>/);
  assert.match(article, /<nav[^>]+aria-label="Índice do artigo"/);
  assert.match(article, /<section[^>]+aria-labelledby="related-title"[\s\S]*?<h3>.*?<\/h3>/);
  assert.match(article, /<link rel="canonical" href="https:\/\/.+\/blog\/como-validar-uma-ideia-de-startup\/"/);
  assert.match(article, /"@type":"BlogPosting"/);
  assert.match(article, /src="\/assets\/[^\"]+\.js"/);
});

test('publishes crawl files without drafts or template routes', () => {
  const sitemap = read('sitemap.xml');
  const robots = read('robots.txt');
  const feed = read('feed.xml');
  assert.match(sitemap, /\/blog\/como-criar-um-mvp\//);
  assert.match(sitemap, /\/blog\/categoria\/validacao\//);
  assert.doesNotMatch(sitemap, /blog-template|draft/);
  assert.match(robots, /Sitemap: https:\/\//);
  assert.match(feed, /<rss version="2\.0"/);
  assert.match(feed, /\/blog\/como-validar-uma-ideia-de-startup\//);
  assert.equal(existsSync(join(dist, 'blog-template.html')), false);
  assert.ok(origin);
});
