import assert from 'node:assert/strict';
import test from 'node:test';
import { validateSiteUrl } from '../seo.config.js';

test('requires an explicit HTTPS root origin for a publishable build', () => {
  assert.equal(validateSiteUrl('https://minhamarca.com.br/'), 'https://minhamarca.com.br');
  assert.equal(validateSiteUrl('https://seo-fixture.invalid', { allowTestOrigin: true }), 'https://seo-fixture.invalid');
  for (const value of ['', 'http://example.org', 'https://example.org/blog/', 'https://user@example.org', 'https://localhost', 'https://seo-fixture.invalid', 'https://example.com']) {
    assert.throws(() => validateSiteUrl(value), /SITE_URL/);
  }
});
