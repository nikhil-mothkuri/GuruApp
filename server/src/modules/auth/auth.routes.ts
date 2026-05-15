import { Router, type Router as IRouter } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { signupSchema, loginSchema, refreshSchema, googleAuthSchema } from '@guruapp/shared';
import { authController } from './auth.controller';

export const authRouter: IRouter = Router();

authRouter.post('/signup', validate(signupSchema), authController.signup);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/refresh', validate(refreshSchema), authController.refresh);
authRouter.post('/logout', authenticate, authController.logout);
authRouter.post('/google', validate(googleAuthSchema), authController.googleAuth);
