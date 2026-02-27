import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: {
        images: { orderBy: { order: 'asc' } },
        organization: { select: { id: true, name: true, city: true, state: true, cnpj: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { favorites: true, negotiations: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto nao encontrado' }, { status: 404 });
    }

    // Sellers can only see their own products
    const membership = session.user.memberships[0];
    if (membership?.organizationType === 'SELLER' && product.organizationId !== membership.organizationId) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    // Check if current user has favorited
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: params.productId,
        },
      },
    });

    return NextResponse.json({ ...product, isFavorited: !!favorite });
  } catch (error) {
    console.error('Product GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto nao encontrado' }, { status: 404 });
    }

    // Only organization members can edit
    const membership = session.user.memberships.find(
      (m) => m.organizationId === product.organizationId
    );
    if (!membership) {
      return NextResponse.json({ error: 'Sem permissao' }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, type, price, quantity, unit, location, specifications, status } = body;

    const updated = await prisma.product.update({
      where: { id: params.productId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(type && { type }),
        ...(price !== undefined && { price }),
        ...(quantity !== undefined && { quantity }),
        ...(unit && { unit }),
        ...(location && { location }),
        ...(specifications && { specifications }),
        ...(status && { status }),
      },
      include: {
        images: { orderBy: { order: 'asc' } },
        organization: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Product PATCH error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produto nao encontrado' }, { status: 404 });
    }

    // Only superadmin of the org can delete
    const membership = session.user.memberships.find(
      (m) =>
        m.organizationId === product.organizationId &&
        (m.roleType === 'SELLER_SUPERADMIN' || m.roleType === 'IGRIB_ADMIN')
    );
    if (!membership) {
      return NextResponse.json({ error: 'Apenas o administrador pode excluir produtos' }, { status: 403 });
    }

    await prisma.product.delete({ where: { id: params.productId } });

    return NextResponse.json({ message: 'Produto excluido com sucesso' });
  } catch (error) {
    console.error('Product DELETE error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
