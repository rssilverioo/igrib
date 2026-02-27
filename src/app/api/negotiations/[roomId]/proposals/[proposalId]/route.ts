import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function PATCH(
  req: Request,
  { params }: { params: { roomId: string; proposalId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const proposal = await prisma.proposal.findUnique({
      where: { id: params.proposalId },
      include: {
        negotiationRoom: {
          select: { buyerOrgId: true, sellerOrgId: true },
        },
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: 'Proposta nao encontrada' }, { status: 404 });
    }

    // Only the OTHER org (not the creator) can accept/reject
    const userOrgIds = session.user.memberships.map((m) => m.organizationId);
    const isCreator = userOrgIds.includes(proposal.createdByOrgId);

    if (isCreator) {
      return NextResponse.json(
        { error: 'Voce nao pode aceitar/rejeitar sua propria proposta' },
        { status: 403 }
      );
    }

    const isParticipant =
      userOrgIds.includes(proposal.negotiationRoom.buyerOrgId) ||
      userOrgIds.includes(proposal.negotiationRoom.sellerOrgId);

    if (!isParticipant) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    const { status } = await req.json();

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Status invalido' }, { status: 400 });
    }

    const updated = await prisma.proposal.update({
      where: { id: params.proposalId },
      data: { status },
    });

    // Update negotiation room status
    const roomStatus = status === 'ACCEPTED' ? 'PENDING_VALIDATION' : 'REJECTED';
    await prisma.negotiationRoom.update({
      where: { id: params.roomId },
      data: { status: roomStatus },
    });

    // Create system message
    const statusText = status === 'ACCEPTED'
      ? 'aceita. Aguardando validacao da iGrib.'
      : 'rejeitada';
    await prisma.chatMessage.create({
      data: {
        negotiationRoomId: params.roomId,
        senderId: session.user.id,
        content: `Proposta ${statusText}`,
        messageType: 'system',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Proposal PATCH error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
