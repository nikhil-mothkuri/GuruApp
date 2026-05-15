import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@guruapp.com' },
    update: {},
    create: { email: 'admin@guruapp.com', passwordHash, name: 'Admin', isAdmin: true, isGuru: false, isStudent: false },
  });

  // Guru users
  const guru1 = await prisma.user.upsert({
    where: { email: 'alice@guruapp.com' },
    update: {},
    create: { email: 'alice@guruapp.com', passwordHash, name: 'Alice Sharma', isGuru: true, isStudent: false, bio: 'Yoga & meditation instructor with 10 years experience.' },
  });

  const guru2 = await prisma.user.upsert({
    where: { email: 'bob@guruapp.com' },
    update: {},
    create: { email: 'bob@guruapp.com', passwordHash, name: 'Bob Chen', isGuru: true, isStudent: true, bio: 'Professional piano teacher and music theorist.' },
  });

  // Student user
  const student1 = await prisma.user.upsert({
    where: { email: 'student@guruapp.com' },
    update: {},
    create: { email: 'student@guruapp.com', passwordHash, name: 'Sam Student', isGuru: false, isStudent: true },
  });

  // Guru profiles
  const profile1 = await prisma.guruProfile.upsert({
    where: { userId: guru1.id },
    update: {},
    create: { userId: guru1.id, tagline: 'Transform your mind and body through yoga', ratingAvg: 4.8, ratingCount: 24 },
  });

  const profile2 = await prisma.guruProfile.upsert({
    where: { userId: guru2.id },
    update: {},
    create: { userId: guru2.id, tagline: 'Learn piano from beginner to advanced', ratingAvg: 4.5, ratingCount: 12 },
  });

  // Skills (upsert each — SQLite doesn't support createMany skipDuplicates)
  const skills = [
    { guruId: profile1.id, skillName: 'Yoga' },
    { guruId: profile1.id, skillName: 'Meditation' },
    { guruId: profile1.id, skillName: 'Breathing Techniques' },
    { guruId: profile2.id, skillName: 'Piano' },
    { guruId: profile2.id, skillName: 'Music Theory' },
    { guruId: profile2.id, skillName: 'Classical Music' },
  ];
  for (const s of skills) {
    await prisma.guruSkill.upsert({
      where: { guruId_skillName: { guruId: s.guruId, skillName: s.skillName } },
      update: {},
      create: s,
    });
  }

  // Availability slots (Mon–Fri, 9 AM)
  for (const day of [1, 2, 3, 4, 5]) {
    await prisma.availabilitySlot.upsert({
      where: { id: `slot-alice-${day}` },
      update: {},
      create: { id: `slot-alice-${day}`, guruId: profile1.id, dayOfWeek: day, startTime: '09:00', endTime: '10:00', slotDurationMins: 60 },
    });
  }

  for (const day of [2, 4, 6]) {
    await prisma.availabilitySlot.upsert({
      where: { id: `slot-bob-${day}` },
      update: {},
      create: { id: `slot-bob-${day}`, guruId: profile2.id, dayOfWeek: day, startTime: '15:00', endTime: '17:00', slotDurationMins: 60 },
    });
  }

  console.log('Seed complete. Accounts:');
  console.log('  admin@guruapp.com / password123 (Admin)');
  console.log('  alice@guruapp.com / password123 (Guru)');
  console.log('  bob@guruapp.com   / password123 (Guru + Student)');
  console.log('  student@guruapp.com / password123 (Student)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
