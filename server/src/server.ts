import 'dotenv/config';
import { initSentry } from './config/sentry';
initSentry(); // must be called before createApp so Sentry instruments Express
import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { logger } from './utils/logger';
import { ensureUploadDir } from './utils/storage';

async function main() {
  await ensureUploadDir();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    logger.info('Shutting down...');
    server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
