import assert from 'node:assert/strict';
import test from 'node:test';
import { loadArticles } from '../src/blog/content.mjs';
import { blogPages } from '../src/blog/pages.mjs';

test('creates index, category and article pages only for published entries', async () => {
  const pages = blogPages(await loadArticles());
  assert.equal(pages.filter((page) => page.kind === 'article').length, 4);
  assert.ok(pages.some((page) => page.path === '/blog/'));
  assert.ok(pages.some((page) => page.path === '/blog/categoria/validacao/'));
  assert.ok(pages.some((page) => page.path === '/blog/como-validar-uma-ideia-de-startup/'));
  assert.ok(pages.every((page) => !page.path.includes('undefined')));
});
