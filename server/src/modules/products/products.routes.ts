import { Router, type Router as IRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireGuru } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import { createProductSchema, updateProductSchema, productSearchSchema } from '@guruapp/shared';
import { productsController } from './products.controller';

export const productsRouter: IRouter = Router();

// Public routes
productsRouter.get('/', validate(productSearchSchema, 'query'), productsController.search);
productsRouter.get('/slug/:slug', productsController.getBySlug);
productsRouter.get('/:id', productsController.getById);

// Guru-only routes
productsRouter.get('/me/products', authenticate, requireGuru(), productsController.getMyProducts);
productsRouter.post('/', authenticate, requireGuru(), validate(createProductSchema), productsController.create);
productsRouter.put('/:id', authenticate, requireGuru(), validate(updateProductSchema), productsController.update);
productsRouter.delete('/:id', authenticate, requireGuru(), productsController.delete);
productsRouter.post('/:id/images', authenticate, requireGuru(), upload.single('image'), productsController.addImage);
productsRouter.delete('/:id/images/:imageId', authenticate, requireGuru(), productsController.deleteImage);
