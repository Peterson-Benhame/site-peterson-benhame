function summary(article) {
  const { title, description, slug, category, categorySlug, tags, datePublished, dateModified, readingMinutes, path } = article;
  return { title, description, slug, category, categorySlug, tags, datePublished, dateModified, readingMinutes, path };
}

export function blogPages(articles) {
  const categories = [...new Map(articles.map((article) => [article.categorySlug, article.category])).entries()]
    .map(([slug, name]) => ({ slug, name, path: `/blog/categoria/${slug}/`, count: articles.filter((article) => article.categorySlug === slug).length }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const list = articles.map(summary);
  const pages = [{ kind: 'index', path: '/blog/', title: 'Blog — Peterson Benhame', description: 'Artigos sobre validação de startups, MVP, produto, arquitetura de software e inteligência artificial aplicada.', articles: list, categories }];

  for (const category of categories) {
    pages.push({ kind: 'category', path: category.path, title: `${category.name} — Blog Peterson Benhame`, description: `Artigos de Peterson Benhame sobre ${category.name.toLowerCase()}.`, category, articles: list.filter((article) => article.categorySlug === category.slug), categories });
  }
  for (const [index, article] of articles.entries()) {
    const related = articles.filter((candidate) => candidate.slug !== article.slug)
      .sort((a, b) => Number(b.categorySlug === article.categorySlug) - Number(a.categorySlug === article.categorySlug)
        || b.tags.filter((tag) => article.tags.includes(tag)).length - a.tags.filter((tag) => article.tags.includes(tag)).length)
      .slice(0, 3).map(summary);
    pages.push({ kind: 'article', path: article.path, title: `${article.title} — Peterson Benhame`, description: article.description, noindex: article.noindex === true, article, related, previous: articles[index - 1] && summary(articles[index - 1]), next: articles[index + 1] && summary(articles[index + 1]), categories });
  }
  return pages;
}
