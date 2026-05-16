import { createTestApp } from '../../helpers/app';
import { createTestGuru, authHeader, makeAccessToken } from '../../helpers/factories';
import { prisma } from '~/config/prisma';

const app = createTestApp();

describe('GET /api/gurus (public search)', () => {
  beforeEach(async () => {
    const { user: u1, profile: p1 } = await createTestGuru({ name: 'Alice Yoga' });
    await prisma.guruSkill.create({ data: { guruId: p1.id, skillName: 'yoga' } });
    await createTestGuru({ name: 'Bob Coding', email: 'bob@gurus.com' });
  });

  it('returns all active gurus', async () => {
    const res = await app.get('/api/gurus');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.meta).toBeDefined();
  });

  it('filters by name query', async () => {
    const res = await app.get('/api/gurus?q=Alice');
    expect(res.status).toBe(200);
    expect(
      res.body.data.some((g: { user: { name: string } }) => g.user.name.includes('Alice')),
    ).toBe(true);
  });

  it('filters by skill', async () => {
    const res = await app.get('/api/gurus?skill=yoga');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/gurus/suggestions', () => {
  it('returns name and skill suggestions', async () => {
    const { profile } = await createTestGuru({ name: 'Suggest Guru' });
    await prisma.guruSkill.create({ data: { guruId: profile.id, skillName: 'meditation' } });

    const res = await app.get('/api/gurus/suggestions?q=Sugg');
    expect(res.status).toBe(200);
    expect(
      res.body.data.names.some((n: { user: { name: string } }) => n.user.name.includes('Suggest')),
    ).toBe(true);
  });

  it('returns empty arrays for blank query', async () => {
    const res = await app.get('/api/gurus/suggestions?q=');
    expect(res.status).toBe(200);
    expect(res.body.data.names).toEqual([]);
  });
});

describe('GET /api/gurus/:id', () => {
  it('returns guru profile with skills and photos', async () => {
    const { user, profile } = await createTestGuru();
    await prisma.guruSkill.create({ data: { guruId: profile.id, skillName: 'coding' } });

    const res = await app.get(`/api/gurus/${profile.id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.skills.length).toBe(1);
  });

  it('returns 404 for unknown id', async () => {
    const res = await app.get('/api/gurus/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/gurus/me/profile', () => {
  it("returns the guru's own profile", async () => {
    const { user, profile } = await createTestGuru();
    const token = makeAccessToken(user.id, user.email);

    const res = await app.get('/api/gurus/me/profile').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.userId).toBe(user.id);
  });

  it('returns 401 without token', async () => {
    const res = await app.get('/api/gurus/me/profile');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/gurus/me/profile', () => {
  it('updates tagline', async () => {
    const { user } = await createTestGuru();
    const token = makeAccessToken(user.id, user.email);

    const res = await app
      .put('/api/gurus/me/profile')
      .set(authHeader(token))
      .send({ tagline: 'New tagline' });
    expect(res.status).toBe(200);
    expect(res.body.data.tagline).toBe('New tagline');
  });
});

describe('POST /api/gurus/me/skills', () => {
  it('adds a skill to the guru profile', async () => {
    const { user } = await createTestGuru();
    const token = makeAccessToken(user.id, user.email);

    const res = await app
      .post('/api/gurus/me/skills')
      .set(authHeader(token))
      .send({ skillName: 'TypeScript' });
    expect(res.status).toBe(201);
    expect(res.body.data.skillName).toBe('TypeScript');
  });
});

describe('DELETE /api/gurus/me/skills/:skillId', () => {
  it('removes a skill from the guru profile', async () => {
    const { user, profile } = await createTestGuru();
    const skill = await prisma.guruSkill.create({
      data: { guruId: profile.id, skillName: 'Python' },
    });
    const token = makeAccessToken(user.id, user.email);

    const res = await app.delete(`/api/gurus/me/skills/${skill.id}`).set(authHeader(token));
    expect(res.status).toBe(204);
  });
});

describe('POST /api/gurus/me/videos', () => {
  it('adds a YouTube video and extracts thumbnail', async () => {
    const { user } = await createTestGuru();
    const token = makeAccessToken(user.id, user.email);

    const res = await app.post('/api/gurus/me/videos').set(authHeader(token)).send({
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Test Video',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.thumbnailUrl).toContain('dQw4w9WgXcQ');
  });

  it('returns 422 for non-YouTube URL', async () => {
    const { user } = await createTestGuru();
    const token = makeAccessToken(user.id, user.email);

    const res = await app.post('/api/gurus/me/videos').set(authHeader(token)).send({
      youtubeUrl: 'https://vimeo.com/12345',
      title: 'Test',
    });
    expect(res.status).toBe(422);
  });
});
