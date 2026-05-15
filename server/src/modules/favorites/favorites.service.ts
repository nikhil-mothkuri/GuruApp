import { prisma } from '../../config/prisma';
import { guruRepository } from '../../repositories/guru.repository';
import { AppError } from '../../utils/appError';

export const favoritesService = {
  async getMyFavorites(studentId: string) {
    const favorites = await prisma.favorite.findMany({
      where: { studentId },
      include: {
        guru: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            skills: { select: { id: true, skillName: true } },
          },
        },
      },
    });
    return favorites.map((f) => f.guru);
  },

  async add(studentId: string, guruUserId: string) {
    const profile = await guruRepository.findByUserId(guruUserId);
    if (!profile) throw new AppError('Guru not found', 404, 'NOT_FOUND');
    return prisma.favorite.create({ data: { studentId, guruId: profile.id } });
  },

  async remove(studentId: string, guruUserId: string) {
    const profile = await guruRepository.findByUserId(guruUserId);
    if (!profile) throw new AppError('Guru not found', 404, 'NOT_FOUND');
    await prisma.favorite.deleteMany({ where: { studentId, guruId: profile.id } });
  },
};
