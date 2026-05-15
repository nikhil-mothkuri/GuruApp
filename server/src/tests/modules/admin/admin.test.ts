import { createTestApp } from '../../helpers/app';
import { createTestUser, createTestGuru, authHeader, makeAccessToken } from '../../helpers/factories';

const app = createTestApp();

describe('Admin route guards', () => {
  it('returns 401 without auth', async () => {
    const res = await app.get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin user', async () => {
    const user = await createTestUser({ isStudent: true });
    const token = makeAccessToken(user.id, user.email);
    const res = await app.get('/api/admin/users').set(authHeader(token));
    expect(res.status).toBe(403);
  });
});

describe('GET /api/admin/users', () => {
  it('returns paginated user list for admin', async () => {
    const admin = await createTestUser({ isAdmin: true });
    await createTestUser({ email: 'u1@ex.com' });
    await createTestUser({ email: 'u2@ex.com' });
    const token = makeAccessToken(admin.id, admin.email);

    const res = await app.get('/api/admin/users').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    expect(res.body.meta).toMatchObject({ page: 1 });
  });

  it('respects limit pagination', async () => {
    const admin = await createTestUser({ isAdmin: true });
    await createTestUser({ email: 'p1@ex.com' });
    await createTestUser({ email: 'p2@ex.com' });
    const token = makeAccessToken(admin.id, admin.email);

    const res = await app.get('/api/admin/users?limit=2').set(authHeader(token));
    expect(res.body.data.length).toBe(2);
  });
});

describe('PATCH /api/admin/users/:id', () => {
  it('admin can deactivate a user', async () => {
    const admin = await createTestUser({ isAdmin: true });
    const user = await createTestUser({ email: 'target@ex.com' });
    const token = makeAccessToken(admin.id, admin.email);

    const res = await app.patch(`/api/admin/users/${user.id}`).set(authHeader(token)).send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it('admin can promote user to guru', async () => {
    const admin = await createTestUser({ isAdmin: true });
    const user = await createTestUser({ email: 'promo@ex.com' });
    const token = makeAccessToken(admin.id, admin.email);

    const res = await app.patch(`/api/admin/users/${user.id}`).set(authHeader(token)).send({ isGuru: true });
    expect(res.status).toBe(200);
    expect(res.body.data.isGuru).toBe(true);
  });
});

describe('GET /api/admin/metrics', () => {
  it('returns correct counts reflecting DB state', async () => {
    const admin = await createTestUser({ isAdmin: true });
    await createTestUser({ email: 'm1@ex.com' });
    await createTestGuru({ email: 'mg1@ex.com' });
    const token = makeAccessToken(admin.id, admin.email);

    const res = await app.get('/api/admin/metrics').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(3);
    expect(res.body.data.activeGurus).toBeGreaterThanOrEqual(1);
    expect(typeof res.body.data.totalBookings).toBe('number');
    expect(typeof res.body.data.totalRatings).toBe('number');
  });
});
