import multer from 'multer';
import { env } from '../config/env';
import { AppError } from '../utils/appError';

const MAX_SIZE = env.MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter(_req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPEG, PNG, WebP, or GIF images are allowed', 400, 'INVALID_FILE_TYPE'));
    }
  },
});
