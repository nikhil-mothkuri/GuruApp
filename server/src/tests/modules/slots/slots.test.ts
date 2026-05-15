import { createTestApp } from '../../helpers/app';
import { createTestGuru, authHeader, makeAccessToken } from '../../helpers/factories';
import { prisma } from '~/config/prisma';

const app = createTestApp();

const slotDto = { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', slotDurationMins: 60 };

describe('GET /api/gurus/:id/slots (public)', () => {
  it('returns a guru\'s active slots', async () => {
    const { user, profile } = await createTestGuru();
    await prisma.availabilitySlot.create({ data: { guruId: profile.id, ...slotDto } });

    const res = await app.get(`/api/gurus/${profile.id}/slots`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('POST /api/gurus/me/slots', () => {
  it('creates a slot for the guru', async () => {
    const { user } = await createTestGuru();
    const token = makeAccessToken(user.id, user.email);

    const res = await app.post('/api/gurus/me/slots').set(authHeader(token)).send(slotDto);
    expect(res.status).toBe(201);
    expect(res.body.data.dayOfWeek).toBe(1);
  });

  it('returns 401 without auth', async () => {
    const res = await app.post('/api/gurus/me/slots').send(slotDto);
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/gurus/me/slots/:slotId', () => {
  it('updates a slot owned by the guru', async () => {
    const { user, profile } = await createTestGuru();
    const slot = await prisma.availabilitySlot.create({ data: { guruId: profile.id, ...slotDto } });
    const token = makeAccessToken(user.id, user.email);

    const res = await app.put(`/api/gurus/me/slots/${slot.id}`).set(authHeader(token)).send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it('returns 404 when updating another guru\'s slot', async () => {
    const { profile } = await createTestGuru();
    const slot = await prisma.availabilitySlot.create({ data: { guruId: profile.id, ...slotDto } });

    const { user: other } = await createTestGuru({ email: 'other@ex.com' });
    const token = makeAccessToken(other.id, other.email);

    const res = await app.put(`/api/gurus/me/slots/${slot.id}`).set(authHeader(token)).send({ isActive: false });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/gurus/me/slots/:slotId', () => {
  it('deletes a slot owned by the guru', async () => {
    const { user, profile } = await createTestGuru();
    const slot = await prisma.availabilitySlot.create({ data: { guruId: profile.id, ...slotDto } });
    const token = makeAccessToken(user.id, user.email);

    const res = await app.delete(`/api/gurus/me/slots/${slot.id}`).set(authHeader(token));
    expect(res.status).toBe(204);
  });
});
