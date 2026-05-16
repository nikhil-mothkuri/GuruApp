import { z } from 'zod';

export const updateGuruProfileSchema = z.object({
  tagline: z.string().max(200).optional(),
  bio: z.string().max(1000).optional(),
  about: z.string().max(2000).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().max(30).optional(),
  alternatePhone: z.string().max(30).optional(),
  address: z.string().max(300).optional(),
  businessHours: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  whatsappNumber: z.string().max(30).optional(),
});

export const submitInquirySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  message: z.string().min(1).max(2000),
});

export type SubmitInquiryDto = z.infer<typeof submitInquirySchema>;

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
  imageUrl: z.string().nullable(),
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
  bannerUrl: z.string().nullable(),
  tagline: z.string().nullable(),
  about: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactPhone: z.string().nullable(),
  alternatePhone: z.string().nullable(),
  address: z.string().nullable(),
  businessHours: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  whatsappNumber: z.string().nullable(),
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
