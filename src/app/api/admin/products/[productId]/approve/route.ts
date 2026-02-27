import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
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

    const { productId } = await params;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Produto nao encontrado' }, { status: 404 });
    }
    if (product.status !== 'PENDING_APPROVAL') {
      return NextResponse.json({ error: 'Produto nao esta pendente de aprovacao' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: 'ACTIVE' },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Admin approve product error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
