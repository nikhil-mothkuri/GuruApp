import { createTestApp } from '../../helpers/app';
import { createTestUser, createTestGuru, createActiveProduct, authHeader, makeAccessToken } from '../../helpers/factories';
import { prisma } from '~/config/prisma';

const app = createTestApp();

describe('GET /api/products (public search)', () => {
  beforeEach(async () => {
    const { user, profile } = await createTestGuru();
    await createActiveProduct(profile.id, { name: 'React Course', price: 49 });
    await createActiveProduct(profile.id, { name: 'Node.js Guide', price: 29, isDigital: false, stock: 10 });
    await createActiveProduct(profile.id, { name: 'Draft Item', status: 'DRAFT' });
  });

  it('returns only ACTIVE products by default', async () => {
    const res = await app.get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: { status: string }) => p.status === 'ACTIVE')).toBe(true);
  });

  it('filters by name query', async () => {
    const res = await app.get('/api/products?q=React');
    expect(res.status).toBe(200);
    expect(res.body.data.some((p: { name: string }) => p.name.includes('React'))).toBe(true);
  });

  it('filters digital products', async () => {
    const res = await app.get('/api/products?isDigital=true');
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: { isDigital: boolean }) => p.isDigital)).toBe(true);
  });

  it('filters by price range', async () => {
    const res = await app.get('/api/products?minPrice=40&maxPrice=60');
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: { price: number }) => p.price >= 40 && p.price <= 60)).toBe(true);
  });

  it('sorts by price ascending', async () => {
    const res = await app.get('/api/products?sortBy=price_asc');
    const prices: number[] = res.body.data.map((p: { price: number }) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('returns pagination meta', async () => {
    const res = await app.get('/api/products?limit=1');
    expect(res.body.meta).toMatchObject({ page: 1, limit: 1 });
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/products/:id', () => {
  it('returns product by id and increments viewCount', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id);

    const res = await app.get(`/api/products/${product.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(product.id);

    const updated = await prisma.product.findUnique({ where: { id: product.id } });
    expect(updated!.viewCount).toBe(1);
  });

  it('returns 404 for unknown id', async () => {
    const res = await app.get('/api/products/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/products/slug/:slug', () => {
  it('returns product by slug', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id, { name: 'Slug Product' });

    const res = await app.get(`/api/products/slug/${product.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(product.id);
  });
});

describe('POST /api/products (guru-only)', () => {
  const validDto = {
    name: 'New Course',
    price: 99,
    stock: 0,
    isDigital: true,
    status: 'ACTIVE',
    currency: 'USD',
    weightUnit: 'kg',
    dimensionUnit: 'cm',
    shippingRequired: false,
    lowStockThreshold: 5,
  };

  it('returns 401 without auth', async () => {
    const res = await app.post('/api/products').send(validDto);
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-guru user', async () => {
    const student = await createTestUser({ isStudent: true, isGuru: false });
    const token = makeAccessToken(student.id, student.email);
    const res = await app.post('/api/products').set(authHeader(token)).send(validDto);
    expect(res.status).toBe(403);
  });

  it('creates product for guru user', async () => {
    const { user, profile } = await createTestGuru();
    const token = makeAccessToken(user.id, user.email);
    const res = await app.post('/api/products').set(authHeader(token)).send(validDto);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New Course');
    expect(res.body.data.slug).toMatch(/new-course-/);
  });

  it('returns 422 for missing name', async () => {
    const { user } = await createTestGuru();
    const token = makeAccessToken(user.id, user.email);
    const res = await app.post('/api/products').set(authHeader(token)).send({ price: 10, stock: 0, isDigital: true, currency: 'USD', status: 'DRAFT', weightUnit: 'kg', dimensionUnit: 'cm', shippingRequired: true, lowStockThreshold: 5 });
    expect(res.status).toBe(422);
  });
});

describe('PUT /api/products/:id (guru-only)', () => {
  it('updates product owned by guru', async () => {
    const { user, profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id, { name: 'Old Name' });
    const token = makeAccessToken(user.id, user.email);

    const res = await app.put(`/api/products/${product.id}`).set(authHeader(token)).send({ name: 'New Name' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('New Name');
  });

  it('returns 404 when updating another guru\'s product', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id);

    const { user: otherGuru } = await createTestGuru({ email: 'other@example.com' });
    const token = makeAccessToken(otherGuru.id, otherGuru.email);

    const res = await app.put(`/api/products/${product.id}`).set(authHeader(token)).send({ name: 'Steal' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/products/:id (guru-only)', () => {
  it('deletes product owned by guru', async () => {
    const { user, profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id);
    const token = makeAccessToken(user.id, user.email);

    const res = await app.delete(`/api/products/${product.id}`).set(authHeader(token));
    expect(res.status).toBe(204);

    const found = await prisma.product.findUnique({ where: { id: product.id } });
    expect(found).toBeNull();
  });

  it('returns 404 when deleting another guru\'s product', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id);
    const { user: other } = await createTestGuru({ email: 'g2@example.com' });
    const token = makeAccessToken(other.id, other.email);

    const res = await app.delete(`/api/products/${product.id}`).set(authHeader(token));
    expect(res.status).toBe(404);
  });
});

describe('GET /api/products/me/products', () => {
  it('returns paginated products for the authenticated guru', async () => {
    const { user, profile } = await createTestGuru();
    await createActiveProduct(profile.id);
    await createActiveProduct(profile.id, { name: 'Second', status: 'DRAFT' });
    const token = makeAccessToken(user.id, user.email);

    const res = await app.get('/api/products/me/products').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('returns 401 without token', async () => {
    const res = await app.get('/api/products/me/products');
    expect(res.status).toBe(401);
  });
});
