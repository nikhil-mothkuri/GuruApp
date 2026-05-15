import { prisma } from '../config/prisma';
import { CreateProductDto, UpdateProductDto, ProductSearchQuery } from '@guruapp/shared';

const productInclude = {
  images: { orderBy: { displayOrder: 'asc' as const } },
  guru: { select: { id: true, user: { select: { name: true, avatarUrl: true } } } },
};

function buildSlug(name: string, id: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    id.slice(-6)
  );
}

export const productRepository = {
  findById: (id: string) =>
    prisma.product.findUnique({ where: { id }, include: productInclude }),

  findBySlug: (slug: string) =>
    prisma.product.findUnique({ where: { slug }, include: productInclude }),

  findByGuruProfileId: (guruId: string, skip: number, take: number) =>
    Promise.all([
      prisma.product.findMany({ where: { guruId }, skip, take, include: productInclude, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where: { guruId } }),
    ]).then(([items, total]) => ({ items, total })),

  search: async (query: ProductSearchQuery) => {
    const { q, category, guruId, minPrice, maxPrice, isDigital, status, sortBy, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { status: status ?? 'ACTIVE' };
    if (q) where['name'] = { contains: q };
    if (category) where['category'] = category;
    if (guruId) where['guruId'] = guruId;
    if (isDigital !== undefined) where['isDigital'] = isDigital;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where['price'] = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }

    const orderBy =
      sortBy === 'price_asc' ? { price: 'asc' as const }
      : sortBy === 'price_desc' ? { price: 'desc' as const }
      : sortBy === 'popular' ? { viewCount: 'desc' as const }
      : { createdAt: 'desc' as const };

    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, include: productInclude, orderBy }),
      prisma.product.count({ where }),
    ]);
    return { items, total };
  },

  create: async (guruId: string, data: CreateProductDto) => {
    const tempId = Math.random().toString(36).slice(2, 8);
    const { tags, ...rest } = data;
    const product = await prisma.product.create({
      data: {
        ...rest,
        guruId,
        slug: buildSlug(data.name, tempId),
        tags: tags ? JSON.stringify(tags) : null,
      },
      include: productInclude,
    });
    // re-slug with real id
    const slug = buildSlug(data.name, product.id);
    return prisma.product.update({ where: { id: product.id }, data: { slug }, include: productInclude });
  },

  update: async (id: string, guruId: string, data: UpdateProductDto) => {
    const { tags, name, ...rest } = data;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.guruId !== guruId) return null;
    const slug = name ? buildSlug(name, id) : undefined;
    return prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(name ? { name } : {}),
        ...(slug ? { slug } : {}),
        ...(tags !== undefined ? { tags: JSON.stringify(tags) } : {}),
      },
      include: productInclude,
    });
  },

  delete: async (id: string, guruId: string) => {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.guruId !== guruId) return null;
    return prisma.product.delete({ where: { id } });
  },

  addImage: (productId: string, url: string, altText?: string, displayOrder = 0) =>
    prisma.productImage.create({ data: { productId, url, altText, displayOrder } }),

  deleteImage: (id: string, productId: string) =>
    prisma.productImage.delete({ where: { id, productId } }),

  incrementViewCount: (id: string) =>
    prisma.product.update({ where: { id }, data: { viewCount: { increment: 1 } } }),
};
