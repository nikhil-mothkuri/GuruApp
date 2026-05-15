import { Router, type Router as IRouter } from 'express';
import { authenticate } from '../../middleware/auth';
import { favoritesService } from './favorites.service';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';

export const favoritesRouter: IRouter = Router();

favoritesRouter.use(authenticate);

favoritesRouter.get('/me/favorites', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const favorites = await favoritesService.getMyFavorites(req.user!.userId);
    res.json({ data: favorites });
  } catch (err) { next(err); }
});

favoritesRouter.post('/me/favorites/:guruId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const fav = await favoritesService.add(req.user!.userId, req.params['guruId'] as string);
    res.status(201).json({ data: fav });
  } catch (err) { next(err); }
});

favoritesRouter.delete('/me/favorites/:guruId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await favoritesService.remove(req.user!.userId, req.params['guruId'] as string);
    res.status(204).send();
  } catch (err) { next(err); }
});
