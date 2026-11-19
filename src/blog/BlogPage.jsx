import { useEffect, useRef } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { trackEvent } from '../lib/analytics.js';
import AuthorProfile from './AuthorProfile.jsx';

const formatDate = (value) => new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T00:00:00Z`));

function ArticleCard({ article, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`;
  return (
    <article className="blog-card">
      <a className="blog-card-link" href={article.path}>
        <span className="blog-card-category">{article.category}</span>
        <Heading>{article.title}</Heading>
        <p>{article.description}</p>
        <span className="blog-card-meta"><time dateTime={article.datePublished}>{formatDate(article.datePublished)}</time> · {article.readingMinutes} min de leitura</span>
        <span aria-hidden="true" className="blog-card-arrow">↗</span>
      </a>
    </article>
  );
}

function Categories({ categories, current }) {
  return (
    <nav aria-label="Categorias do blog" className="blog-categories">
      <a aria-current={!current ? 'page' : undefined} href="/blog/">Todos</a>
      {categories.map((category) => <a aria-current={current === category.slug ? 'page' : undefined} href={category.path} key={category.slug}>{category.name} <span>{category.count}</span></a>)}
    </nav>
  );
}

function Listing({ page }) {
  return (
    <>
      <div className="blog-heading">
        <span className="eyebrow">IDEIAS · PRODUTO · TECNOLOGIA</span>
        <h1>{page.kind === 'category' ? page.category.name : 'Blog'}</h1>
        <p>{page.kind === 'category' ? `Artigos sobre ${page.category.name.toLowerCase()} para orientar decisões de produto e negócio.` : 'Perguntas melhores, testes mais claros e decisões de tecnologia fundamentadas.'}</p>
      </div>
      <Categories categories={page.categories} current={page.category?.slug} />
      <div className="blog-grid">{page.articles.map((article) => <ArticleCard article={article} key={article.slug} />)}</div>
    </>
  );
}

function Article({ page }) {
  const { article } = page;
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    trackEvent('article_view', { slug: article.slug });
  }, [article.slug]);

  return (
    <>
      <nav aria-label="Breadcrumb" className="blog-breadcrumbs"><a href="/">Início</a><span aria-hidden="true">/</span><a href="/blog/">Blog</a><span aria-hidden="true">/</span><a href={`/blog/categoria/${article.categorySlug}/`}>{article.category}</a></nav>
      <article className="blog-article">
        <header className="blog-article-header">
          <span className="eyebrow">{article.category}</span>
          <h1>{article.title}</h1>
          <p>{article.description}</p>
          <div className="blog-byline"><span>Por <a href="/#sobre">Peterson Benhame</a></span><span>Publicado em <time dateTime={article.datePublished}>{formatDate(article.datePublished)}</time></span>{article.dateModified !== article.datePublished && <span>Atualizado em <time dateTime={article.dateModified}>{formatDate(article.dateModified)}</time></span>}<span>{article.readingMinutes} min de leitura</span></div>
          {article.coverImage && <img alt="" className="blog-cover" decoding="async" src={article.coverImage} />}
        </header>
        <div className="blog-article-layout">
          <div className="blog-prose" dangerouslySetInnerHTML={{ __html: article.html }} />
          <aside className="blog-sidebar"><nav aria-label="Índice do artigo"><strong>Neste artigo</strong><ol>{article.toc.map((item) => <li className={item.level === 3 ? 'nested' : undefined} key={item.id}><a href={`#${item.id}`}>{item.text}</a></li>)}</ol></nav></aside>
        </div>
        <div className="blog-article-end">
          <div className="blog-cta"><span className="eyebrow">MENTORIA PARA STARTUPS</span><h2>Transforme a próxima pergunta em uma decisão.</h2><p>Converse sobre as hipóteses, o produto e as escolhas técnicas que fazem sentido para o seu momento.</p><a className="button primary" href="/#candidatura" onClick={() => trackEvent('mentorship_cta_click', { source: article.slug })}>Conhecer a mentoria e candidatar-me ↗</a></div>
          <AuthorProfile />
        </div>
      </article>
      <nav aria-label="Navegação entre artigos" className="blog-adjacent">{page.previous && <a href={page.previous.path}><span>← Artigo anterior</span>{page.previous.title}</a>}{page.next && <a href={page.next.path}><span>Próximo artigo →</span>{page.next.title}</a>}</nav>
      <section aria-labelledby="related-title" className="blog-related"><h2 id="related-title">Continue explorando</h2><div className="blog-grid">{page.related.map((item) => <ArticleCard article={item} headingLevel={3} key={item.slug} />)}</div></section>
      <p className="blog-return"><a href="/blog/">← Voltar ao blog</a></p>
    </>
  );
}

export default function BlogPage({ page }) {
  return <><a className="skip-link" href="#conteudo">Pular para o conteúdo</a><Header /><main className="blog-main" id="conteudo">{page.kind === 'article' ? <Article page={page} /> : <Listing page={page} />}</main><Footer /></>;
}
