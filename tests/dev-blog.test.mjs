import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';
import { createServer } from 'vite';

test('serves blog article routes during development', async () => {
  const server = await createServer({ root: process.cwd(), configFile: resolve('vite.config.js'), server: { host: '127.0.0.1', port: 0 } });
  try {
    await server.listen();
    const port = server.httpServer.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/blog/como-criar-um-mvp/`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /<h1[^>]*>MVP: como definir o que construir primeiro<\/h1>/);
    assert.match(html, /id="page-data"/);
  } finally {
    await server.close();
  }
});
