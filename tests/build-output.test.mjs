import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(site, 'dist');

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

test('emits both public HTML entrypoints with relative bundles', () => {
  for (const file of ['index.html', 'privacidade.html']) {
    assert.equal(existsSync(join(dist, file)), true, `${file} must be built`);
  }

  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  assert.match(html, /src="\.\/assets\/[^"/]+\.js"/);
  assert.match(html, /href="\.\/assets\/[^"/]+\.css"/);
  assert.doesNotMatch(html, /(?:app\.js|form\.mjs|form-config\.js)/);
});

test('copies canonical PB Cinema assets into the static output', () => {
  const expected = [
    'assets/img/logotipo-branco.png',
    'assets/img/ideia.png',
    'assets/img/validacao.png',
    'assets/img/construir-mvp.png',
    'assets/img/hero-poster.png',
    'assets/img/section-sobre.webp',
    'assets/img/favicon.ico',
    'assets/img/favicon-32x32.png',
    'assets/img/favicon-512.png',
    'assets/img/apple-touch-icon.png',
  ];

  for (const relativePath of expected) {
    assert.equal(existsSync(join(dist, relativePath)), true, `${relativePath} must be copied`);
  }
});

test('emits executable JavaScript and stylesheet bundles', () => {
  const files = readdirSync(join(dist, 'assets'));
  assert.equal(files.some((file) => file.endsWith('.js')), true);
  assert.equal(files.some((file) => file.endsWith('.css')), true);
});

test('uses one effective hero poster URL without a second preload', () => {
  const html = readFileSync(join(dist, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /<link[^>]+rel="preload"[^>]+hero-poster/i);
  const poster = html.match(/content="\.\/assets\/(hero-poster-[^"]+\.png)"/i)?.[1];
  assert.ok(poster, 'the built Open Graph image must use the hashed hero poster');

  const script = listFiles(join(dist, 'assets')).find((file) => file.endsWith('.js'));
  assert.match(readFileSync(script, 'utf8'), new RegExp(poster.replace('.', '\\.')));
});
