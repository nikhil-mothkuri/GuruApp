import { prisma } from '../config/prisma';

export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, bio: true, avatarUrl: true, isGuru: true, isStudent: true, isAdmin: true, isActive: true, createdAt: true },
    }),

  create: (data: { email: string; passwordHash?: string; name: string; isGuru: boolean; isStudent: boolean; googleId?: string; avatarUrl?: string }) =>
    prisma.user.create({ data }),

  update: (id: string, data: { name?: string; bio?: string; avatarUrl?: string }) =>
    prisma.user.update({ where: { id }, data }),

  findByGoogleId: (googleId: string) => prisma.user.findUnique({ where: { googleId } }),

  linkGoogleId: (id: string, googleId: string, avatarUrl?: string) =>
    prisma.user.update({ where: { id }, data: { googleId, ...(avatarUrl ? { avatarUrl } : {}) } }),
};
