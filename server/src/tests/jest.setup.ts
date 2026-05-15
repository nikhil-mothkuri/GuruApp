import { truncateAll } from './helpers/db';

beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  const { prisma } = await import('~/config/prisma');
  await prisma.$disconnect();
});
