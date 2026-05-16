import { createTestApp } from '../../helpers/app';
import {
  createTestUser,
  createTestGuru,
  createActiveProduct,
  authHeader,
  makeAccessToken,
} from '../../helpers/factories';

const app = createTestApp();

async function placeOrder(productId: string, extra = {}) {
  return app.post('/api/orders').send({
    buyerName: 'Test Buyer',
    buyerEmail: 'buyer@example.com',
    items: [{ productId, quantity: 1 }],
    ...extra,
  });
}

describe('POST /api/orders (place order)', () => {
  it('places an order for an ACTIVE product', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id);

    const res = await placeOrder(product.id);
    expect(res.status).toBe(201);
    expect(res.body.data.buyerEmail).toBe('buyer@example.com');
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].productName).toBe(product.name);
  });

  it('attaches userId when buyer is logged in', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id);
    const buyer = await createTestUser({ email: 'loggedin@example.com' });
    const token = makeAccessToken(buyer.id, buyer.email);

    const res = await app
      .post('/api/orders')
      .set(authHeader(token))
      .send({
        buyerName: 'Logged In',
        buyerEmail: buyer.email,
        items: [{ productId: product.id, quantity: 1 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.userId).toBe(buyer.id);
  });

  it('guest order has null userId', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id);
    const res = await placeOrder(product.id);
    expect(res.body.data.userId).toBeNull();
  });

  it('returns 400 for DRAFT product', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id, { status: 'DRAFT' });

    const res = await placeOrder(product.id);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PRODUCT_UNAVAILABLE');
  });

  it('returns 400 for insufficient stock on physical product', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id, { isDigital: false, stock: 1 });

    const res = await app.post('/api/orders').send({
      buyerName: 'Buyer',
      buyerEmail: 'b@b.com',
      items: [{ productId: product.id, quantity: 5 }],
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('allows any quantity for digital products regardless of stock', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id, { isDigital: true, stock: 0 });

    const res = await app.post('/api/orders').send({
      buyerName: 'Buyer',
      buyerEmail: 'b@b.com',
      items: [{ productId: product.id, quantity: 100 }],
    });
    expect(res.status).toBe(201);
  });

  it('returns 404 for unknown product', async () => {
    const res = await app.post('/api/orders').send({
      buyerName: 'Buyer',
      buyerEmail: 'b@b.com',
      items: [{ productId: 'nonexistent-id', quantity: 1 }],
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 for items from different gurus', async () => {
    const { profile: p1 } = await createTestGuru();
    const { profile: p2 } = await createTestGuru({ email: 'guru2@example.com' });
    const prod1 = await createActiveProduct(p1.id);
    const prod2 = await createActiveProduct(p2.id);

    const res = await app.post('/api/orders').send({
      buyerName: 'Buyer',
      buyerEmail: 'b@b.com',
      items: [
        { productId: prod1.id, quantity: 1 },
        { productId: prod2.id, quantity: 1 },
      ],
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MIXED_GURU_ORDER');
  });

  it('returns 422 for empty items array', async () => {
    const res = await app
      .post('/api/orders')
      .send({ buyerName: 'B', buyerEmail: 'b@b.com', items: [] });
    expect(res.status).toBe(422);
  });

  it('calculates totalAmount correctly', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id, { price: 25 });

    const res = await app.post('/api/orders').send({
      buyerName: 'B',
      buyerEmail: 'b@b.com',
      items: [{ productId: product.id, quantity: 3 }],
    });
    expect(res.status).toBe(201);
    expect(res.body.data.totalAmount).toBe(75);
  });
});

describe('GET /api/orders/me (guru views own orders)', () => {
  it('returns 401 without auth', async () => {
    const res = await app.get('/api/orders/me');
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-guru', async () => {
    const student = await createTestUser({ isStudent: true, isGuru: false });
    const token = makeAccessToken(student.id, student.email);
    const res = await app.get('/api/orders/me').set(authHeader(token));
    expect(res.status).toBe(403);
  });

  it('returns paginated orders for the guru', async () => {
    const { user, profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id);
    await placeOrder(product.id);
    await placeOrder(product.id);

    const token = makeAccessToken(user.id, user.email);
    const res = await app.get('/api/orders/me').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('filters by status', async () => {
    const { user, profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id);
    await placeOrder(product.id);

    const token = makeAccessToken(user.id, user.email);
    const pendingRes = await app.get('/api/orders/me?status=PENDING').set(authHeader(token));
    expect(pendingRes.body.data.every((o: { status: string }) => o.status === 'PENDING')).toBe(
      true,
    );

    const confirmedRes = await app.get('/api/orders/me?status=CONFIRMED').set(authHeader(token));
    expect(confirmedRes.body.data.length).toBe(0);
  });
});

describe('PATCH /api/orders/me/:id/status', () => {
  it('guru can update order status', async () => {
    const { user, profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id);
    const orderRes = await placeOrder(product.id);
    const orderId = orderRes.body.data.id;

    const token = makeAccessToken(user.id, user.email);
    const res = await app
      .patch(`/api/orders/me/${orderId}/status`)
      .set(authHeader(token))
      .send({ status: 'CONFIRMED' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CONFIRMED');
  });

  it('returns 403 when another guru tries to update', async () => {
    const { profile } = await createTestGuru();
    const product = await createActiveProduct(profile.id);
    const orderRes = await placeOrder(product.id);

    const { user: other } = await createTestGuru({ email: 'other@ex.com' });
    const token = makeAccessToken(other.id, other.email);
    const res = await app
      .patch(`/api/orders/me/${orderRes.body.data.id}/status`)
      .set(authHeader(token))
      .send({ status: 'CONFIRMED' });
    expect(res.status).toBe(403);
  });
});
