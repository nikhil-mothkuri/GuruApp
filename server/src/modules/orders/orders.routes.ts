import { Router, type Router as IRouter } from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';
import { requireGuru } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createOrderSchema, updateOrderStatusSchema, orderSearchSchema } from '@guruapp/shared';
import { ordersController } from './orders.controller';

export const ordersRouter: IRouter = Router();

// Anyone can place an order; if logged in their userId is attached
ordersRouter.post('/', optionalAuthenticate, validate(createOrderSchema), ordersController.placeOrder);

// Guru-only: view and manage their incoming orders
ordersRouter.get('/me', authenticate, requireGuru(), validate(orderSearchSchema, 'query'), ordersController.getMyOrders);
ordersRouter.get('/me/:id', authenticate, requireGuru(), ordersController.getOrderById);
ordersRouter.patch('/me/:id/status', authenticate, requireGuru(), validate(updateOrderStatusSchema), ordersController.updateStatus);
