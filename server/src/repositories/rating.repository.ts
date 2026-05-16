import { prisma } from '../config/prisma';

export const ratingRepository = {
  findByBookingId: (bookingId: string) => prisma.rating.findUnique({ where: { bookingId } }),

  findByGuruId: (guruId: string, skip: number, take: number) =>
    Promise.all([
      prisma.rating.findMany({
        where: { guruId },
        skip,
        take,
        include: { student: { select: { name: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rating.count({ where: { guruId } }),
    ]),

  create: (data: {
    bookingId: string;
    studentId: string;
    guruId: string;
    stars: number;
    comment?: string;
  }) => prisma.rating.create({ data }),
};
