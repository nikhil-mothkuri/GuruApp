import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { gurusRouter } from './modules/gurus/gurus.routes';
import { bookingsRouter } from './modules/bookings/bookings.routes';
import { favoritesRouter } from './modules/favorites/favorites.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { productsRouter } from './modules/products/products.routes';
import { ordersRouter } from './modules/orders/orders.routes';

export interface AppOptions {
  skipRateLimiting?: boolean;
}

export function createApp(opts: AppOptions = {}): Express {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173', credentials: true }));
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Serve uploaded files
  app.use('/uploads', express.static(path.resolve('uploads')));

  if (!opts.skipRateLimiting) {
    // General rate limit
    app.use(rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true, legacyHeaders: false }));

    // Tighter limit on auth routes
    const authLimit = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false });
    app.use('/api/auth', authLimit);
  }

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/gurus', gurusRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/students', favoritesRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use(errorHandler);

  return app;
}
