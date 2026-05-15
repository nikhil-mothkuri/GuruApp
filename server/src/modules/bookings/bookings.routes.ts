import { Router, type Router as IRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createBookingSchema, createRatingSchema } from '@guruapp/shared';
import { bookingsController } from './bookings.controller';
import { ratingsService } from '../ratings/ratings.service';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';

export const bookingsRouter: IRouter = Router();

bookingsRouter.use(authenticate);

bookingsRouter.get('/', bookingsController.getMyBookings);
bookingsRouter.post('/', validate(createBookingSchema), bookingsController.create);
bookingsRouter.patch('/:id/cancel', bookingsController.cancel);
bookingsRouter.get('/guru', bookingsController.getGuruBookings);

// Rating on a booking
bookingsRouter.post('/:bookingId/rating', validate(createRatingSchema), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const rating = await ratingsService.create(req.user!.userId, req.params['bookingId'] as string, req.body);
    res.status(201).json({ data: rating });
  } catch (err) { next(err); }
});

// Guru ratings list exposed under /api/gurus/:id/ratings — handled in gurus router
