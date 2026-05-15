import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2).max(100),
  isGuru: z.boolean().default(false),
  isStudent: z.boolean().default(true),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export type SignupDto = z.infer<typeof signupSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RefreshDto = z.infer<typeof refreshSchema>;

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
    isGuru: z.boolean(),
    isStudent: z.boolean(),
    isAdmin: z.boolean(),
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

export const googleAuthSchema = z.object({ idToken: z.string().min(1) });
export type GoogleAuthDto = z.infer<typeof googleAuthSchema>;
