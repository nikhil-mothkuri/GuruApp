import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '60s',
  thresholds: {
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4000';

const QUERIES = [
  '',
  '?sortBy=price_asc',
  '?sortBy=price_desc',
  '?sortBy=popular',
  '?isDigital=true',
  '?category=Books+%26+Courses',
  '?minPrice=10&maxPrice=100',
];

export default function () {
  const q = QUERIES[Math.floor(Math.random() * QUERIES.length)];
  const res = http.get(`${BASE_URL}/api/products${q}`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'has data array': (r) => Array.isArray(r.json('data')),
  });
  sleep(0.5);
}
