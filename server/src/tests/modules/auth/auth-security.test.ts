import { createTestApp } from '../../helpers/app';
import { createTestUser, authHeader, makeAccessToken } from '../../helpers/factories';
import { prisma } from '~/config/prisma';

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => ({ sub: 'g-123', email: 'g@example.com', name: 'G User', picture: null }),
    }),
  })),
}));

const app = createTestApp();

// ─── ACCOUNT LOCKOUT ────────────────────────────────────────────────────────

describe('Account lockout after repeated failed logins', () => {
  const email = 'lockout@example.com';
  const password = 'CorrectPass1!';

  beforeEach(async () => {
    await createTestUser({ email, password });
  });

  it('allows login with correct credentials before any failures', async () => {
    const res = await app.post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
  });

  it('increments failedLoginCount on wrong password', async () => {
    await app.post('/api/auth/login').send({ email, password: 'Wrong1!' });
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user!.failedLoginCount).toBe(1);
  });

  it('locks account after 5 consecutive failures', async () => {
    for (let i = 0; i < 5; i++) {
      await app.post('/api/auth/login').send({ email, password: 'Wrong1!' });
    }
    const res = await app.post('/api/auth/login').send({ email, password: 'Wrong1!' });
    expect(res.status).toBe(423);
    expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
  });

  it('correct password also rejected while locked', async () => {
    for (let i = 0; i < 5; i++) {
      await app.post('/api/auth/login').send({ email, password: 'Wrong1!' });
    }
    const res = await app.post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(423);
    expect(res.body.error.code).toBe('ACCOUNT_LOCKED');
  });

  it('resets failedLoginCount to 0 after successful login', async () => {
    await app.post('/api/auth/login').send({ email, password: 'Wrong1!' });
    await app.post('/api/auth/login').send({ email, password }); // success
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user!.failedLoginCount).toBe(0);
    expect(user!.lockedUntil).toBeNull();
  });

  it('allows login after lock expires (lockedUntil in past)', async () => {
    // Manually set lockedUntil to the past to simulate expiry
    await prisma.user.update({
      where: { email },
      data: { failedLoginCount: 5, lockedUntil: new Date(Date.now() - 1000) },
    });
    const res = await app.post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
  });
});

// ─── HTTPONLY COOKIES ────────────────────────────────────────────────────────

describe('httpOnly cookies on auth endpoints', () => {
  it('login sets accessToken and refreshToken as httpOnly cookies', async () => {
    await createTestUser({ email: 'cookie@example.com', password: 'Pass1234!' });
    const res = await app.post('/api/auth/login').send({ email: 'cookie@example.com', password: 'Pass1234!' });

    expect(res.status).toBe(200);
    const setCookieHeader = res.headers['set-cookie'] as string[] | string | undefined;
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader ?? ''];
    const accessCookie = cookies.find((c) => c.startsWith('accessToken='));
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));

    expect(accessCookie).toBeDefined();
    expect(accessCookie).toMatch(/HttpOnly/i);
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toMatch(/HttpOnly/i);
  });

  it('signup sets cookies', async () => {
    const res = await app.post('/api/auth/signup').send({
      email: 'signup-cookie@example.com', name: 'Cookie User',
      password: 'Pass1234!', isStudent: true, isGuru: false,
    });
    expect(res.status).toBe(201);
    const rawCookies = res.headers['set-cookie'];
    const cookies: string[] = Array.isArray(rawCookies) ? rawCookies : (rawCookies ? [rawCookies] : []);
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true);
  });

  it('logout clears cookies', async () => {
    await createTestUser({ email: 'logout-cookie@example.com', password: 'Pass1234!' });
    const loginRes = await app.post('/api/auth/login').send({ email: 'logout-cookie@example.com', password: 'Pass1234!' });
    const token = loginRes.body.data.accessToken;

    const logoutRes = await app.post('/api/auth/logout').set(authHeader(token));
    expect(logoutRes.status).toBe(204);

    const rawLogoutCookies = logoutRes.headers['set-cookie'];
    const logoutCookies: string[] = Array.isArray(rawLogoutCookies) ? rawLogoutCookies : (rawLogoutCookies ? [rawLogoutCookies] : []);
    const clearedAccess = logoutCookies.find((c) => c.startsWith('accessToken='));
    // Cleared cookies have an empty value or Max-Age=0
    expect(clearedAccess).toBeDefined();
  });

  it('protected route works with Authorization header (header fallback)', async () => {
    const user = await createTestUser({ email: 'header@example.com' });
    const token = makeAccessToken(user.id, user.email);

    const res = await app.get('/api/users/me').set(authHeader(token));
    expect(res.status).toBe(200);
  });

  it('protected route returns 401 with no token at all', async () => {
    const res = await app.get('/api/users/me');
    expect(res.status).toBe(401);
  });
});
