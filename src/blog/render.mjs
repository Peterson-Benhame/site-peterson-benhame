import React from 'react';
import { renderToString } from 'react-dom/server';
import { renderSeoTags, siteUrl } from '../../seo.config.js';

const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function blogHtml(template, page, BlogPage) {
  const data = JSON.stringify(page).replace(/</g, '\\u003c');
  const markup = renderToString(React.createElement(BlogPage, { page }))
    .replace(/<link rel="preload"[^>]*\/>/g, '');
  return template
    .replace('<div id="root"></div>', `<div id="root">${markup}</div>`)
    .replace('<title>Blog — Peterson Benhame</title>', `<title>${escapeHtml(page.title)}</title>`)
    .replace('<head>', siteUrl ? `<head>\n    ${renderSeoTags(page)}` : '<head>')
    .replace('<script id="page-data" type="application/json"></script>', `<script id="page-data" type="application/json">${data}</script>`);
}
