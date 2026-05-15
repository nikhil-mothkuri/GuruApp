import { createTestApp } from '../../helpers/app';
import { createTestUser, createTestGuru, createCompletedBooking, authHeader, makeAccessToken } from '../../helpers/factories';
import { prisma } from '~/config/prisma';

const app = createTestApp();

async function makeSlot(guruProfileId: string) {
  return prisma.availabilitySlot.create({
    data: { guruId: guruProfileId, dayOfWeek: 1, startTime: '09:00', endTime: '10:00', slotDurationMins: 60 },
  });
}

describe('POST /api/bookings', () => {
  it('returns 401 without auth', async () => {
    const res = await app.post('/api/bookings').send({});
    expect(res.status).toBe(401);
  });

  it('creates an APPOINTMENT booking', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser, profile } = await createTestGuru();
    const slot = await makeSlot(profile.id);
    const token = makeAccessToken(student.id, student.email);

    const res = await app.post('/api/bookings').set(authHeader(token)).send({
      guruId: guruUser.id,
      slotId: slot.id,
      type: 'APPOINTMENT',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('APPOINTMENT');
    expect(res.body.data.status).toBe('PENDING');
  });

  it('creates a SUBSCRIPTION booking with recurrenceRule', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser } = await createTestGuru();
    const token = makeAccessToken(student.id, student.email);
    const until = new Date(Date.now() + 30 * 86400000).toISOString();

    const res = await app.post('/api/bookings').set(authHeader(token)).send({
      guruId: guruUser.id,
      type: 'SUBSCRIPTION',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      recurrenceRule: { freq: 'DAILY', until },
    });
    expect(res.status).toBe(201);
    expect(res.body.data.type).toBe('SUBSCRIPTION');
  });

  it('returns 422 when APPOINTMENT is missing slotId', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser } = await createTestGuru();
    const token = makeAccessToken(student.id, student.email);

    const res = await app.post('/api/bookings').set(authHeader(token)).send({
      guruId: guruUser.id,
      type: 'APPOINTMENT',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(res.status).toBe(422);
  });
});

describe('PATCH /api/bookings/:id/cancel', () => {
  it('student can cancel their own PENDING booking', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser, profile } = await createTestGuru();
    const slot = await makeSlot(profile.id);
    const token = makeAccessToken(student.id, student.email);

    const bookingRes = await app.post('/api/bookings').set(authHeader(token)).send({
      guruId: guruUser.id, slotId: slot.id, type: 'APPOINTMENT',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    });
    const bookingId = bookingRes.body.data.id;

    const res = await app.patch(`/api/bookings/${bookingId}/cancel`).set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  it('returns 403 when another user tries to cancel', async () => {
    const student = await createTestUser({ isStudent: true });
    const other = await createTestUser({ email: 'other@ex.com' });
    const { user: guruUser, profile } = await createTestGuru();
    const slot = await makeSlot(profile.id);

    const studentToken = makeAccessToken(student.id, student.email);
    const bookingRes = await app.post('/api/bookings').set(authHeader(studentToken)).send({
      guruId: guruUser.id, slotId: slot.id, type: 'APPOINTMENT',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    });

    const otherToken = makeAccessToken(other.id, other.email);
    const res = await app.patch(`/api/bookings/${bookingRes.body.data.id}/cancel`).set(authHeader(otherToken));
    expect(res.status).toBe(403);
  });

  it('returns 400 when cancelling a COMPLETED booking', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser } = await createTestGuru();
    const booking = await createCompletedBooking(student.id, guruUser.id);
    const token = makeAccessToken(student.id, student.email);

    const res = await app.patch(`/api/bookings/${booking.id}/cancel`).set(authHeader(token));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS');
  });

  it('returns 404 for non-existent booking', async () => {
    const student = await createTestUser({ isStudent: true });
    const token = makeAccessToken(student.id, student.email);
    const res = await app.patch('/api/bookings/nonexistent/cancel').set(authHeader(token));
    expect(res.status).toBe(404);
  });
});

describe('GET /api/bookings (student view)', () => {
  it('returns only the authenticated student\'s bookings', async () => {
    const student1 = await createTestUser({ isStudent: true });
    const student2 = await createTestUser({ email: 's2@ex.com', isStudent: true });
    const { user: guruUser } = await createTestGuru();

    await createCompletedBooking(student1.id, guruUser.id);
    await createCompletedBooking(student2.id, guruUser.id);

    const token = makeAccessToken(student1.id, student1.email);
    const res = await app.get('/api/bookings').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.every((b: { studentId: string }) => b.studentId === student1.id)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it('filters by status', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser } = await createTestGuru();
    await createCompletedBooking(student.id, guruUser.id);

    const token = makeAccessToken(student.id, student.email);
    const res = await app.get('/api/bookings?status=COMPLETED').set(authHeader(token));
    expect(res.body.data.every((b: { status: string }) => b.status === 'COMPLETED')).toBe(true);
  });
});

describe('GET /api/bookings/guru (guru view)', () => {
  it('returns bookings where the authenticated user is the guru', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser } = await createTestGuru();
    await createCompletedBooking(student.id, guruUser.id);

    const token = makeAccessToken(guruUser.id, guruUser.email);
    const res = await app.get('/api/bookings/guru').set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.data.every((b: { guruId: string }) => b.guruId === guruUser.id)).toBe(true);
  });

  it('filters upcoming bookings', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser, profile } = await createTestGuru();
    const slot = await makeSlot(profile.id);
    const studentToken = makeAccessToken(student.id, student.email);

    await app.post('/api/bookings').set(authHeader(studentToken)).send({
      guruId: guruUser.id, slotId: slot.id, type: 'APPOINTMENT',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    });

    const guruToken = makeAccessToken(guruUser.id, guruUser.email);
    const res = await app.get('/api/bookings/guru?filter=upcoming').set(authHeader(guruToken));
    expect(res.body.data.every((b: { scheduledAt: string }) => new Date(b.scheduledAt) > new Date())).toBe(true);
  });
});
