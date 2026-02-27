import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function POST(
  _req: Request,
  { params }: { params: { contractId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const contract = await prisma.contract.findUnique({
      where: { id: params.contractId },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contrato nao encontrado' }, { status: 404 });
    }

    if (contract.status === 'SIGNED' || contract.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Contrato ja finalizado' },
        { status: 400 }
      );
    }

    const userOrgIds = session.user.memberships.map((m) => m.organizationId);
    const isBuyer = userOrgIds.includes(contract.buyerOrgId);
    const isSeller = userOrgIds.includes(contract.sellerOrgId);

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    const now = new Date();
    const updateData: Record<string, unknown> = {};

    if (isBuyer) {
      if (contract.buyerSignedById) {
        return NextResponse.json(
          { error: 'Comprador ja assinou' },
          { status: 400 }
        );
      }
      updateData.buyerSignedById = session.user.id;
      updateData.buyerSignedAt = now;

      // Check if seller already signed
      if (contract.sellerSignedById) {
        updateData.status = 'SIGNED';
      } else {
        updateData.status = 'BUYER_SIGNED';
      }
    } else {
      if (contract.sellerSignedById) {
        return NextResponse.json(
          { error: 'Vendedor ja assinou' },
          { status: 400 }
        );
      }
      updateData.sellerSignedById = session.user.id;
      updateData.sellerSignedAt = now;

      // Check if buyer already signed
      if (contract.buyerSignedById) {
        updateData.status = 'SIGNED';
      } else {
        updateData.status = 'SELLER_SIGNED';
      }
    }

    const updated = await prisma.contract.update({
      where: { id: params.contractId },
      data: updateData,
    });

    // If both signed, complete the room
    if (updated.status === 'SIGNED') {
      await prisma.negotiationRoom.update({
        where: { id: contract.negotiationRoomId },
        data: { status: 'COMPLETED' },
      });

      await prisma.chatMessage.create({
        data: {
          negotiationRoomId: contract.negotiationRoomId,
          senderId: session.user.id,
          content: 'Contrato assinado por ambas as partes. Negociacao concluida!',
          messageType: 'system',
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Contract sign POST error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
