import { createTestApp } from '../../helpers/app';
import { createTestUser, makeRefreshToken, authHeader } from '../../helpers/factories';
import { prisma } from '~/config/prisma';
import { verifyAccessToken } from '~/utils/jwt';

// Mock google-auth-library before any imports that touch it
jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => ({
          sub: 'google-uid-123',
          email: 'google@example.com',
          name: 'Google User',
          picture: 'https://example.com/pic.jpg',
        }),
      }),
    })),
  };
});

const app = createTestApp();

// ─── SIGNUP ─────────────────────────────────────────────────────────────────

describe('POST /api/auth/signup', () => {
  const valid = {
    email: 'new@example.com',
    name: 'New User',
    password: 'Password1!',
    isStudent: true,
    isGuru: false,
  };

  it('returns 201 with user and tokens', async () => {
    const res = await app.post('/api/auth/signup').send(valid);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(valid.email);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
  });

  it('access token is a valid JWT', async () => {
    const res = await app.post('/api/auth/signup').send(valid);
    const payload = verifyAccessToken(res.body.data.accessToken);
    expect(payload.email).toBe(valid.email);
  });

  it('persists isGuru flag when true', async () => {
    const res = await app
      .post('/api/auth/signup')
      .send({ ...valid, email: 'guru@ex.com', isGuru: true });
    expect(res.body.data.user.isGuru).toBe(true);
  });

  it('returns 409 for duplicate email', async () => {
    await app.post('/api/auth/signup').send(valid);
    const res = await app.post('/api/auth/signup').send(valid);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('returns 422 for invalid email', async () => {
    const res = await app.post('/api/auth/signup').send({ ...valid, email: 'not-an-email' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 for missing password', async () => {
    const res = await app.post('/api/auth/signup').send({ email: 'x@x.com', name: 'X' });
    expect(res.status).toBe(422);
  });

  it('returns 422 for name shorter than 2 chars', async () => {
    const res = await app.post('/api/auth/signup').send({ ...valid, name: 'X' });
    expect(res.status).toBe(422);
  });
});

// ─── LOGIN ──────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await createTestUser({ email: 'login@example.com', password: 'Password1!' });
  });

  it('returns 200 with tokens for correct credentials', async () => {
    const res = await app
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'Password1!' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
  });

  it('returns 401 for wrong password', async () => {
    const res = await app
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPass1!' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 for non-existent email', async () => {
    const res = await app
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password1!' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 for Google-only account (no passwordHash)', async () => {
    await createTestUser({
      email: 'google-only@example.com',
      passwordHash: null,
      googleId: 'gid-123',
    });
    const res = await app
      .post('/api/auth/login')
      .send({ email: 'google-only@example.com', password: 'anything' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 for inactive account', async () => {
    await createTestUser({
      email: 'inactive@example.com',
      password: 'Password1!',
      isActive: false,
    });
    const res = await app
      .post('/api/auth/login')
      .send({ email: 'inactive@example.com', password: 'Password1!' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 422 for missing fields', async () => {
    const res = await app.post('/api/auth/login').send({ email: 'login@example.com' });
    expect(res.status).toBe(422);
  });
});

// ─── REFRESH ────────────────────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  let userId: string;
  let email: string;
  let savedRefreshToken: string;

  beforeEach(async () => {
    const signupRes = await app.post('/api/auth/signup').send({
      email: 'refresh@example.com',
      name: 'Refresh User',
      password: 'Password1!',
      isStudent: true,
      isGuru: false,
    });
    userId = signupRes.body.data.user.id;
    email = signupRes.body.data.user.email;
    savedRefreshToken = signupRes.body.data.refreshToken;
  });

  it('returns 200 with new tokens for a valid refresh token', async () => {
    const res = await app.post('/api/auth/refresh').send({ refreshToken: savedRefreshToken });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.refreshToken).toBeTruthy();
  });

  it('new tokens are different from old ones', async () => {
    const res = await app.post('/api/auth/refresh').send({ refreshToken: savedRefreshToken });
    expect(res.body.data.refreshToken).not.toBe(savedRefreshToken);
  });

  it('returns 401 for an invalid token string', async () => {
    const res = await app.post('/api/auth/refresh').send({ refreshToken: 'not.a.real.token' });
    expect(res.status).toBe(401);
  });

  it('enforces rotation — reusing old refresh token fails', async () => {
    const first = await app.post('/api/auth/refresh').send({ refreshToken: savedRefreshToken });
    expect(first.status).toBe(200);
    const second = await app.post('/api/auth/refresh').send({ refreshToken: savedRefreshToken });
    expect(second.status).toBe(401);
  });

  it('returns 422 when body is missing', async () => {
    const res = await app.post('/api/auth/refresh').send({});
    expect(res.status).toBe(422);
  });

  it('unused token created directly is also rejected (not in DB)', async () => {
    const fakeToken = makeRefreshToken(userId, email);
    const res = await app.post('/api/auth/refresh').send({ refreshToken: fakeToken });
    expect(res.status).toBe(401);
  });
});

// ─── LOGOUT ─────────────────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  let accessToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    const res = await app.post('/api/auth/signup').send({
      email: 'logout@example.com',
      name: 'Logout User',
      password: 'Password1!',
      isStudent: true,
      isGuru: false,
    });
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('returns 204 with valid token', async () => {
    const res = await app.post('/api/auth/logout').set(authHeader(accessToken));
    expect(res.status).toBe(204);
  });

  it('returns 401 without token', async () => {
    const res = await app.post('/api/auth/logout');
    expect(res.status).toBe(401);
  });

  it('invalidates the refresh token after logout', async () => {
    await app.post('/api/auth/logout').set(authHeader(accessToken));
    const refreshRes = await app.post('/api/auth/refresh').send({ refreshToken });
    expect(refreshRes.status).toBe(401);
  });

  it('clears all refresh tokens for the user in the DB', async () => {
    await app.post('/api/auth/logout').set(authHeader(accessToken));
    const count = await prisma.refreshToken.count();
    expect(count).toBe(0);
  });
});

// ─── GOOGLE AUTH ─────────────────────────────────────────────────────────────

describe('POST /api/auth/google', () => {
  it('creates a new user and returns tokens for a new Google account', async () => {
    const res = await app.post('/api/auth/google').send({ idToken: 'valid-google-id-token' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('google@example.com');
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('links googleId to existing email-based account', async () => {
    await createTestUser({ email: 'google@example.com', password: 'Password1!' });
    const res = await app.post('/api/auth/google').send({ idToken: 'valid-google-id-token' });
    expect(res.status).toBe(200);
    const user = await prisma.user.findUnique({ where: { email: 'google@example.com' } });
    expect(user?.googleId).toBe('google-uid-123');
  });

  it('returns 403 for inactive account', async () => {
    await createTestUser({ email: 'google@example.com', isActive: false });
    const res = await app.post('/api/auth/google').send({ idToken: 'valid-google-id-token' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('ACCOUNT_INACTIVE');
  });

  it('returns 401 for invalid Google token', async () => {
    // auth.service.ts now creates OAuth2Client per-call, so mockImplementationOnce works
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { OAuth2Client } = require('google-auth-library') as { OAuth2Client: jest.Mock };
    OAuth2Client.mockImplementationOnce(() => ({
      verifyIdToken: jest.fn().mockRejectedValueOnce(new Error('Token verification failed')),
    }));

    const res = await app.post('/api/auth/google').send({ idToken: 'bad-token' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_GOOGLE_TOKEN');
  });

  it('returns 422 for missing idToken', async () => {
    const res = await app.post('/api/auth/google').send({});
    expect(res.status).toBe(422);
  });
});
