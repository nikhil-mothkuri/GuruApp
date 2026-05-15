import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/appError';

export interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  // Prefer httpOnly cookie; fall back to Authorization header for API clients / tests
  const cookieToken = req.cookies?.['accessToken'] as string | undefined;
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  const token = cookieToken ?? headerToken;
  if (!token) return next(new AppError('No token provided', 401, 'UNAUTHORIZED'));
  req.user = verifyAccessToken(token);
  next();
}

export function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.['accessToken'] as string | undefined;
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : undefined;
  const token = cookieToken ?? headerToken;
  if (token) {
    try { req.user = verifyAccessToken(token); } catch { /* ignore invalid/expired token */ }
  }
  next();
}
