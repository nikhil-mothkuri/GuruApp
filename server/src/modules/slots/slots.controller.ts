import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { slotsService } from './slots.service';

export const slotsController = {
  async getByGuruId(req: Request, res: Response, next: NextFunction) {
    try {
      const slots = await slotsService.getByGuruId(req.params['id'] as string);
      res.json({ data: slots });
    } catch (err) {
      next(err);
    }
  },

  async getMySlots(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slots = await slotsService.getMySlots(req.user!.userId);
      res.json({ data: slots });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slot = await slotsService.create(req.user!.userId, req.body);
      res.status(201).json({ data: slot });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slot = await slotsService.update(
        req.user!.userId,
        req.params['slotId'] as string,
        req.body,
      );
      res.json({ data: slot });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await slotsService.delete(req.user!.userId, req.params['slotId'] as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
