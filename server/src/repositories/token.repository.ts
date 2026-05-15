import { prisma } from '../config/prisma';
import crypto from 'crypto';

const hash = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const tokenRepository = {
  save: (userId: string, refreshToken: string, expiresAt: Date) =>
    prisma.refreshToken.create({ data: { userId, tokenHash: hash(refreshToken), expiresAt } }),

  findAndDelete: async (refreshToken: string) => {
    const h = hash(refreshToken);
    const record = await prisma.refreshToken.findUnique({ where: { tokenHash: h } });
    if (record) await prisma.refreshToken.delete({ where: { tokenHash: h } });
    return record;
  },

  deleteAllForUser: (userId: string) => prisma.refreshToken.deleteMany({ where: { userId } }),

  purgeExpired: () => prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
};
