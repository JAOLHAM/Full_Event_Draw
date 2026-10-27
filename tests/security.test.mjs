import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTurnstileConfig, authCaptchaOptions } from '../src/lib/security/turnstile.ts';

test('Turnstile is disabled by default and leaves auth flow unchanged', () => {
  assert.deepEqual(parseTurnstileConfig({}), { enabled: false, siteKey: '' });
  assert.deepEqual(parseTurnstileConfig({ enabled: 'false', siteKey: 'abc' }), { enabled: false, siteKey: 'abc' });
});

test('Turnstile requires the explicit true flag and trims the site key', () => {
  assert.deepEqual(parseTurnstileConfig({ enabled: 'true', siteKey: ' test-sitekey  ' }),
    { enabled: true, siteKey: 'test-sitekey' });
  assert.equal(parseTurnstileConfig({ enabled: 'TRUE', siteKey: 'x' }).enabled, false);
});

test('Captcha options are absent when the feature flag is disabled', () => {
  // This test runs with the opt-in feature OFF (the default); no network/auth call.
  if (process.env.NEXT_PUBLIC_TURNSTILE_ENABLED !== 'true') assert.equal(authCaptchaOptions(), undefined);
});
