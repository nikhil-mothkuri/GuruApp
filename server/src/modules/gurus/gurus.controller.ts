import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { gurusService } from './gurus.service';

export const gurusController = {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await gurusService.search(req.query as never);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async suggestions(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query['q'] as string) ?? '';
      const result = await gurusService.suggestions(q);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const guru = await gurusService.getById(req.params['id'] as string);
      res.json({ data: guru });
    } catch (err) {
      next(err);
    }
  },

  async getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await gurusService.getMyProfile(req.user!.userId);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },

  async upsertMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await gurusService.upsertMyProfile(req.user!.userId, req.body);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },

  async addSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const skill = await gurusService.addSkill(req.user!.userId, req.body);
      res.status(201).json({ data: skill });
    } catch (err) {
      next(err);
    }
  },

  async deleteSkill(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await gurusService.deleteSkill(req.user!.userId, req.params['skillId'] as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async addPhoto(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) return next(new Error('No file uploaded'));
      const photo = await gurusService.addPhoto(
        req.user!.userId,
        req.file.buffer,
        req.file.originalname,
        req.body.caption as string | undefined,
      );
      res.status(201).json({ data: photo });
    } catch (err) {
      next(err);
    }
  },

  async deletePhoto(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await gurusService.deletePhoto(req.user!.userId, req.params['photoId'] as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async addVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const video = await gurusService.addVideo(req.user!.userId, req.body);
      res.status(201).json({ data: video });
    } catch (err) {
      next(err);
    }
  },

  async deleteVideo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await gurusService.deleteVideo(req.user!.userId, req.params['videoId'] as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async uploadBanner(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) return next(new Error('No file uploaded'));
      const profile = await gurusService.uploadBanner(req.user!.userId, req.file.buffer, req.file.originalname);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },

  async submitInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const inquiry = await gurusService.submitInquiry(req.params['id'] as string, req.body);
      res.status(201).json({ data: inquiry });
    } catch (err) {
      next(err);
    }
  },
};
