import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create IGRIB organization
  const org = await prisma.organization.upsert({
    where: { cnpj: '00000000000100' },
    update: {},
    create: {
      name: 'iGrib',
      type: 'IGRIB',
      cnpj: '00000000000100',
      email: 'admin@igrib.com',
      phone: '11999999999',
      city: 'Sao Paulo',
      state: 'SP',
      country: 'BR',
    },
  });
  console.log('IGRIB org created:', org.id);

  // 2. Create admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@igrib.com' },
    update: {},
    create: {
      name: 'Admin iGrib',
      email: 'admin@igrib.com',
      passwordHash,
      cpf: '00000000000',
    },
  });
  console.log('Admin user created:', user.id);

  // 3. Create membership
  const membership = await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: user.id,
      roleType: 'IGRIB_ADMIN',
      status: 'ACTIVE',
      joinedAt: new Date(),
    },
  });
  console.log('Membership created:', membership.id);

  console.log('\n--- Admin login credentials ---');
  console.log('Email: admin@igrib.com');
  console.log('Password: admin123');
  console.log('URL: /dashboard/admin');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
