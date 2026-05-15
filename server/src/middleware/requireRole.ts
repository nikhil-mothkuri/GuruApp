import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../config/prisma';
import { AppError } from '../utils/appError';

function requireRole(field: 'isGuru' | 'isStudent' | 'isAdmin') {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || !user[field]) {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    }
    next();
  };
}

export const requireGuru = () => requireRole('isGuru');
export const requireAdmin = () => requireRole('isAdmin');
