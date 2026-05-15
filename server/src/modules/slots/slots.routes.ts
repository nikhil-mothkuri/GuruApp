import { Router, type Router as IRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireGuru } from '../../middleware/requireRole';
import { validate } from '../../middleware/validate';
import { createSlotSchema, updateSlotSchema } from '@guruapp/shared';
import { slotsController } from './slots.controller';

export const slotsRouter: IRouter = Router({ mergeParams: true });

// Public: GET /api/gurus/:id/slots
slotsRouter.get('/', slotsController.getByGuruId);

// Note: guru-side slot management lives in gurus.routes.ts as /me/slots/* to avoid
// routing conflicts with the /:id/slots pattern used here for public access.
