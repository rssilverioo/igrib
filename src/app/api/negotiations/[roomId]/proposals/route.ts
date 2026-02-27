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
      select: { buyerOrgId: true, sellerOrgId: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Sala nao encontrada' }, { status: 404 });
    }

    const userOrgIds = session.user.memberships.map((m) => m.organizationId);
    if (!userOrgIds.includes(room.buyerOrgId) && !userOrgIds.includes(room.sellerOrgId)) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    const proposals = await prisma.proposal.findMany({
      where: { negotiationRoomId: params.roomId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(proposals);
  } catch (error) {
    console.error('Proposals GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(
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
      select: { buyerOrgId: true, sellerOrgId: true },
    });

    if (!room) {
      return NextResponse.json({ error: 'Sala nao encontrada' }, { status: 404 });
    }

    const userOrgIds = session.user.memberships.map((m) => m.organizationId);
    const creatorOrgId = userOrgIds.find(
      (id) => id === room.buyerOrgId || id === room.sellerOrgId
    );

    if (!creatorOrgId) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    const {
      pricePerUnit,
      quantity,
      unit,
      deliveryType,
      deliveryAddress,
      deliveryDate,
      paymentTerms,
      notes,
      parentProposalId,
    } = await req.json();

    if (!pricePerUnit || !quantity || !deliveryType) {
      return NextResponse.json({ error: 'Campos obrigatorios faltando' }, { status: 400 });
    }

    const proposal = await prisma.proposal.create({
      data: {
        negotiationRoomId: params.roomId,
        createdByOrgId: creatorOrgId,
        pricePerUnit,
        quantity,
        unit: unit || 'sacas',
        deliveryType,
        deliveryAddress: deliveryAddress || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        paymentTerms: paymentTerms || null,
        notes: notes || null,
        parentProposalId: parentProposalId || null,
        status: 'SENT',
      },
    });

    // Update negotiation room status
    await prisma.negotiationRoom.update({
      where: { id: params.roomId },
      data: {
        status: parentProposalId ? 'COUNTER_PROPOSAL' : 'PROPOSAL_SENT',
      },
    });

    // Create system message about the proposal
    await prisma.chatMessage.create({
      data: {
        negotiationRoomId: params.roomId,
        senderId: session.user.id,
        content: `Nova proposta enviada: R$ ${pricePerUnit}/unidade x ${quantity} ${unit || 'sacas'}`,
        messageType: 'proposal_notification',
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error) {
    console.error('Proposal POST error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
