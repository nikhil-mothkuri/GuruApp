import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex, 'Must be HH:MM format'),
  endTime: z.string().regex(timeRegex, 'Must be HH:MM format'),
  slotDurationMins: z.number().int().min(15).max(480).default(60),
});

export const updateSlotSchema = createSlotSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateSlotDto = z.infer<typeof createSlotSchema>;
export type UpdateSlotDto = z.infer<typeof updateSlotSchema>;

export const availabilitySlotSchema = z.object({
  id: z.string(),
  guruId: z.string(),
  dayOfWeek: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  slotDurationMins: z.number(),
  isActive: z.boolean(),
});

export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
