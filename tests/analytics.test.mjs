import assert from 'node:assert/strict';
import test from 'node:test';
import { trackEvent } from '../src/lib/analytics.js';

test('keeps analytics disabled until an explicit adapter is installed', () => {
  const previous = globalThis.window;
  try {
    globalThis.window = {};
    assert.doesNotThrow(() => trackEvent('article_view', { slug: 'test' }));
    const events = [];
    globalThis.window.PB_ANALYTICS = (name, properties) => events.push({ name, properties });
    trackEvent('article_view', { slug: 'test' });
    assert.deepEqual(events, [{ name: 'article_view', properties: { slug: 'test' } }]);
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});
