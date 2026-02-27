import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import prisma from './prisma';

export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}

export async function getUserOrg(userId: string, orgType?: 'BUYER' | 'SELLER' | 'IGRIB') {
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      ...(orgType ? { organization: { type: orgType } } : {}),
    },
    include: { organization: true },
  });
  return membership;
}

export async function getUserMemberships(userId: string) {
  return prisma.organizationMember.findMany({
    where: { userId, status: 'ACTIVE' },
    include: { organization: true },
  });
}
