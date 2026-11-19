import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArticle, loadArticles } from '../src/blog/content.mjs';

const frontmatter = `---\ntitle: "Teste"\ndescription: "Descrição de teste"\nslug: "teste"\ncategory: "Validação"\ntags: [startup]\nauthor: "Peterson Benhame"\ndatePublished: "2026-11-19"\ndateModified: "2026-11-19"\ncoverImage: ""\ndraft: false\n---\n`;

test('validates frontmatter and renders escaped Markdown with heading links', () => {
  const article = parseArticle(`${frontmatter}\n## Pergunta central\n\n<script>alert(1)</script> Este exemplo contém palavras suficientes para exercitar o parser e comprovar que o conteúdo textual continua legível depois da renderização segura.`, 'teste.md');
  assert.equal(article.slug, 'teste');
  assert.equal(article.toc[0].id, 'pergunta-central');
  assert.match(article.html, /&lt;script&gt;/);
  assert.doesNotMatch(article.html, /<script>/);
  assert.throws(() => parseArticle(frontmatter.replace('slug: "teste"', 'slug: "../teste"'), 'ruim.md'), /slug/);
  assert.throws(() => parseArticle((frontmatter + '\nEste conteúdo de teste possui mais de vinte palavras para permitir chegar até a validação de data no parser sem falhar por tamanho do texto.').replace('datePublished: "2026-11-19"', 'datePublished: "2026-02-31"'), 'ruim.md'), /datePublished/);
});

test('loads the four initial published articles without drafts', async () => {
  const articles = await loadArticles();
  assert.equal(articles.length, 4);
  assert.ok(articles.every((article) => !article.draft));
  assert.ok(articles.some((article) => article.slug === 'como-validar-uma-ideia-de-startup'));
  assert.ok(articles.some((article) => article.slug === 'como-criar-um-mvp'));
});

test('excludes valid drafts from public article loading', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'pb-blog-test-'));
  try {
    const body = '\n## Questão central\n\nEste texto de teste contém palavras suficientes para verificar a filtragem de publicação sem depender dos artigos reais nem de uma URL pública configurada.\n';
    await writeFile(join(folder, 'publico.md'), frontmatter + body);
    await writeFile(join(folder, 'rascunho.md'), frontmatter.replace('slug: "teste"', 'slug: "rascunho"').replace('draft: false', 'draft: true') + body);
    assert.deepEqual((await loadArticles({ sourceDirectory: folder })).map((article) => article.slug), ['teste']);
    assert.equal((await loadArticles({ sourceDirectory: folder, includeDrafts: true })).length, 2);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});

test('rejects an article cover whose asset does not exist', async () => {
  const folder = await mkdtemp(join(tmpdir(), 'pb-cover-test-'));
  try {
    const body = '\n## Questão central\n\nEste texto de teste contém palavras suficientes para verificar a integridade do recurso de capa mencionado no frontmatter durante o carregamento do artigo.\n';
    await writeFile(join(folder, 'sem-capa.md'), frontmatter.replace('coverImage: ""', 'coverImage: "/assets/img/inexistente.png"') + body);
    await assert.rejects(loadArticles({ sourceDirectory: folder }), /coverImage/);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});
