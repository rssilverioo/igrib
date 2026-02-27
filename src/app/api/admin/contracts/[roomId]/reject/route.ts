import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function POST(
  req: Request,
  { params }: { params: { roomId: string } }
) {
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

    const room = await prisma.negotiationRoom.findUnique({
      where: { id: params.roomId },
      include: {
        proposals: {
          where: { status: 'ACCEPTED' },
          take: 1,
        },
      },
    });

    if (!room || room.status !== 'PENDING_VALIDATION') {
      return NextResponse.json(
        { error: 'Sala nao encontrada ou nao esta pendente de validacao' },
        { status: 404 }
      );
    }

    const { reason } = await req.json().catch(() => ({ reason: undefined }));

    // Revert room status to IN_PROGRESS
    await prisma.negotiationRoom.update({
      where: { id: params.roomId },
      data: { status: 'IN_PROGRESS' },
    });

    // Reject the accepted proposal
    const proposal = room.proposals[0];
    if (proposal) {
      await prisma.proposal.update({
        where: { id: proposal.id },
        data: { status: 'REJECTED' },
      });
    }

    // System message with reason
    const message = reason
      ? `Proposta rejeitada pela iGrib. Motivo: ${reason}`
      : 'Proposta rejeitada pela iGrib.';

    await prisma.chatMessage.create({
      data: {
        negotiationRoomId: params.roomId,
        senderId: session.user.id,
        content: message,
        messageType: 'system',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin reject POST error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
