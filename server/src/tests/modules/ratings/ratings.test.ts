import { createTestApp } from '../../helpers/app';
import {
  createTestUser,
  createTestGuru,
  createCompletedBooking,
  authHeader,
  makeAccessToken,
} from '../../helpers/factories';
import { prisma } from '~/config/prisma';

const app = createTestApp();

describe('POST /api/bookings/:bookingId/rating', () => {
  it('student can rate a COMPLETED booking', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser } = await createTestGuru();
    const booking = await createCompletedBooking(student.id, guruUser.id);
    const token = makeAccessToken(student.id, student.email);

    const res = await app
      .post(`/api/bookings/${booking.id}/rating`)
      .set(authHeader(token))
      .send({ stars: 5, comment: 'Great!' });
    expect(res.status).toBe(201);
    expect(res.body.data.stars).toBe(5);
    expect(res.body.data.comment).toBe('Great!');
  });

  it("updates the guru's ratingAvg after rating", async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser, profile } = await createTestGuru();
    const booking = await createCompletedBooking(student.id, guruUser.id);
    const token = makeAccessToken(student.id, student.email);

    await app.post(`/api/bookings/${booking.id}/rating`).set(authHeader(token)).send({ stars: 4 });

    const updatedProfile = await prisma.guruProfile.findUnique({ where: { id: profile.id } });
    expect(updatedProfile!.ratingAvg).toBe(4);
    expect(updatedProfile!.ratingCount).toBe(1);
  });

  it('returns 400 for rating a PENDING booking', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser, profile } = await createTestGuru();
    const slot = await prisma.availabilitySlot.create({
      data: {
        guruId: profile.id,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
        slotDurationMins: 60,
      },
    });
    const studentToken = makeAccessToken(student.id, student.email);

    const bookingRes = await app
      .post('/api/bookings')
      .set(authHeader(studentToken))
      .send({
        guruId: guruUser.id,
        slotId: slot.id,
        type: 'APPOINTMENT',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      });

    const res = await app
      .post(`/api/bookings/${bookingRes.body.data.id}/rating`)
      .set(authHeader(studentToken))
      .send({ stars: 5 });
    expect(res.status).toBe(400);
  });

  it('returns 403 when non-student tries to rate', async () => {
    const student = await createTestUser({ isStudent: true });
    const imposter = await createTestUser({ email: 'imp@ex.com' });
    const { user: guruUser } = await createTestGuru();
    const booking = await createCompletedBooking(student.id, guruUser.id);
    const token = makeAccessToken(imposter.id, imposter.email);

    const res = await app
      .post(`/api/bookings/${booking.id}/rating`)
      .set(authHeader(token))
      .send({ stars: 3 });
    expect(res.status).toBe(403);
  });

  it('returns 422 for invalid stars value', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser } = await createTestGuru();
    const booking = await createCompletedBooking(student.id, guruUser.id);
    const token = makeAccessToken(student.id, student.email);

    const res = await app
      .post(`/api/bookings/${booking.id}/rating`)
      .set(authHeader(token))
      .send({ stars: 6 });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/gurus/:id/ratings', () => {
  it('returns paginated ratings for a guru', async () => {
    const student = await createTestUser({ isStudent: true });
    const { user: guruUser, profile } = await createTestGuru();
    const booking = await createCompletedBooking(student.id, guruUser.id);
    const token = makeAccessToken(student.id, student.email);
    await app.post(`/api/bookings/${booking.id}/rating`).set(authHeader(token)).send({ stars: 5 });

    const res = await app.get(`/api/gurus/${profile.id}/ratings`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
