import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from './appError';

export type JwtPayload = { userId: string; email: string };

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  // jti (JWT ID) ensures uniqueness even when issued within the same second
  return jwt.sign(
    { ...payload, jti: crypto.randomBytes(8).toString('hex') },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions,
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch {
    throw new AppError('Invalid or expired access token', 401, 'UNAUTHORIZED');
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'UNAUTHORIZED');
  }
}
