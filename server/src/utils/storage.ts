import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { env } from '../config/env';

const UPLOAD_DIR = path.resolve(env.UPLOAD_DIR);
const MAX_WIDTH = 1200;
const THUMB_WIDTH = 400;

export async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function savePhoto(
  buffer: Buffer,
  filename: string,
): Promise<{ url: string; thumbUrl: string }> {
  const name = `${Date.now()}-${filename.replace(/\.[^.]+$/, '')}`;
  const fullPath = path.join(UPLOAD_DIR, `${name}.webp`);
  const thumbPath = path.join(UPLOAD_DIR, `${name}-thumb.webp`);

  await sharp(buffer).resize(MAX_WIDTH, undefined, { withoutEnlargement: true }).webp().toFile(fullPath);
  await sharp(buffer).resize(THUMB_WIDTH, undefined, { withoutEnlargement: true }).webp().toFile(thumbPath);

  return {
    url: `/uploads/${name}.webp`,
    thumbUrl: `/uploads/${name}-thumb.webp`,
  };
}

export async function deleteFile(relativePath: string) {
  try {
    const fullPath = path.resolve(relativePath.replace(/^\//, ''));
    await fs.unlink(fullPath);
  } catch {
    // ignore missing files
  }
}
