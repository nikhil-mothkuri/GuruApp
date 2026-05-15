import { prisma } from '../config/prisma';

export const slotRepository = {
  findByGuruProfileId: (guruId: string) =>
    prisma.availabilitySlot.findMany({ where: { guruId, isActive: true } }),

  findById: (id: string) => prisma.availabilitySlot.findUnique({ where: { id } }),

  create: (guruId: string, data: { dayOfWeek: number; startTime: string; endTime: string; slotDurationMins: number }) =>
    prisma.availabilitySlot.create({ data: { guruId, ...data } }),

  update: (id: string, data: { dayOfWeek?: number; startTime?: string; endTime?: string; slotDurationMins?: number; isActive?: boolean }) =>
    prisma.availabilitySlot.update({ where: { id }, data }),

  delete: (id: string) => prisma.availabilitySlot.update({ where: { id }, data: { isActive: false } }),
};
