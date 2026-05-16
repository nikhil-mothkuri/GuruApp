import { createTestApp } from '../../helpers/app';
import {
  createTestUser,
  createTestGuru,
  authHeader,
  makeAccessToken,
} from '../../helpers/factories';

const app = createTestApp();

describe('Favorites', () => {
  it('student can add a guru to favorites', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser } = await createTestGuru();
    const token = makeAccessToken(student.id, student.email);

    // favorites service resolves by guruUserId, not profile id
    const res = await app.post(`/api/students/me/favorites/${guruUser.id}`).set(authHeader(token));
    expect(res.status).toBe(201);
  });

  it('student can list their favorites', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser } = await createTestGuru();
    const token = makeAccessToken(student.id, student.email);

    await app.post(`/api/students/me/favorites/${guruUser.id}`).set(authHeader(token));

    const res = await app.get('/api/students/me/favorites').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('student can remove a guru from favorites', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser } = await createTestGuru();
    const token = makeAccessToken(student.id, student.email);

    await app.post(`/api/students/me/favorites/${guruUser.id}`).set(authHeader(token));
    const res = await app
      .delete(`/api/students/me/favorites/${guruUser.id}`)
      .set(authHeader(token));
    expect(res.status).toBe(204);

    const listRes = await app.get('/api/students/me/favorites').set(authHeader(token));
    expect(listRes.body.data.length).toBe(0);
  });

  it('returns 404 when guru does not exist', async () => {
    const student = await createTestUser({ isStudent: true });
    const token = makeAccessToken(student.id, student.email);
    const res = await app.post('/api/students/me/favorites/nonexistent-id').set(authHeader(token));
    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    const res = await app.get('/api/students/me/favorites');
    expect(res.status).toBe(401);
  });
});
