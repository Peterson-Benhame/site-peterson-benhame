import { cp, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { seoTags, siteUrl, validateSiteUrl } from './seo.config.js';
import { loadArticles } from './src/blog/content.mjs';
import { blogPages } from './src/blog/pages.mjs';
import { blogHtml } from './src/blog/render.mjs';

const root = dirname(fileURLToPath(import.meta.url));

function copyAssetsPlugin(outDir) {
  return {
    name: 'copy-assets',
    apply: 'build',
    async closeBundle() {
      await cp(resolve(root, 'assets'), resolve(root, outDir, 'assets'), {
        recursive: true,
      });
    },
  };
}

function seoPlugin() {
  return {
    name: 'seo-metadata',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        if (html.includes('id="page-data"') || !siteUrl) return html;
        const pageKey = context.filename?.endsWith('privacidade.html') ? 'privacy' : 'home';
        return { html, tags: seoTags(pageKey) };
      },
    },
  };
}

function blogDevPlugin() {
  return {
    name: 'blog-dev-pages',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const path = new URL(request.url || '/', 'http://localhost').pathname;
        if (!path.startsWith('/blog/')) return next();
        try {
          const page = blogPages(await loadArticles()).find((candidate) => candidate.path === path);
          if (!page) {
            response.statusCode = 404;
            response.end('Artigo não encontrado.');
            return;
          }
          const template = await server.transformIndexHtml(path, await readFile(resolve(root, 'blog-template.html'), 'utf8'));
          const { default: BlogPage } = await server.ssrLoadModule('/src/blog/BlogPage.jsx');
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(blogHtml(template, page, BlogPage));
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig(({ command }) => {
  if (command === 'build') validateSiteUrl(process.env.SITE_URL || '', { allowTestOrigin: process.env.BUILD_DIR === 'dist-test' });
  const outDir = process.env.BUILD_DIR || 'dist';
  return {
    base: '/',
    plugins: [react(), seoPlugin(), blogDevPlugin(), copyAssetsPlugin(outDir)],
    build: {
      outDir,
      rollupOptions: {
        input: {
          index: resolve(root, 'index.html'),
          privacidade: resolve(root, 'privacidade.html'),
          blog: resolve(root, 'blog-template.html'),
        },
      },
    },
  };
});
