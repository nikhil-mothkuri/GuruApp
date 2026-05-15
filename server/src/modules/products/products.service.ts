import { CreateProductDto, UpdateProductDto, ProductSearchQuery } from '@guruapp/shared';
import { productRepository } from '../../repositories/product.repository';
import { guruRepository } from '../../repositories/guru.repository';
import { savePhoto, deleteFile } from '../../utils/storage';
import { AppError } from '../../utils/appError';

function parseTags(tagsJson: string | null): string[] {
  if (!tagsJson) return [];
  try { return JSON.parse(tagsJson); } catch { return []; }
}

function normalise(p: Awaited<ReturnType<typeof productRepository.findById>>) {
  if (!p) return null;
  return { ...p, tags: parseTags(p.tags) };
}

export const productsService = {
  async search(query: ProductSearchQuery) {
    const { items, total } = await productRepository.search(query);
    return {
      data: items.map((p) => normalise(p)!),
      meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    await productRepository.incrementViewCount(id);
    return normalise(product)!;
  },

  async getBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw new AppError('Product not found', 404, 'NOT_FOUND');
    await productRepository.incrementViewCount(product.id);
    return normalise(product)!;
  },

  async getMyProducts(userId: string, page: number, limit: number) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    const skip = (page - 1) * limit;
    const { items, total } = await productRepository.findByGuruProfileId(profile.id, skip, limit);
    return {
      data: items.map((p) => normalise(p)!),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async create(userId: string, dto: CreateProductDto) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    const product = await productRepository.create(profile.id, dto);
    return normalise(product)!;
  },

  async update(userId: string, productId: string, dto: UpdateProductDto) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    const product = await productRepository.update(productId, profile.id, dto);
    if (!product) throw new AppError('Product not found or not yours', 404, 'NOT_FOUND');
    return normalise(product)!;
  },

  async delete(userId: string, productId: string) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    const result = await productRepository.delete(productId, profile.id);
    if (!result) throw new AppError('Product not found or not yours', 404, 'NOT_FOUND');
  },

  async addImage(userId: string, productId: string, buffer: Buffer, originalname: string, altText?: string) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    const product = await productRepository.findById(productId);
    if (!product || product.guruId !== profile.id) throw new AppError('Product not found or not yours', 404, 'NOT_FOUND');
    const { url } = await savePhoto(buffer, originalname);
    const displayOrder = product.images.length;
    return productRepository.addImage(productId, url, altText, displayOrder);
  },

  async deleteImage(userId: string, productId: string, imageId: string) {
    const profile = await guruRepository.findByUserId(userId);
    if (!profile) throw new AppError('Guru profile not found', 404, 'NOT_FOUND');
    const product = await productRepository.findById(productId);
    if (!product || product.guruId !== profile.id) throw new AppError('Product not found or not yours', 404, 'NOT_FOUND');
    const image = product.images.find((i) => i.id === imageId);
    if (!image) throw new AppError('Image not found', 404, 'NOT_FOUND');
    await productRepository.deleteImage(imageId, productId);
    await deleteFile(image.url);
  },
};
