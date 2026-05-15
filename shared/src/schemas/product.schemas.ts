import { z } from 'zod';

export const PRODUCT_STATUSES = ['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'ARCHIVED'] as const;
export const PRODUCT_CATEGORIES = [
  'Books & Courses',
  'Templates & Tools',
  'Coaching Plans',
  'Digital Downloads',
  'Physical Goods',
  'Software & Apps',
  'Art & Design',
  'Music & Audio',
  'Video & Film',
  'Other',
] as const;

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  shortDescription: z.string().max(300).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  sku: z.string().max(100).optional(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  isDigital: z.boolean().default(false),
  downloadUrl: z.string().url().optional(),
  category: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  status: z.enum(PRODUCT_STATUSES).default('DRAFT'),
  weight: z.number().positive().optional(),
  weightUnit: z.string().default('kg'),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  dimensionUnit: z.string().default('cm'),
  shippingRequired: z.boolean().default(true),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export const productSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  guruId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  isDigital: z.coerce.boolean().optional(),
  status: z.enum(PRODUCT_STATUSES).optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ProductSearchQuery = z.infer<typeof productSearchSchema>;

export const productImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  altText: z.string().nullable(),
  displayOrder: z.number(),
});

export const productSchema = z.object({
  id: z.string(),
  guruId: z.string(),
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  price: z.number(),
  compareAtPrice: z.number().nullable(),
  currency: z.string(),
  sku: z.string().nullable(),
  stock: z.number(),
  lowStockThreshold: z.number(),
  isDigital: z.boolean(),
  downloadUrl: z.string().nullable(),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  status: z.string(),
  weight: z.number().nullable(),
  weightUnit: z.string(),
  length: z.number().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  dimensionUnit: z.string(),
  shippingRequired: z.boolean(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  viewCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  images: z.array(productImageSchema),
  guru: z.object({
    id: z.string(),
    user: z.object({ name: z.string(), avatarUrl: z.string().nullable() }),
  }),
});

export type Product = z.infer<typeof productSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
