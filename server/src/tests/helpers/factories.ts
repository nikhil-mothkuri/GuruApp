import { prisma } from '~/config/prisma';
import { hashPassword } from '~/utils/bcrypt';
import { signAccessToken, signRefreshToken } from '~/utils/jwt';

interface CreateUserOpts {
  email?: string;
  name?: string;
  password?: string;
  isGuru?: boolean;
  isStudent?: boolean;
  isAdmin?: boolean;
  isActive?: boolean;
  googleId?: string;
  passwordHash?: string | null;
}

export async function createTestUser(opts: CreateUserOpts = {}) {
  const passwordHash =
    opts.passwordHash !== undefined
      ? opts.passwordHash
      : await hashPassword(opts.password ?? 'Password1!');

  return prisma.user.create({
    data: {
      email: opts.email ?? `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
      name: opts.name ?? 'Test User',
      passwordHash,
      googleId: opts.googleId,
      isGuru: opts.isGuru ?? false,
      isStudent: opts.isStudent ?? true,
      isAdmin: opts.isAdmin ?? false,
      isActive: opts.isActive ?? true,
    },
  });
}

export async function createTestGuru(opts: CreateUserOpts = {}) {
  const user = await createTestUser({ isGuru: true, isStudent: false, ...opts });
  const profile = await prisma.guruProfile.create({
    data: { userId: user.id, tagline: 'Test tagline' },
  });
  return { user, profile };
}

export async function createActiveProduct(
  guruProfileId: string,
  overrides: Partial<{
    name: string;
    price: number;
    stock: number;
    isDigital: boolean;
    status: string;
  }> = {},
) {
  const name = overrides.name ?? `Product-${Date.now()}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
  return prisma.product.create({
    data: {
      guruId: guruProfileId,
      name,
      slug,
      price: overrides.price ?? 29.99,
      stock: overrides.stock ?? 100,
      isDigital: overrides.isDigital ?? true,
      status: overrides.status ?? 'ACTIVE',
      currency: 'USD',
    },
  });
}

export async function createCompletedBooking(studentId: string, guruUserId: string) {
  return prisma.booking.create({
    data: {
      studentId,
      guruId: guruUserId,
      type: 'APPOINTMENT',
      scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'COMPLETED',
    },
  });
}

export function makeAccessToken(userId: string, email: string) {
  return signAccessToken({ userId, email });
}

export function makeRefreshToken(userId: string, email: string) {
  return signRefreshToken({ userId, email });
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}
