import { prisma } from '../config/prisma';

const guruProfileSelect = {
  id: true,
  tagline: true,
  about: true,
  bannerUrl: true,
  contactEmail: true,
  contactPhone: true,
  alternatePhone: true,
  address: true,
  businessHours: true,
  websiteUrl: true,
  whatsappNumber: true,
  ratingAvg: true,
  ratingCount: true,
};

const guruInclude = {
  user: { select: { id: true, name: true, bio: true, avatarUrl: true } },
  skills: { select: { id: true, skillName: true } },
  photos: {
    select: { id: true, url: true, caption: true, displayOrder: true },
    orderBy: { displayOrder: 'asc' as const },
  },
  videos: { select: { id: true, youtubeUrl: true, title: true, thumbnailUrl: true } },
};

export { guruProfileSelect };

export const guruRepository = {
  findByUserId: (userId: string) =>
    prisma.guruProfile.findUnique({ where: { userId }, include: guruInclude }),

  findById: (id: string) => prisma.guruProfile.findUnique({ where: { id }, include: guruInclude }),

  search: async (q: string | undefined, skill: string | undefined, skip: number, take: number) => {
    const where: Record<string, unknown> = { user: { isActive: true } };
    if (q) where.user = { ...(where.user as object), name: { contains: q } };
    if (skill) where.skills = { some: { skillName: { contains: skill } } };

    const [items, total] = await Promise.all([
      prisma.guruProfile.findMany({
        where,
        skip,
        take,
        include: guruInclude,
        orderBy: { ratingAvg: 'desc' },
      }),
      prisma.guruProfile.count({ where }),
    ]);
    return { items, total };
  },

  upsert: (
    userId: string,
    data: {
      tagline?: string;
      about?: string;
      bannerUrl?: string;
      contactEmail?: string;
      contactPhone?: string;
      alternatePhone?: string;
      address?: string;
      businessHours?: string;
      websiteUrl?: string;
      whatsappNumber?: string;
    },
  ) =>
    prisma.guruProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
      include: guruInclude,
    }),

  setBanner: (userId: string, bannerUrl: string) =>
    prisma.guruProfile.upsert({
      where: { userId },
      update: { bannerUrl },
      create: { userId, bannerUrl },
      include: guruInclude,
    }),

  createInquiry: (guruId: string, data: { name: string; email: string; phone?: string; message: string }) =>
    prisma.inquiry.create({ data: { guruId, ...data } }),

  findGuruContactEmail: async (guruId: string) => {
    const profile = await prisma.guruProfile.findUnique({
      where: { id: guruId },
      select: { contactEmail: true, user: { select: { email: true, name: true } } },
    });
    return profile;
  },

  addSkill: (guruId: string, skillName: string) =>
    prisma.guruSkill.create({ data: { guruId, skillName } }),

  deleteSkill: (id: string, guruId: string) => prisma.guruSkill.delete({ where: { id, guruId } }),

  addPhoto: (guruId: string, url: string, caption?: string) =>
    prisma.guruPhoto.create({ data: { guruId, url, caption } }),

  deletePhoto: (id: string, guruId: string) => prisma.guruPhoto.delete({ where: { id, guruId } }),

  addVideo: (guruId: string, youtubeUrl: string, title: string, thumbnailUrl?: string) =>
    prisma.guruVideo.create({ data: { guruId, youtubeUrl, title, thumbnailUrl } }),

  deleteVideo: (id: string, guruId: string) => prisma.guruVideo.delete({ where: { id, guruId } }),

  suggestions: async (q: string, limit = 5) => {
    const [names, skills] = await Promise.all([
      prisma.guruProfile.findMany({
        where: { user: { isActive: true, name: { contains: q } } },
        select: { id: true, user: { select: { name: true, avatarUrl: true } } },
        take: limit,
        orderBy: { ratingAvg: 'desc' },
      }),
      prisma.guruSkill.findMany({
        where: { skillName: { contains: q } },
        select: { skillName: true },
        distinct: ['skillName'],
        take: limit,
        orderBy: { skillName: 'asc' },
      }),
    ]);
    return { names, skills: skills.map((s: { skillName: string }) => s.skillName) };
  },

  updateRating: async (guruId: string) => {
    const agg = await prisma.rating.aggregate({
      where: { guruId },
      _avg: { stars: true },
      _count: { stars: true },
    });
    await prisma.guruProfile.update({
      where: { id: guruId },
      data: { ratingAvg: agg._avg.stars ?? 0, ratingCount: agg._count.stars },
    });
  },
};
