import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../middleware/auth';

const IS_PROD = process.env['NODE_ENV'] === 'production';

const ACCESS_COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'strict' as const,
  maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: 'strict' as const,
  path: '/api/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTS);
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);
}

function clearAuthCookies(res: Response) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
}

export const authController = {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.status(201).json({ data: result });
    } catch (err) { next(err); }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({ data: result });
    } catch (err) { next(err); }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Accept token from cookie (preferred) or body (API clients / tests)
      const token = req.cookies?.['refreshToken'] as string | undefined ?? req.body.refreshToken;
      const result = await authService.refresh(token);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({ data: result });
    } catch (err) { next(err); }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.logout(req.user!.userId);
      clearAuthCookies(res);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.googleAuth(req.body);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({ data: result });
    } catch (err) { next(err); }
  },
};
