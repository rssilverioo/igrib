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

    const [
      totalOrgs,
      buyerOrgs,
      sellerOrgs,
      totalProducts,
      activeProducts,
      pendingApprovalProducts,
      draftProducts,
      totalNegotiations,
      activeNegotiations,
      pendingValidationNegotiations,
      completedNegotiations,
      totalContracts,
      pendingSigsContracts,
      signedContracts,
      totalValueResult,
    ] = await Promise.all([
      prisma.organization.count({ where: { type: { not: 'IGRIB' } } }),
      prisma.organization.count({ where: { type: 'BUYER' } }),
      prisma.organization.count({ where: { type: 'SELLER' } }),
      prisma.product.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { status: 'PENDING_APPROVAL' } }),
      prisma.product.count({ where: { status: 'DRAFT' } }),
      prisma.negotiationRoom.count(),
      prisma.negotiationRoom.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS', 'PROPOSAL_SENT', 'COUNTER_PROPOSAL'] } },
      }),
      prisma.negotiationRoom.count({ where: { status: 'PENDING_VALIDATION' } }),
      prisma.negotiationRoom.count({ where: { status: 'COMPLETED' } }),
      prisma.contract.count(),
      prisma.contract.count({ where: { status: 'PENDING_SIGNATURES' } }),
      prisma.contract.count({ where: { status: 'SIGNED' } }),
      prisma.contract.aggregate({
        _sum: {
          pricePerUnit: true,
        },
        where: { status: 'SIGNED' },
      }),
    ]);

    // Calculate total value from signed contracts (price * quantity)
    const signedContractsWithValues = await prisma.contract.findMany({
      where: { status: 'SIGNED' },
      select: { pricePerUnit: true, quantity: true },
    });

    const totalValue = signedContractsWithValues.reduce(
      (sum, c) => sum + Number(c.pricePerUnit) * c.quantity,
      0
    );

    return NextResponse.json({
      organizations: { total: totalOrgs, buyers: buyerOrgs, sellers: sellerOrgs },
      products: {
        total: totalProducts,
        active: activeProducts,
        pendingApproval: pendingApprovalProducts,
        draft: draftProducts,
      },
      negotiations: {
        total: totalNegotiations,
        active: activeNegotiations,
        pendingValidation: pendingValidationNegotiations,
        completed: completedNegotiations,
      },
      contracts: {
        total: totalContracts,
        pendingSigs: pendingSigsContracts,
        signed: signedContracts,
        totalValue,
      },
    });
  } catch (error) {
    console.error('Admin stats GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
