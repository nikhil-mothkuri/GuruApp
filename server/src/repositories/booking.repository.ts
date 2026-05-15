import { prisma } from '../config/prisma';

const bookingInclude = {
  guru: { select: { id: true, name: true, avatarUrl: true } },
  student: { select: { id: true, name: true, avatarUrl: true } },
  slot: true,
  rating: true,
};

export const bookingRepository = {
  findById: (id: string) => prisma.booking.findUnique({ where: { id }, include: bookingInclude }),

  findByStudent: (studentId: string, status?: string) =>
    prisma.booking.findMany({
      where: { studentId, ...(status ? { status } : {}) },
      include: bookingInclude,
      orderBy: { scheduledAt: 'asc' },
    }),

  findByGuru: (guruId: string, filter?: 'upcoming' | 'past') => {
    const now = new Date();
    const dateFilter = filter === 'upcoming' ? { gte: now } : filter === 'past' ? { lt: now } : undefined;
    return prisma.booking.findMany({
      where: { guruId, ...(dateFilter ? { scheduledAt: dateFilter } : {}) },
      include: bookingInclude,
      orderBy: { scheduledAt: 'asc' },
    });
  },

  create: (data: {
    studentId: string;
    guruId: string;
    slotId?: string;
    type: string;
    scheduledAt: Date;
    recurrenceRule?: string;
  }) => prisma.booking.create({ data, include: bookingInclude }),

  updateStatus: (id: string, status: string) =>
    prisma.booking.update({ where: { id }, data: { status }, include: bookingInclude }),
};
