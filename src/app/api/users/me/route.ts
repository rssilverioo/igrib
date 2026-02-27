import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        cpf: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        memberships: {
          where: { status: 'ACTIVE' },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                type: true,
                cnpj: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('User GET error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
