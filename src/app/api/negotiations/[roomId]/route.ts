import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function GET(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const room = await prisma.negotiationRoom.findUnique({
      where: { id: params.roomId },
      include: {
        product: {
          include: {
            images: { orderBy: { order: 'asc' } },
            organization: { select: { id: true, name: true } },
          },
        },
        buyerOrg: { select: { id: true, name: true, cnpj: true } },
        sellerOrg: { select: { id: true, name: true, cnpj: true } },
        proposals: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: { select: { messages: true, proposals: true } },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Sala nao encontrada' }, { status: 404 });
    }

    // Check if user belongs to either org
    const userOrgIds = session.user.memberships.map((m) => m.organizationId);
    if (!userOrgIds.includes(room.buyerOrgId) && !userOrgIds.includes(room.sellerOrgId)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    return NextResponse.json(room);
  } catch (error) {
    console.error('Negotiation GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const room = await prisma.negotiationRoom.findUnique({
      where: { id: params.roomId },
    });

    if (!room) {
      return NextResponse.json({ error: 'Sala nao encontrada' }, { status: 404 });
    }

    const userOrgIds = session.user.memberships.map((m) => m.organizationId);
    if (!userOrgIds.includes(room.buyerOrgId) && !userOrgIds.includes(room.sellerOrgId)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    const { status } = await req.json();

    const updated = await prisma.negotiationRoom.update({
      where: { id: params.roomId },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Negotiation PATCH error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
