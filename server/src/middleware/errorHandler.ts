import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import multer from 'multer';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { message: err.message, code: err.code } });
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `File too large. Maximum size is ${process.env['MAX_FILE_SIZE_MB'] ?? 5} MB.`
        : err.message;
    return res.status(400).json({ error: { message, code: err.code } });
  }

  logger.error({ err, stack: err.stack }, err.message);
  return res
    .status(500)
    .json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } });
}
