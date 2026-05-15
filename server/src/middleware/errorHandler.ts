import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { message: err.message, code: err.code } });
  }

  logger.error({ err, stack: err.stack }, err.message);
  return res.status(500).json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
}
