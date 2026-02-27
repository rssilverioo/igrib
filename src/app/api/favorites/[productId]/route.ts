import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/get-session';

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        productId: params.productId,
      },
    });

    return NextResponse.json({ message: 'Favorito removido' });
  } catch (error) {
    console.error('Favorite DELETE error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
