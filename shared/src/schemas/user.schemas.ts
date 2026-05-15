import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

export const userProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  isGuru: z.boolean(),
  isStudent: z.boolean(),
  isAdmin: z.boolean(),
  createdAt: z.string(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
