import { prisma } from '~/config/prisma';

export async function truncateAll() {
  const isPostgres = (process.env['DATABASE_URL'] ?? '').startsWith('postgresql');

  if (isPostgres) {
    // Single round-trip: much faster than 14 separate deleteMany against a remote DB
    await prisma.$executeRawUnsafe(
      `TRUNCATE "OrderItem","Order","RefreshToken","Rating","Booking","Favorite",` +
      `"GuruSkill","GuruPhoto","GuruVideo","AvailabilitySlot","ProductImage","Product",` +
      `"GuruProfile","User" CASCADE`,
    );
  } else {
    // SQLite does not support TRUNCATE — use sequential deleteMany in FK order
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
}
