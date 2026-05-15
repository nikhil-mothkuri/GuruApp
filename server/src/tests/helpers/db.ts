import { prisma } from '~/config/prisma';

export async function truncateAll() {
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.guruSkill.deleteMany({});
  await prisma.guruPhoto.deleteMany({});
  await prisma.guruVideo.deleteMany({});
  await prisma.availabilitySlot.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.guruProfile.deleteMany({});
  await prisma.user.deleteMany({});
}
