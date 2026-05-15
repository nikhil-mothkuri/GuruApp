import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    // Some failures expected: stock constraints, DRAFT products, etc.
    http_req_failed: ['rate<0.10'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';
const PRODUCT_ID = __ENV.PRODUCT_ID || '';

export default function () {
  if (!PRODUCT_ID) {
    console.error('Set PRODUCT_ID env var to an active product id. Run with --env PRODUCT_ID=<id>');
    return;
  }

  const payload = JSON.stringify({
    buyerName: `Load Test ${__VU}`,
    buyerEmail: `load${__VU}@test.example.com`,
    items: [{ productId: PRODUCT_ID, quantity: 1 }],
  });

  const res = http.post(`${BASE_URL}/api/orders`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'order placed or expected error': (r) =>
      r.status === 201 || r.status === 400 || r.status === 404,
  });
  sleep(1);
}
