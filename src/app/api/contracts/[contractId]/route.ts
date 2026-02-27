import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function GET(
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
      include: {
        buyerOrg: { select: { id: true, name: true, cnpj: true } },
        sellerOrg: { select: { id: true, name: true, cnpj: true } },
        product: {
          select: {
            id: true,
            name: true,
            type: true,
            images: { select: { url: true }, take: 1 },
          },
        },
        approvedBy: { select: { name: true } },
        buyerSignedBy: { select: { name: true } },
        sellerSignedBy: { select: { name: true } },
      },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contrato nao encontrado' }, { status: 404 });
    }

    // Auth: user must belong to buyer/seller org or be IGRIB
    const userOrgIds = session.user.memberships.map((m) => m.organizationId);
    const isIgrib = session.user.memberships.some((m) => m.organizationType === 'IGRIB');
    const isParticipant =
      userOrgIds.includes(contract.buyerOrgId) ||
      userOrgIds.includes(contract.sellerOrgId);

    if (!isParticipant && !isIgrib) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Contract GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
