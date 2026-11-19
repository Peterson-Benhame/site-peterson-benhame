import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(site, process.env.BUILD_DIR || 'dist');

function htmlFiles(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const file = join(folder, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : file.endsWith('.html') ? [file] : [];
  });
}

test('all local links and referenced HTML assets resolve in the static build', () => {
  for (const file of htmlFiles(dist)) {
    const html = readFileSync(file, 'utf8');
    const pagePath = `/${relative(dist, file).replaceAll('\\', '/')}`;
    for (const [, target] of html.matchAll(/(?:href|src)="([^"#]+(?:#[^"]*)?|#[^"]+)"/g)) {
      if (/^(?:https?:|mailto:|tel:|data:)/.test(target)) continue;
      const url = new URL(target.replaceAll('&amp;', '&'), `https://site.test${pagePath}`);
      const destination = join(dist, url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname);
      assert.equal(existsSync(destination), true, `${pagePath}: ${target} is missing`);
      if (url.hash && destination.endsWith('.html')) {
        const destinationHtml = readFileSync(destination, 'utf8');
        assert.ok(destinationHtml.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${pagePath}: ${target} anchor is missing`);
      }
    }
  }
});
