import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { usersService } from './users.service';

export const usersController = {
  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.getMe(req.user!.userId);
      res.json({ data: user });
    } catch (err) { next(err); }
  },

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.updateMe(req.user!.userId, req.body);
      res.json({ data: user });
    } catch (err) { next(err); }
  },

  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) return next(new Error('No file uploaded'));
      const result = await usersService.updateAvatar(req.user!.userId, req.file.buffer, req.file.originalname);
      res.json({ data: result });
    } catch (err) { next(err); }
  },
};
