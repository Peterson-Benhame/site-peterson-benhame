import { access, readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import MarkdownIt from 'markdown-it';
import YAML from 'yaml';

const directory = fileURLToPath(new URL('../../content/articles/', import.meta.url));
const siteRoot = fileURLToPath(new URL('../../', import.meta.url));
const markdown = new MarkdownIt({ html: false, linkify: false, typographer: true });
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const fields = ['title', 'description', 'slug', 'category', 'tags', 'author', 'datePublished', 'dateModified', 'coverImage', 'draft'];

export function slugify(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function parseArticle(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: frontmatter YAML ausente.`);
  const document = YAML.parseDocument(match[1], { strict: true, uniqueKeys: true });
  if (document.errors.length) throw new Error(`${filename}: ${document.errors[0].message}`);
  const data = document.toJS();
  if (!data || typeof data !== 'object') throw new Error(`${filename}: frontmatter inválido.`);
  for (const field of fields) {
    if (!(field in data)) throw new Error(`${filename}: campo ${field} obrigatório.`);
  }
  for (const field of ['title', 'description', 'slug', 'category', 'author', 'datePublished', 'dateModified', 'coverImage']) {
    if (typeof data[field] !== 'string') throw new Error(`${filename}: ${field} deve ser texto.`);
  }
  if (!data.title.trim() || !data.description.trim() || !data.category.trim()) throw new Error(`${filename}: título, descrição e categoria não podem ser vazios.`);
  if (!slugPattern.test(data.slug)) throw new Error(`${filename}: slug inválido.`);
  if (data.author !== 'Peterson Benhame') throw new Error(`${filename}: autor não confirmado.`);
  if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== 'string' || !tag.trim())) throw new Error(`${filename}: tags inválidas.`);
  if (typeof data.draft !== 'boolean') throw new Error(`${filename}: draft deve ser booleano.`);
  if ('noindex' in data && typeof data.noindex !== 'boolean') throw new Error(`${filename}: noindex deve ser booleano.`);
  for (const field of ['datePublished', 'dateModified']) {
    if (!datePattern.test(data[field]) || Number.isNaN(Date.parse(`${data[field]}T00:00:00Z`)) || new Date(`${data[field]}T00:00:00Z`).toISOString().slice(0, 10) !== data[field]) throw new Error(`${filename}: ${field} inválida.`);
  }
  if (data.dateModified < data.datePublished) throw new Error(`${filename}: dateModified antecede datePublished.`);
  if (data.coverImage && !/^\/assets\/img\/[a-zA-Z0-9._-]+$/.test(data.coverImage)) throw new Error(`${filename}: coverImage deve apontar para /assets/img/.`);

  const tokens = markdown.parse(match[2], {});
  const toc = [];
  const ids = new Map();
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token.type !== 'heading_open') continue;
    if (token.tag === 'h1') throw new Error(`${filename}: o título H1 vem do frontmatter; use H2/H3 no corpo.`);
    const heading = tokens[index + 1]?.content || '';
    const base = slugify(heading) || 'secao';
    const count = ids.get(base) || 0;
    ids.set(base, count + 1);
    const id = count ? `${base}-${count + 1}` : base;
    token.attrSet('id', id);
    if (token.tag === 'h2' || token.tag === 'h3') toc.push({ id, text: heading, level: Number(token.tag[1]) });
  }
  const words = match[2].trim().split(/\s+/).filter(Boolean).length;
  if (words < 20) throw new Error(`${filename}: corpo do artigo muito curto.`);
  return {
    ...data,
    categorySlug: slugify(data.category),
    html: markdown.renderer.render(tokens, markdown.options, {}),
    toc,
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
    path: `/blog/${data.slug}/`,
  };
}

export async function loadArticles({ includeDrafts = false, sourceDirectory = directory } = {}) {
  const files = (await readdir(sourceDirectory)).filter((file) => file.endsWith('.md')).sort();
  const articles = await Promise.all(files.map(async (file) => parseArticle(await readFile(join(sourceDirectory, file), 'utf8'), file)));
  const slugs = new Set();
  for (const article of articles) {
    if (slugs.has(article.slug)) throw new Error(`Slug duplicado: ${article.slug}`);
    slugs.add(article.slug);
    if (article.coverImage) {
      try { await access(join(siteRoot, article.coverImage.slice(1))); }
      catch { throw new Error(`${article.slug}: coverImage não encontrado: ${article.coverImage}`); }
    }
  }
  return articles.filter((article) => includeDrafts || !article.draft)
    .sort((a, b) => b.datePublished.localeCompare(a.datePublished) || a.slug.localeCompare(b.slug));
}
