import prisma from '../prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding users...');
  const users = [
    { email: 'admin@example.com', password: 'password123', role: 'ADMIN' },
    { email: 'doctor@example.com', password: 'password123', role: 'DOCTOR' },
    { email: 'pharm@example.com', password: 'password123', role: 'PHARMACIST' },
    { email: 'patient@example.com', password: 'password123', role: 'PATIENT' },
  ];

  for (const u of users) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (existing) {
      console.log(`User ${u.email} exists, skipping`);
      continue;
    }
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.create({ data: { email: u.email, passwordHash, role: u.role as any } });
    console.log(`Created ${u.email}`);
  }

  console.log('Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
