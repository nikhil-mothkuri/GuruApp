import { createTestApp } from '../../helpers/app';
import { createTestUser, authHeader, makeAccessToken } from '../../helpers/factories';

const app = createTestApp();

describe('GET /api/users/me', () => {
  it('returns the authenticated user profile', async () => {
    const user = await createTestUser({ name: 'Profile User', email: 'me@example.com' });
    const token = makeAccessToken(user.id, user.email);

    const res = await app.get('/api/users/me').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('me@example.com');
    expect(res.body.data.name).toBe('Profile User');
  });

  it('returns 401 without token', async () => {
    const res = await app.get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/me — edge cases', () => {
  it('returns 404 when JWT references a deleted user', async () => {
    // Token is valid but user no longer exists in DB
    const token = makeAccessToken('ghost-user-id-never-created', 'ghost@example.com');
    const res = await app.get('/api/users/me').set(authHeader(token));
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('PATCH /api/users/me', () => {
  it('updates name and bio', async () => {
    const user = await createTestUser();
    const token = makeAccessToken(user.id, user.email);

    const res = await app
      .patch('/api/users/me')
      .set(authHeader(token))
      .send({ name: 'Updated Name', bio: 'My bio' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
    expect(res.body.data.bio).toBe('My bio');
  });

  it('returns 422 for name shorter than 2 chars', async () => {
    const user = await createTestUser();
    const token = makeAccessToken(user.id, user.email);

    const res = await app.patch('/api/users/me').set(authHeader(token)).send({ name: 'X' });
    expect(res.status).toBe(422);
  });

  it('returns 401 without token', async () => {
    const res = await app.patch('/api/users/me').send({ name: 'Test' });
    expect(res.status).toBe(401);
  });
});
