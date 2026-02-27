import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const organizations = await prisma.organization.findMany({
      where: {
        type: { not: 'IGRIB' },
        ...(type === 'SELLER' || type === 'BUYER' ? { type } : {}),
      },
      include: {
        _count: {
          select: {
            members: true,
            products: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(organizations);
  } catch (error) {
    console.error('Admin organizations GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
