import { prisma } from '../config/prisma';

export const slotRepository = {
  findByGuruProfileId: (guruId: string) =>
    prisma.availabilitySlot.findMany({ where: { guruId, isActive: true } }),

  findById: (id: string) => prisma.availabilitySlot.findUnique({ where: { id } }),

  create: (
    guruId: string,
    data: {
      dayOfWeek?: number | null;
      date?: string | null;
      startDate?: string | null;
      endDate?: string | null;
      recurrenceRule?: { freq: 'DAILY'; until: string } | string | null;
      startTime?: string | null;
      endTime?: string | null;
      slotDurationMins?: number;
    },
  ) => {
    const payload = {
      guruId,
      dayOfWeek: data.dayOfWeek ?? null,
      date: data.date ?? null,
      startDate: data.startDate ?? null,
      endDate: data.endDate ?? null,
      recurrenceRule:
        data.recurrenceRule && typeof data.recurrenceRule !== 'string'
          ? JSON.stringify(data.recurrenceRule)
          : (data.recurrenceRule ?? null),
      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,
      slotDurationMins: data.slotDurationMins ?? null,
    } as any;

    return prisma.availabilitySlot.create({ data: payload });
  },

  update: (
    id: string,
    data: {
      dayOfWeek?: number | null;
      date?: string | null;
      startDate?: string | null;
      endDate?: string | null;
      recurrenceRule?: { freq: 'DAILY'; until: string } | string | null;
      startTime?: string | null;
      endTime?: string | null;
      slotDurationMins?: number;
      isActive?: boolean;
    },
  ) => {
    const payload: any = {};
    if (data.dayOfWeek !== undefined) payload.dayOfWeek = data.dayOfWeek;
    if (data.date !== undefined) payload.date = data.date;
    if (data.startDate !== undefined) payload.startDate = data.startDate;
    if (data.endDate !== undefined) payload.endDate = data.endDate;
    if (data.recurrenceRule !== undefined)
      payload.recurrenceRule =
        typeof data.recurrenceRule === 'object' && data.recurrenceRule !== null
          ? JSON.stringify(data.recurrenceRule)
          : data.recurrenceRule;
    if (data.startTime !== undefined) payload.startTime = data.startTime;
    if (data.endTime !== undefined) payload.endTime = data.endTime;
    if (data.slotDurationMins !== undefined) payload.slotDurationMins = data.slotDurationMins;
    if (data.isActive !== undefined) payload.isActive = data.isActive;

    return prisma.availabilitySlot.update({ where: { id }, data: payload });
  },

  delete: (id: string) =>
    prisma.availabilitySlot.update({ where: { id }, data: { isActive: false } }),
};
