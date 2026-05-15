import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { bookingsService } from './bookings.service';

export const bookingsController = {
  async getMyBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookings = await bookingsService.getMyBookings(req.user!.userId, req.query.status as string);
      res.json({ data: bookings });
    } catch (err) { next(err); }
  },

  async getGuruBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookings = await bookingsService.getGuruBookings(req.user!.userId, req.query['filter'] as 'upcoming' | 'past' | undefined);
      res.json({ data: bookings });
    } catch (err) { next(err); }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingsService.create(req.user!.userId, req.body);
      res.status(201).json({ data: booking });
    } catch (err) { next(err); }
  },

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingsService.cancel(req.user!.userId, req.params['id'] as string);
      res.json({ data: booking });
    } catch (err) { next(err); }
  },
};
