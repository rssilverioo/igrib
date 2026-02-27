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

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Verify access
    const room = await prisma.negotiationRoom.findUnique({
      where: { id: params.roomId },
      select: { buyerOrgId: true, sellerOrgId: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Sala nao encontrada' }, { status: 404 });
    }

    const userOrgIds = session.user.memberships.map((m) => m.organizationId);
    if (!userOrgIds.includes(room.buyerOrgId) && !userOrgIds.includes(room.sellerOrgId)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { negotiationRoomId: params.roomId },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
      take: limit,
    });

    return NextResponse.json({
      messages,
      nextCursor: messages.length === limit ? messages[messages.length - 1]?.id : null,
    });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
