import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';
import { generateContractPdf } from '@/lib/generate-contract-pdf';
import { getS3Client, getBucket, getPublicUrl } from '@/lib/tigris';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(
  _req: Request,
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
        buyerOrg: {
          include: {
            members: {
              where: { status: 'ACTIVE' },
              take: 1,
              include: { user: { select: { name: true, cpf: true } } },
            },
          },
        },
        sellerOrg: {
          include: {
            members: {
              where: { status: 'ACTIVE' },
              take: 1,
              include: { user: { select: { name: true, cpf: true } } },
            },
          },
        },
        product: { select: { id: true, name: true, type: true } },
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

    const proposal = room.proposals[0];
    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposta aceita nao encontrada' },
        { status: 404 }
      );
    }

    const buyerMember = room.buyerOrg.members[0];
    const sellerMember = room.sellerOrg.members[0];

    const now = new Date();

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        negotiationRoomId: room.id,
        proposalId: proposal.id,
        buyerOrgId: room.buyerOrgId,
        sellerOrgId: room.sellerOrgId,
        productId: room.product.id,
        pricePerUnit: proposal.pricePerUnit,
        quantity: proposal.quantity,
        unit: proposal.unit,
        deliveryType: proposal.deliveryType,
        deliveryAddress: proposal.deliveryAddress ?? undefined,
        deliveryDate: proposal.deliveryDate,
        paymentTerms: proposal.paymentTerms,
        notes: proposal.notes,
        approvedById: session.user.id,
        approvedAt: now,
      },
    });

    // Generate PDF
    const pdfBytes = await generateContractPdf({
      contractId: contract.id,
      buyerOrg: { name: room.buyerOrg.name, cnpj: room.buyerOrg.cnpj },
      sellerOrg: { name: room.sellerOrg.name, cnpj: room.sellerOrg.cnpj },
      buyerUser: {
        name: buyerMember?.user.name || 'N/A',
        cpf: buyerMember?.user.cpf || null,
      },
      sellerUser: {
        name: sellerMember?.user.name || 'N/A',
        cpf: sellerMember?.user.cpf || null,
      },
      product: { name: room.product.name, type: room.product.type },
      pricePerUnit: Number(proposal.pricePerUnit),
      quantity: proposal.quantity,
      unit: proposal.unit,
      deliveryType: proposal.deliveryType,
      deliveryDate: proposal.deliveryDate
        ? new Date(proposal.deliveryDate).toLocaleDateString('pt-BR')
        : null,
      paymentTerms: proposal.paymentTerms,
      notes: proposal.notes,
      approvedAt: now.toLocaleDateString('pt-BR'),
    });

    // Upload to Tigris
    const pdfKey = `contracts/${contract.id}/contrato.pdf`;
    await getS3Client().send(
      new PutObjectCommand({
        Bucket: getBucket(),
        Key: pdfKey,
        Body: Buffer.from(pdfBytes),
        ContentType: 'application/pdf',
      })
    );

    const pdfUrl = getPublicUrl(pdfKey);

    // Update contract with PDF info
    await prisma.contract.update({
      where: { id: contract.id },
      data: { pdfUrl, pdfKey },
    });

    // Create system message in chat
    await prisma.chatMessage.create({
      data: {
        negotiationRoomId: room.id,
        senderId: session.user.id,
        content: 'Contrato gerado pela iGrib. Aguardando assinaturas.',
        messageType: 'system',
      },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Admin approve POST error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
