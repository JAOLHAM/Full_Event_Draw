// READ-ONLY smoke test: local Next.js pages only; no Supabase writes.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(BASE_URL);
if (!isLocal && __ENV.ALLOW_REMOTE_TEST !== 'YES') {
  throw new Error('Remote load tests are blocked. Use local server or explicitly set ALLOW_REMOTE_TEST=YES on a controlled preview.');
}

export const options = {
  vus: 1, iterations: 5,
  thresholds: { http_req_failed: ['rate<0.05'], http_req_duration: ['p(95)<5000'], checks: ['rate>0.95'] }
};

export default function () {
  for (const path of ['/', '/live.html']) {
    const response = http.get(`${BASE_URL}${path}`, { tags: { page: path }, timeout: '10s' });
    check(response, {
      [`${path} HTTP 200`]: r => r.status === 200,
      [`${path} returns HTML`]: r => String(r.headers['Content-Type'] || '').includes('text/html')
    });
  }
  sleep(1);
}
