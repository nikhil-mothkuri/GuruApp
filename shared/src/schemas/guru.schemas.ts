import { z } from 'zod';

export const updateGuruProfileSchema = z.object({
  tagline: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
});

export type UpdateGuruProfileDto = z.infer<typeof updateGuruProfileSchema>;

export const addSkillSchema = z.object({
  skillName: z.string().min(1).max(50),
});

export type AddSkillDto = z.infer<typeof addSkillSchema>;

export const addVideoSchema = z.object({
  youtubeUrl: z
    .string()
    .url()
    .refine(
      (url) => url.includes('youtube.com') || url.includes('youtu.be'),
      'Must be a YouTube URL',
    ),
  title: z.string().min(1).max(200),
});

export type AddVideoDto = z.infer<typeof addVideoSchema>;

export const guruSearchSchema = z.object({
  q: z.string().optional(),
  skill: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type GuruSearchQuery = z.infer<typeof guruSearchSchema>;

export const guruSkillSchema = z.object({
  id: z.string(),
  skillName: z.string(),
});

export const guruPhotoSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string().nullable(),
  displayOrder: z.number(),
});

export const guruVideoSchema = z.object({
  id: z.string(),
  youtubeUrl: z.string(),
  title: z.string(),
  thumbnailUrl: z.string().nullable(),
});

export const guruCardSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
  tagline: z.string().nullable(),
  ratingAvg: z.number(),
  ratingCount: z.number(),
  skills: z.array(guruSkillSchema),
});

export const guruDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  bio: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  tagline: z.string().nullable(),
  ratingAvg: z.number(),
  ratingCount: z.number(),
  skills: z.array(guruSkillSchema),
  photos: z.array(guruPhotoSchema),
  videos: z.array(guruVideoSchema),
});

export type GuruCard = z.infer<typeof guruCardSchema>;
export type GuruDetail = z.infer<typeof guruDetailSchema>;
export type GuruSkill = z.infer<typeof guruSkillSchema>;
export type GuruPhoto = z.infer<typeof guruPhotoSchema>;
export type GuruVideo = z.infer<typeof guruVideoSchema>;
