import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const baseSlotObject = z.object({
  // Mode controls how the slot is interpreted:
  // - WEEKLY: recurring weekly on `dayOfWeek` (backwards-compatible)
  // - ONE_TIME: a single availability on a specific `date`
  // - DAILY_RANGE: daily sessions between `startDate` and `endDate` (inclusive)
  mode: z.enum(['WEEKLY', 'ONE_TIME', 'DAILY_RANGE']).optional().default('WEEKLY'),

  // Weekly mode (existing behavior)
  dayOfWeek: z.number().int().min(0).max(6).optional(),

  // One-time slot: specific ISO datetime for the session start (date + time)
  date: z.string().datetime().optional(),

  // Daily range mode: start/end ISO datetimes (dates only recommended)
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),

  // Simple recurrence rule for range-based subscriptions (keeps parity with bookings)
  recurrenceRule: z
    .object({
      freq: z.literal('DAILY'),
      until: z.string().datetime(),
    })
    .optional(),

  // Time window (applies to all modes except one-time which may embed time in `date`)
  startTime: z.string().regex(timeRegex, 'Must be HH:MM format').optional(),
  endTime: z.string().regex(timeRegex, 'Must be HH:MM format').optional(),

  slotDurationMins: z.number().int().min(15).max(480).default(60),
});

export const createSlotSchema = baseSlotObject.refine(
  (data) => {
    if (data.mode === 'WEEKLY')
      return typeof data.dayOfWeek === 'number' && !!data.startTime && !!data.endTime;
    if (data.mode === 'ONE_TIME') return !!data.date;
    if (data.mode === 'DAILY_RANGE')
      return !!data.startDate && !!data.endDate && !!data.startTime && !!data.endTime;
    return false;
  },
  { message: 'Invalid slot data for the selected mode' },
);

export const updateSlotSchema = baseSlotObject.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateSlotDto = z.infer<typeof createSlotSchema>;
export type UpdateSlotDto = z.infer<typeof updateSlotSchema>;

export const availabilitySlotSchema = z.object({
  id: z.string(),
  guruId: z.string(),
  // dayOfWeek may be null for one-time or range-based slots
  dayOfWeek: z.number().nullable(),
  // one-time/date and range fields
  date: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  recurrenceRule: z.string().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  slotDurationMins: z.number(),
  isActive: z.boolean(),
});

export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
