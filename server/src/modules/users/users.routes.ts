import { Router, type Router as IRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { upload } from '../../middleware/upload';
import { updateUserSchema } from '@guruapp/shared';
import { usersController } from './users.controller';

export const usersRouter: IRouter = Router();

usersRouter.use(authenticate);
usersRouter.get('/me', usersController.getMe);
usersRouter.patch('/me', validate(updateUserSchema), usersController.updateMe);
usersRouter.post('/me/avatar', upload.single('avatar'), usersController.uploadAvatar);
