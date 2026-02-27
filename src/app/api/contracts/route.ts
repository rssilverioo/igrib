import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const userOrgIds = session.user.memberships.map((m) => m.organizationId);

    const contracts = await prisma.contract.findMany({
      where: {
        OR: [
          { buyerOrgId: { in: userOrgIds } },
          { sellerOrgId: { in: userOrgIds } },
        ],
      },
      include: {
        buyerOrg: { select: { id: true, name: true } },
        sellerOrg: { select: { id: true, name: true } },
        product: {
          select: {
            id: true,
            name: true,
            type: true,
            images: { select: { url: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Contracts GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
