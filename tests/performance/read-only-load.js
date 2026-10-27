// Small local read-only concurrency test; this DOES NOT simulate draw RPC or Realtime capacity.
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(BASE_URL);
if (!isLocal && __ENV.ALLOW_REMOTE_TEST !== 'YES') {
  throw new Error('Remote load tests are blocked. Never load-test production without approval.');
}
export const options = {
  scenarios: {
    page_view: { executor: 'constant-vus', vus: 3, duration: '15s' }
  },
  thresholds: { http_req_failed: ['rate<0.05'], http_req_duration: ['p(95)<5000'], checks: ['rate>0.95'] }
};
export default function () {
  const response = http.get(`${BASE_URL}/live.html`, { timeout: '10s' });
  check(response, { 'Live page HTTP 200': r => r.status === 200 });
  sleep(1);
}
