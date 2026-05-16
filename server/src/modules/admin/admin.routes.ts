import { Router, type Router as IRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/requireRole';
import { prisma } from '../../config/prisma';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';

export const adminRouter: IRouter = Router();

adminRouter.use(authenticate, requireAdmin());

adminRouter.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' as const },
        select: {
          id: true,
          email: true,
          name: true,
          isGuru: true,
          isStudent: true,
          isAdmin: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);
    res.json({ data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/users/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isActive, isGuru, isStudent } = req.body as {
      isActive?: boolean;
      isGuru?: boolean;
      isStudent?: boolean;
    };
    const user = await prisma.user.update({
      where: { id: req.params['id'] as string },
      data: { isActive, isGuru, isStudent },
    });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

adminRouter.get('/metrics', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalBookings, totalRatings, activeGurus] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.rating.count(),
      prisma.user.count({ where: { isGuru: true, isActive: true } }),
    ]);
    res.json({ data: { totalUsers, totalBookings, totalRatings, activeGurus } });
  } catch (err) {
    next(err);
  }
});
