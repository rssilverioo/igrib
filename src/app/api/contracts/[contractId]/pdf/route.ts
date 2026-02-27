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
      select: { buyerOrgId: true, sellerOrgId: true, pdfUrl: true },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contrato nao encontrado' }, { status: 404 });
    }

    const userOrgIds = session.user.memberships.map((m) => m.organizationId);
    const isIgrib = session.user.memberships.some((m) => m.organizationType === 'IGRIB');
    const isParticipant =
      userOrgIds.includes(contract.buyerOrgId) ||
      userOrgIds.includes(contract.sellerOrgId);

    if (!isParticipant && !isIgrib) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    if (!contract.pdfUrl) {
      return NextResponse.json({ error: 'PDF nao disponivel' }, { status: 404 });
    }

    return NextResponse.json({ url: contract.pdfUrl });
  } catch (error) {
    console.error('Contract PDF GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
