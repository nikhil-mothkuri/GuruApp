import { z } from 'zod';

export const createRatingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type CreateRatingDto = z.infer<typeof createRatingSchema>;

export const ratingSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  studentId: z.string(),
  guruId: z.string(),
  stars: z.number(),
  comment: z.string().nullable(),
  createdAt: z.string(),
  student: z
    .object({
      name: z.string(),
      avatarUrl: z.string().nullable(),
    })
    .optional(),
});

export type Rating = z.infer<typeof ratingSchema>;
