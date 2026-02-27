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

    const products = await prisma.product.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        organization: { select: { id: true, name: true, cnpj: true } },
        images: { select: { url: true }, take: 1 },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Admin pending products GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
