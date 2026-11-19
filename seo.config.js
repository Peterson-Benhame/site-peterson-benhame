export function validateSiteUrl(value, { allowTestOrigin = false } = {}) {
  try {
    const url = new URL(value);
    const reserved = /(^localhost$|\.localhost$|\.local$|\.invalid$|\.test$|\.example$|^example\.(com|org|net)$|^127\.|^10\.|^192\.168\.)/.test(url.hostname);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash || (reserved && !allowTestOrigin)) throw new Error('invalid origin');
    return url.origin;
  } catch {
    throw new Error('SITE_URL deve ser uma origem HTTPS pública, sem caminho, credenciais, consulta ou fragmento.');
  }
}

export const siteUrl = process.env.SITE_URL ? validateSiteUrl(process.env.SITE_URL, { allowTestOrigin: process.env.BUILD_DIR === 'dist-test' }) : null;
export const author = {
  name: 'Peterson Benhame',
  description: 'Desenvolvedor de software sênior com experiência em arquitetura, inteligência artificial e construção de produtos.',
  linkedin: 'https://www.linkedin.com/in/peterson-benhame-a9a1b6b5/',
};
export const seoPages = {
  home: { kind: 'home', path: '/', title: 'Peterson Benhame — Mentoria para startups', description: 'Mentoria individual com Peterson Benhame para startups em ideação, validação e MVP. Seis encontros online para orientar decisões de produto e tecnologia.' },
  privacy: { kind: 'privacy', path: '/privacidade.html', title: 'Privacidade — Peterson Benhame', description: 'Como são utilizadas as informações enviadas na candidatura à mentoria de Peterson Benhame.' },
};

export function absoluteUrl(path = '/') {
  if (!siteUrl) throw new Error('SITE_URL é obrigatório para gerar URLs públicas.');
  return new URL(path, `${siteUrl}/`).toString();
}

export const isIndexablePage = (page) => !page.noindex && page.canonical !== false;

const personId = () => `${absoluteUrl('/')}#peterson-benhame`;
const personSchema = () => ({ '@type': 'Person', '@id': personId(), name: author.name, url: absoluteUrl('/#sobre'), jobTitle: 'Desenvolvedor de software sênior', description: author.description, sameAs: [author.linkedin] });
const breadcrumbSchema = (page) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Início', item: absoluteUrl('/') },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog/') },
    ...(page.kind === 'category' ? [{ '@type': 'ListItem', position: 3, name: page.category.name, item: absoluteUrl(page.path) }] : []),
    ...(page.kind === 'article' ? [
      { '@type': 'ListItem', position: 3, name: page.article.category, item: absoluteUrl(`/blog/categoria/${page.article.categorySlug}/`) },
      { '@type': 'ListItem', position: 4, name: page.article.title, item: absoluteUrl(page.path) },
    ] : []),
  ],
});

function schema(page) {
  const graph = [personSchema()];
  if (page.kind === 'home') graph.push({ '@type': 'Service', '@id': `${absoluteUrl('/')}#mentoria-para-startups`, name: 'Mentoria individual para startups', serviceType: 'Mentoria para startups em ideação, validação e MVP', description: seoPages.home.description, url: absoluteUrl('/'), provider: { '@id': personId() } });
  if (page.kind === 'index') graph.push({ '@type': 'Blog', '@id': `${absoluteUrl('/blog/')}#blog`, name: 'Blog — Peterson Benhame', url: absoluteUrl('/blog/'), author: { '@id': personId() } });
  if (page.kind === 'category' || page.kind === 'article') graph.push(breadcrumbSchema(page));
  if (page.kind === 'article') graph.push({
    '@type': 'BlogPosting', '@id': `${absoluteUrl(page.path)}#artigo`, headline: page.article.title, description: page.article.description,
    mainEntityOfPage: absoluteUrl(page.path), datePublished: page.article.datePublished, dateModified: page.article.dateModified,
    author: { '@id': personId() }, publisher: { '@id': personId() },
    ...(page.article.coverImage ? { image: absoluteUrl(page.article.coverImage) } : {}),
  });
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function seoTagsForPage(page) {
  const image = absoluteUrl(page.article?.coverImage || '/assets/img/hero-poster.png');
  const url = absoluteUrl(page.path);
  const tags = [
    { tag: 'meta', attrs: { name: 'description', content: page.description } },
    { tag: 'meta', attrs: { name: 'robots', content: page.noindex ? 'noindex,follow' : 'index,follow' } },
    { tag: 'link', attrs: { rel: 'canonical', href: url } },
    { tag: 'meta', attrs: { property: 'og:type', content: page.kind === 'article' ? 'article' : 'website' } },
    { tag: 'meta', attrs: { property: 'og:locale', content: 'pt_BR' } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: author.name } },
    { tag: 'meta', attrs: { property: 'og:title', content: page.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: page.description } },
    { tag: 'meta', attrs: { property: 'og:url', content: url } },
    { tag: 'meta', attrs: { property: 'og:image', content: image } },
    { tag: 'meta', attrs: { property: 'og:image:alt', content: 'Composição visual da mentoria Peterson Benhame' } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: page.title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: page.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
    { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(schema(page)).replace(/</g, '\\u003c') },
  ];
  if (page.kind === 'article') tags.push(
    { tag: 'meta', attrs: { property: 'article:published_time', content: page.article.datePublished } },
    { tag: 'meta', attrs: { property: 'article:modified_time', content: page.article.dateModified } },
  );
  if (['index', 'category', 'article'].includes(page.kind)) tags.push({ tag: 'link', attrs: { rel: 'alternate', type: 'application/rss+xml', title: 'Blog Peterson Benhame', href: absoluteUrl('/feed.xml') } });
  return tags;
}

export const seoTags = (pageKey) => seoTagsForPage(seoPages[pageKey]);

const escapeAttribute = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export function renderSeoTags(page) {
  return seoTagsForPage(page).map(({ tag, attrs, children }) => {
    const attributes = Object.entries(attrs).map(([name, value]) => `${name}="${escapeAttribute(value)}"`).join(' ');
    return children === undefined ? `<${tag} ${attributes}>` : `<${tag} ${attributes}>${children}</${tag}>`;
  }).join('\n    ');
}
