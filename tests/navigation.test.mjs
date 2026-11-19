import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('keeps a blog entry visible when the desktop navigation is hidden', () => {
  const header = readFileSync('src/components/Header.jsx', 'utf8');
  const css = readFileSync('style.css', 'utf8');
  assert.match(header, /mobile-blog-link[^>]+href="\/blog\/"/);
  assert.match(css, /@media\s*\(max-width:600px\)[\s\S]*?\.mobile-blog-link\s*\{\s*display:\s*inline/);
});
