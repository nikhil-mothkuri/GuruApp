import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { ordersService } from './orders.service';

export const ordersController = {
  async placeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      const order = await ordersService.placeOrder(req.body, userId);
      res.status(201).json({ data: order });
    } catch (err) { next(err); }
  },

  async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ordersService.getMyOrders(req.user!.userId, req.query as never);
      res.json(result);
    } catch (err) { next(err); }
  },

  async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.getOrderById(req.user!.userId, req.params['id'] as string);
      res.json({ data: order });
    } catch (err) { next(err); }
  },

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.updateStatus(req.user!.userId, req.params['id'] as string, req.body);
      res.json({ data: order });
    } catch (err) { next(err); }
  },
};
