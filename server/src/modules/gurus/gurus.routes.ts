import { Router, type Router as IRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireGuru } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import {
  updateGuruProfileSchema,
  addSkillSchema,
  addVideoSchema,
  guruSearchSchema,
  createSlotSchema,
  updateSlotSchema,
  submitInquirySchema,
} from '@guruapp/shared';
import { gurusController } from './gurus.controller';
import { slotsController } from '../slots/slots.controller';
import { slotsRouter } from '../slots/slots.routes';
import { ratingsService } from '../ratings/ratings.service';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';

export const gurusRouter: IRouter = Router();

// Public routes
gurusRouter.get('/', validate(guruSearchSchema, 'query'), gurusController.search);
gurusRouter.get('/suggestions', gurusController.suggestions);

// Guru slot management and profile routes must come before /:id catch-all
gurusRouter.get('/me/slots', authenticate, requireGuru(), slotsController.getMySlots);
gurusRouter.post(
  '/me/slots',
  authenticate,
  requireGuru(),
  validate(createSlotSchema),
  slotsController.create,
);
gurusRouter.put(
  '/me/slots/:slotId',
  authenticate,
  requireGuru(),
  validate(updateSlotSchema),
  slotsController.update,
);
gurusRouter.delete('/me/slots/:slotId', authenticate, requireGuru(), slotsController.delete);

gurusRouter.get('/me/profile', authenticate, requireGuru(), gurusController.getMyProfile);
gurusRouter.put(
  '/me/profile',
  authenticate,
  requireGuru(),
  validate(updateGuruProfileSchema),
  gurusController.upsertMyProfile,
);
gurusRouter.post(
  '/me/skills',
  authenticate,
  requireGuru(),
  validate(addSkillSchema),
  gurusController.addSkill,
);
gurusRouter.delete('/me/skills/:skillId', authenticate, requireGuru(), gurusController.deleteSkill);
gurusRouter.post(
  '/me/photos',
  authenticate,
  requireGuru(),
  upload.single('photo'),
  gurusController.addPhoto,
);
gurusRouter.delete('/me/photos/:photoId', authenticate, requireGuru(), gurusController.deletePhoto);
gurusRouter.post(
  '/me/videos',
  authenticate,
  requireGuru(),
  validate(addVideoSchema),
  gurusController.addVideo,
);
gurusRouter.delete('/me/videos/:videoId', authenticate, requireGuru(), gurusController.deleteVideo);
gurusRouter.post(
  '/me/banner',
  authenticate,
  requireGuru(),
  upload.single('banner'),
  gurusController.uploadBanner,
);

gurusRouter.get('/:id', gurusController.getById);
gurusRouter.post('/:id/inquire', validate(submitInquirySchema), gurusController.submitInquiry);
gurusRouter.use('/:id/slots', slotsRouter);

// Ratings for a guru (public)
gurusRouter.get('/:id/ratings', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query['page'] ?? 1);
    const limit = Number(req.query['limit'] ?? 20);
    const result = await ratingsService.getByGuruId(req.params['id'] as string, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
