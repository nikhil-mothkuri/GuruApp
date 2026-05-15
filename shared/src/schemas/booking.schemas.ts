import { z } from 'zod';

export const BookingType = {
  SUBSCRIPTION: 'SUBSCRIPTION',
  APPOINTMENT: 'APPOINTMENT',
} as const;

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const createBookingSchema = z
  .object({
    guruId: z.string(),
    slotId: z.string().optional(),
    type: z.enum(['SUBSCRIPTION', 'APPOINTMENT']),
    scheduledAt: z.string().datetime(),
    recurrenceRule: z
      .object({
        freq: z.literal('DAILY'),
        until: z.string().datetime(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'APPOINTMENT' && !data.slotId) return false;
      if (data.type === 'SUBSCRIPTION' && !data.recurrenceRule) return false;
      return true;
    },
    {
      message: 'APPOINTMENT requires slotId; SUBSCRIPTION requires recurrenceRule',
    },
  );

export type CreateBookingDto = z.infer<typeof createBookingSchema>;

export const bookingSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  guruId: z.string(),
  slotId: z.string().nullable(),
  type: z.enum(['SUBSCRIPTION', 'APPOINTMENT']),
  scheduledAt: z.string(),
  recurrenceRule: z.string().nullable(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
  createdAt: z.string(),
  guru: z
    .object({
      id: z.string(),
      name: z.string(),
      avatarUrl: z.string().nullable(),
    })
    .optional(),
  student: z
    .object({
      id: z.string(),
      name: z.string(),
      avatarUrl: z.string().nullable(),
    })
    .optional(),
  rating: z
    .object({
      id: z.string(),
      stars: z.number(),
      comment: z.string().nullable(),
    })
    .nullable()
    .optional(),
});

export type Booking = z.infer<typeof bookingSchema>;
