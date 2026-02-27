import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const membership = session.user.memberships[0];
    if (!membership) {
      return NextResponse.json({ error: 'Sem organizacao ativa' }, { status: 403 });
    }

    const isBuyer = membership.organizationType === 'BUYER';

    const negotiations = await prisma.negotiationRoom.findMany({
      where: isBuyer
        ? { buyerOrgId: membership.organizationId }
        : { sellerOrgId: membership.organizationId },
      include: {
        product: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
          },
        },
        buyerOrg: { select: { id: true, name: true } },
        sellerOrg: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, name: true } } },
        },
        _count: { select: { messages: true, proposals: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(negotiations);
  } catch (error) {
    console.error('Negotiations GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const buyerMembership = session.user.memberships.find(
      (m) => m.organizationType === 'BUYER'
    );
    if (!buyerMembership) {
      return NextResponse.json(
        { error: 'Apenas compradores podem iniciar negociacoes' },
        { status: 403 }
      );
    }

    const { productId, deliveryType, requestedQty, deliveryDate, deliveryAddress } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'productId obrigatorio' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { organizationId: true, status: true },
    });

    if (!product || product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Produto nao encontrado ou inativo' }, { status: 404 });
    }

    // Check if negotiation already exists
    const existing = await prisma.negotiationRoom.findUnique({
      where: {
        buyerOrgId_sellerOrgId_productId: {
          buyerOrgId: buyerMembership.organizationId,
          sellerOrgId: product.organizationId,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const room = await prisma.negotiationRoom.create({
      data: {
        buyerOrgId: buyerMembership.organizationId,
        sellerOrgId: product.organizationId,
        productId,
        deliveryType: deliveryType || null,
        requestedQty: requestedQty || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        deliveryAddress: deliveryAddress || null,
        status: 'OPEN',
      },
      include: {
        product: {
          include: { images: { orderBy: { order: 'asc' }, take: 1 } },
        },
        buyerOrg: { select: { id: true, name: true } },
        sellerOrg: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Negotiation POST error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
