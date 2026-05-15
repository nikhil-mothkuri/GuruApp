import { truncateAll } from './helpers/db';

// Cover both test and hook timeouts for remote Neon (200-500ms/query vs instant SQLite)
jest.setTimeout(30000);

beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  const { prisma } = await import('~/config/prisma');
  await prisma.$disconnect();
});
