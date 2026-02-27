import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const isAdmin = session.user.memberships.some(
      (m) => m.organizationType === 'IGRIB'
    );
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso restrito ao time iGrib' }, { status: 403 });
    }

    const rooms = await prisma.negotiationRoom.findMany({
      where: { status: 'PENDING_VALIDATION' },
      include: {
        buyerOrg: { select: { id: true, name: true, cnpj: true } },
        sellerOrg: { select: { id: true, name: true, cnpj: true } },
        product: {
          select: {
            id: true,
            name: true,
            type: true,
            price: true,
            unit: true,
            images: { select: { url: true }, take: 1 },
          },
        },
        proposals: {
          where: { status: 'ACCEPTED' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Admin pending GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
