# Load Tests (k6)

## Install k6
- **Windows**: `winget install k6` or `scoop install k6`
- **macOS**: `brew install k6`
- **Linux**: https://k6.io/docs/get-started/installation/

## Run

```bash
# Health check — 50 VUs, 30s, target p95 < 200ms
k6 run --env BASE_URL=http://localhost:4000 load-tests/health.js

# Product search — 50 VUs, 60s, target p95 < 200ms
k6 run --env BASE_URL=http://localhost:4000 load-tests/product-search.js

# Place order — 50 VUs, 60s, target p95 < 500ms
# Requires a seeded ACTIVE product id
k6 run --env BASE_URL=http://localhost:4000 --env PRODUCT_ID=<id> load-tests/place-order.js
```

## Thresholds

| Script | p95 target | Failure rate |
|---|---|---|
| health.js | < 200 ms | < 1% |
| product-search.js | < 200 ms | < 1% |
| place-order.js | < 500 ms | < 10% |
