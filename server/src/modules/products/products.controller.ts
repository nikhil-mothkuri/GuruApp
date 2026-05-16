import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { productsService } from './products.service';

export const productsController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productsService.search(req.query as never);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productsService.getById(req.params['id'] as string);
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productsService.getBySlug(req.params['slug'] as string);
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  },

  async getMyProducts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query['page'] ?? 1);
      const limit = Number(req.query['limit'] ?? 20);
      const result = await productsService.getMyProducts(req.user!.userId, page, limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productsService.create(req.user!.userId, req.body);
      res.status(201).json({ data: product });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await productsService.update(
        req.user!.userId,
        req.params['id'] as string,
        req.body,
      );
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await productsService.delete(req.user!.userId, req.params['id'] as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async addImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) return next(new Error('No file uploaded'));
      const image = await productsService.addImage(
        req.user!.userId,
        req.params['id'] as string,
        req.file.buffer,
        req.file.originalname,
        req.body.altText as string | undefined,
      );
      res.status(201).json({ data: image });
    } catch (err) {
      next(err);
    }
  },

  async deleteImage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await productsService.deleteImage(
        req.user!.userId,
        req.params['id'] as string,
        req.params['imageId'] as string,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
